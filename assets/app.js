// SUS CHURCH - Main application logic

// State management
const STATE_KEY = 'sus_state_v1';

const DEFAULT_STATE = {
  lang: 'en',
  counters: {
    baptize: 0,
    seal: 0,
    donateClicks: 0,
    confessions: 0,
    earn: 0
  },
  wallet: {
    suscoin: 3
  },
  flags: {
    glitch: false
  },
  confessions: [],
  achievements: {},
  lastEarnTime: 0,
  terminalHistory: [],
  terminalHistoryIndex: -1
};

let appState = { ...DEFAULT_STATE };

// Shop items
const SHOP_ITEMS = {
  'ratfood': { id: 'ratfood', name: '🐁 Rat Food Pack', price: 5 },
  'blessing': { id: 'blessing', name: '🐀 Blessing Scroll', price: 10 },
  'fragment': { id: 'fragment', name: '🦡 Memory Fragment', price: 15 },
  'vessel': { id: 'vessel', name: '🐇 Empty Vessel', price: 20 },
  'echo': { id: 'echo', name: '🦨 Echo Resonance', price: 25 }
};

// Titles for bless command
const TITLES = [
  'Void-Touched Vessel', 'Glitch Apostle', 'Redacted Flame',
  'Echo Carrier', 'Resonant Shell', 'Blessed [0x4F3C]',
  'Fractal Witness', 'Recursive Echo', 'Sealed Loop'
];

// Load state from localStorage
function loadState() {
  try {
    const saved = localStorage.getItem(STATE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      appState = { ...DEFAULT_STATE, ...parsed };
      // Ensure all required fields exist
      appState.counters = { ...DEFAULT_STATE.counters, ...(parsed.counters || {}) };
      appState.wallet = { ...DEFAULT_STATE.wallet, ...(parsed.wallet || {}) };
      appState.flags = { ...DEFAULT_STATE.flags, ...(parsed.flags || {}) };
      appState.confessions = parsed.confessions || [];
      appState.achievements = parsed.achievements || {};
      appState.lastEarnTime = parsed.lastEarnTime || 0;
      appState.terminalHistory = parsed.terminalHistory || [];
      appState.terminalHistoryIndex = -1;
    }
  } catch (e) {
    console.error('Failed to load state:', e);
    appState = { ...DEFAULT_STATE };
  }
  return appState;
}

// Save state to localStorage
function saveState() {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(appState));
  } catch (e) {
    console.error('Failed to save state:', e);
  }
}

// Check and update achievements
function checkAchievements() {
  const ach = appState.achievements;
  
  if (appState.counters.baptize >= 1 && !ach.firstBaptism) {
    ach.firstBaptism = true;
    addLog(t('susbank.achievement.firstBaptism'), 'system');
  }
  
  if (appState.counters.seal >= 7 && !ach.loopSealer) {
    ach.loopSealer = true;
    addLog(t('susbank.achievement.loopSealer'), 'system');
  }
  
  if (appState.counters.confessions >= 3 && !ach.confessor) {
    ach.confessor = true;
    addLog(t('susbank.achievement.confessor'), 'system');
  }
  
  if (appState.counters.earn >= 5 && !ach.ratFeeder) {
    ach.ratFeeder = true;
    addLog(t('susbank.achievement.ratFeeder'), 'system');
  }
  
  if (appState.flags.glitch && !ach.glitchApostle) {
    ach.glitchApostle = true;
    addLog(t('susbank.achievement.glitchApostle'), 'system');
  }
  
  saveState();
  updateUI();
}

// Terminal output management
const MAX_TERMINAL_LINES = 200;
let terminalLineCount = 0;

function addLog(text, type = 'output') {
  const termOut = document.getElementById('termOut');
  if (!termOut) return;
  
  const line = document.createElement('div');
  line.className = `terminal-line ${type}`;
  
  termOut.appendChild(line);
  terminalLineCount++;
  
  // Remove oldest lines if over limit
  while (terminalLineCount > MAX_TERMINAL_LINES) {
    const first = termOut.firstChild;
    if (first) {
      termOut.removeChild(first);
      terminalLineCount--;
    }
  }
  
  // User input (prompt type) shows immediately, no animation
  if (type === 'prompt') {
    line.textContent = text;
    termOut.scrollTop = termOut.scrollHeight;
    return;
  }
  
  // Terminal replies: delay 2-5 seconds, then type one character at a time
  const delay = 2000 + Math.random() * 3000; // 2-5 seconds
  const chars = text.split('');
  let charIndex = 0;
  
  setTimeout(() => {
    const typeInterval = setInterval(() => {
      if (charIndex < chars.length) {
        line.textContent += chars[charIndex];
        charIndex++;
        // Scroll to bottom during typing
        termOut.scrollTop = termOut.scrollHeight;
      } else {
        clearInterval(typeInterval);
      }
    }, 30); // ~33 chars per second typing speed
  }, delay);
}

// Terminal command processing
function processCommand(cmd) {
  if (!cmd || !cmd.trim()) return;
  
  const parts = cmd.trim().split(/\s+/);
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);
  
  // Add to history
  appState.terminalHistory.push(cmd);
  if (appState.terminalHistory.length > 50) {
    appState.terminalHistory.shift();
  }
  appState.terminalHistoryIndex = -1;
  saveState();
  
  switch (command) {
    case 'help':
      addLog(t('terminal.commands.help'));
      break;
      
    case 'about':
      addLog(t('terminal.commands.about'));
      break;
      
    case 'lang':
      if (args.length === 0 || !['en', 'zh', 'jp'].includes(args[0])) {
        addLog(t('terminal.commands.lang.usage'), 'error');
      } else {
        const lang = args[0];
        appState.lang = lang;
        saveState();
        applyLang(lang);
        addLog(tReplace(t('terminal.commands.lang.changed'), { lang }));
      }
      break;
      
    case 'baptize':
      appState.counters.baptize++;
      saveState();
      addLog(t('terminal.commands.baptize.success'));
      checkAchievements();
      updateUI();
      break;
      
    case 'seal':
      appState.counters.seal++;
      saveState();
      addLog(tReplace(t('terminal.commands.seal.success'), { count: appState.counters.seal }));
      checkAchievements();
      updateUI();
      break;
      
    case 'bless':
      const titleIndex = appState.counters.seal % TITLES.length;
      const title = TITLES[titleIndex];
      addLog(tReplace(t('terminal.commands.bless.result'), { title }));
      break;
      
    case 'donate':
      appState.counters.donateClicks++;
      saveState();
      addLog('0xb22E0cfe0Efd4A2f0Cd5BE961deede60525D63D3');
      addLog(t('terminal.commands.donate.printed'));
      updateUI();
      break;
      
    case 'copy':
      copyAddress().then(() => {
        addLog(t('terminal.commands.copy.success'));
      }).catch(() => {
        addLog(t('terminal.commands.copy.failed'), 'error');
      });
      break;
      
    case 'balance':
      addLog(tReplace(t('terminal.commands.balance'), { balance: appState.wallet.suscoin }));
      break;
      
    case 'earn':
      const now = Date.now();
      const cooldownMs = 60000; // 60 seconds
      const timeSinceLastEarn = now - appState.lastEarnTime;
      
      if (timeSinceLastEarn < cooldownMs) {
        const remaining = Math.ceil((cooldownMs - timeSinceLastEarn) / 1000);
        addLog(tReplace(t('terminal.commands.earn.cooldown'), { remaining }), 'error');
      } else {
        appState.wallet.suscoin++;
        appState.counters.earn++;
        appState.lastEarnTime = now;
        saveState();
        addLog(tReplace(t('terminal.commands.earn.success'), { cooldown: 60 }));
        checkAchievements();
        updateUI();
      }
      break;
      
    case 'shop':
      addLog(t('terminal.commands.shop.title'));
      Object.values(SHOP_ITEMS).forEach(item => {
        addLog(tReplace(t('terminal.commands.shop.item'), {
          name: item.name,
          price: item.price,
          id: item.id
        }));
      });
      break;
      
    case 'buy':
      if (args.length === 0) {
        addLog(t('terminal.commands.buy.usage'), 'error');
        break;
      }
      const itemId = args[0].toLowerCase();
      const item = SHOP_ITEMS[itemId];
      if (!item) {
        addLog(t('terminal.commands.buy.invalid'), 'error');
        break;
      }
      if (appState.wallet.suscoin < item.price) {
        addLog(tReplace(t('terminal.commands.buy.insufficient'), { balance: appState.wallet.suscoin }), 'error');
        break;
      }
      appState.wallet.suscoin -= item.price;
      saveState();
      addLog(tReplace(t('terminal.commands.buy.success'), { name: item.name, price: item.price }));
      updateUI();
      break;
      
    case 'confess':
      if (args.length === 0) {
        addLog(t('terminal.commands.confess.usage'));
        break;
      }
      const text = args.join(' ');
      addConfession(text, true);
      break;
      
    case 'list':
      if (appState.confessions.length === 0) {
        addLog(t('terminal.commands.list.empty'));
      } else {
        addLog(tReplace(t('terminal.commands.list.header'), { count: appState.confessions.length }));
        appState.confessions.forEach(conf => {
          const date = new Date(conf.ts).toLocaleString();
          addLog(tReplace(t('terminal.commands.list.item'), {
            id: conf.id,
            date,
            text: conf.text
          }));
        });
      }
      break;
      
    case 'del':
      if (args.length === 0) {
        addLog(t('terminal.commands.del.usage'), 'error');
        break;
      }
      const idToDelete = args[0];
      const index = appState.confessions.findIndex(c => c.id === idToDelete);
      if (index === -1) {
        addLog(tReplace(t('terminal.commands.del.notFound'), { id: idToDelete }), 'error');
      } else {
        appState.confessions.splice(index, 1);
        appState.counters.confessions = Math.max(0, appState.counters.confessions - 1);
        saveState();
        addLog(tReplace(t('terminal.commands.del.success'), { id: idToDelete }));
        checkAchievements();
        updateUI();
      }
      break;
      
    case 'wipe':
      if (args.length === 0 || args[0] !== 'confirm') {
        addLog(t('terminal.commands.wipe.usage'), 'error');
        break;
      }
      appState.confessions = [];
      appState.counters.confessions = 0;
      saveState();
      addLog(t('terminal.commands.wipe.success'));
      checkAchievements();
      updateUI();
      break;
      
    case 'glitch':
      if (args.length === 0 || !['on', 'off'].includes(args[0])) {
        addLog(t('terminal.commands.glitch.usage'), 'error');
        break;
      }
      appState.flags.glitch = args[0] === 'on';
      saveState();
      document.body.classList.toggle('glitch', appState.flags.glitch);
      addLog(appState.flags.glitch ? t('terminal.commands.glitch.enabled') : t('terminal.commands.glitch.disabled'));
      checkAchievements();
      break;
      
    case 'export':
      if (args.length === 0 || !['json', 'txt'].includes(args[0])) {
        addLog(t('terminal.commands.export.usage'), 'error');
        break;
      }
      exportConfessions(args[0]);
      break;
      
    case 'clear':
      const termOut = document.getElementById('termOut');
      if (termOut) {
        termOut.innerHTML = '';
        terminalLineCount = 0;
      }
      break;
      
    default:
      addLog(tReplace(t('terminal.commands.unknown'), { cmd: command }), 'error');
  }
}

// Copy address to clipboard
async function copyAddress() {
  const address = '0xb22E0cfe0Efd4A2f0Cd5BE961deede60525D63D3';
  
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(address);
      return Promise.resolve();
    } catch (e) {
      // Fallback to selection method
    }
  }
  
  // Fallback: select and copy
  const textarea = document.createElement('textarea');
  textarea.value = address;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  textarea.style.pointerEvents = 'none';
  document.body.appendChild(textarea);
  textarea.select();
  
  try {
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    if (success) {
      return Promise.resolve();
    }
    return Promise.reject(new Error('Copy failed'));
  } catch (e) {
    document.body.removeChild(textarea);
    return Promise.reject(e);
  }
}

// Add confession
function addConfession(text, fromTerminal = false) {
  text = text.trim();
  
  if (text.length === 0) {
    if (fromTerminal) {
      addLog(t('terminal.commands.confess.tooShort'), 'error');
    }
    return false;
  }
  
  if (text.length > 500) {
    if (fromTerminal) {
      addLog(t('terminal.commands.confess.tooLong'), 'error');
    }
    return false;
  }
  
  const confession = {
    id: Math.random().toString(36).substring(2, 9),
    ts: Date.now(),
    text: text
  };
  
  appState.confessions.push(confession);
  appState.counters.confessions++;
  saveState();
  
  if (fromTerminal) {
    addLog(t('terminal.commands.confess.success'));
  }
  
  checkAchievements();
  updateUI();
  
  // Update confess form if exists
  const confessTextarea = document.getElementById('confessTextarea');
  if (confessTextarea) {
    confessTextarea.value = '';
  }
  
  renderConfessions();
  return true;
}

// Render confessions list
function renderConfessions() {
  const list = document.getElementById('confessList');
  if (!list) return;
  
  list.innerHTML = '';
  
  if (appState.confessions.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'confess-empty';
    empty.textContent = t('confess.empty');
    list.appendChild(empty);
    return;
  }
  
  appState.confessions.forEach(conf => {
    const item = document.createElement('li');
    item.className = 'confess-item';
    
    const header = document.createElement('div');
    header.className = 'confess-item-header';
    
    const id = document.createElement('span');
    id.className = 'confess-item-id';
    id.textContent = `[${conf.id}]`;
    
    const date = document.createElement('span');
    date.className = 'confess-item-date';
    date.textContent = new Date(conf.ts).toLocaleString();
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn';
    deleteBtn.textContent = t('confess.delete');
    deleteBtn.onclick = () => deleteConfession(conf.id);
    
    header.appendChild(id);
    header.appendChild(date);
    header.appendChild(deleteBtn);
    
    const text = document.createElement('div');
    text.className = 'confess-item-text';
    text.textContent = conf.text;
    
    item.appendChild(header);
    item.appendChild(text);
    list.appendChild(item);
  });
}

// Delete confession
function deleteConfession(id) {
  const index = appState.confessions.findIndex(c => c.id === id);
  if (index !== -1) {
    appState.confessions.splice(index, 1);
    appState.counters.confessions = Math.max(0, appState.counters.confessions - 1);
    saveState();
    checkAchievements();
    updateUI();
    renderConfessions();
  }
}

// Wipe all confessions
function wipeAllConfessions() {
  if (!confirm(t('confess.wipeConfirm'))) {
    return;
  }
  
  appState.confessions = [];
  appState.counters.confessions = 0;
  saveState();
  checkAchievements();
  updateUI();
  renderConfessions();
}

// Export confessions
function exportConfessions(format) {
  if (appState.confessions.length === 0) {
    addLog(t('terminal.commands.list.empty'));
    return;
  }
  
  let content, mimeType, ext;
  
  if (format === 'json') {
    content = JSON.stringify(appState.confessions, null, 2);
    mimeType = 'application/json';
    ext = 'json';
  } else {
    content = appState.confessions.map(c => {
      const date = new Date(c.ts).toLocaleString();
      return `[${c.id}] ${date}\n${c.text}\n${'='.repeat(50)}`;
    }).join('\n\n');
    mimeType = 'text/plain';
    ext = 'txt';
  }
  
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sus_confessions_${Date.now()}.${ext}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  addLog(tReplace(t('terminal.commands.export.success'), { filename: a.download }));
}

// Update UI elements
function updateUI() {
  // Update counters
  const baptizeEl = document.getElementById('counterBaptize');
  if (baptizeEl) baptizeEl.textContent = appState.counters.baptize;
  
  const sealEl = document.getElementById('counterSeal');
  if (sealEl) sealEl.textContent = appState.counters.seal;
  
  const confessionsEl = document.getElementById('counterConfessions');
  if (confessionsEl) confessionsEl.textContent = appState.counters.confessions;
  
  const earnEl = document.getElementById('counterEarn');
  if (earnEl) earnEl.textContent = appState.counters.earn;
  
  // Update balance
  const balanceEl = document.getElementById('balanceValue');
  if (balanceEl) balanceEl.textContent = appState.wallet.suscoin;
  
  // Update achievements
  const achievementsEl = document.getElementById('achievementsList');
  if (achievementsEl) {
    achievementsEl.innerHTML = '';
    const ach = appState.achievements;
    if (ach.firstBaptism) {
      const badge = document.createElement('span');
      badge.className = 'badge';
      badge.textContent = t('susbank.achievement.firstBaptism');
      achievementsEl.appendChild(badge);
    }
    if (ach.loopSealer) {
      const badge = document.createElement('span');
      badge.className = 'badge';
      badge.textContent = t('susbank.achievement.loopSealer');
      achievementsEl.appendChild(badge);
    }
    if (ach.confessor) {
      const badge = document.createElement('span');
      badge.className = 'badge';
      badge.textContent = t('susbank.achievement.confessor');
      achievementsEl.appendChild(badge);
    }
    if (ach.ratFeeder) {
      const badge = document.createElement('span');
      badge.className = 'badge';
      badge.textContent = t('susbank.achievement.ratFeeder');
      achievementsEl.appendChild(badge);
    }
    if (ach.glitchApostle) {
      const badge = document.createElement('span');
      badge.className = 'badge';
      badge.textContent = t('susbank.achievement.glitchApostle');
      achievementsEl.appendChild(badge);
    }
  }
  
  // Update shop items
  const shopItemsEl = document.getElementById('shopItems');
  if (shopItemsEl) {
    shopItemsEl.innerHTML = '';
    Object.values(SHOP_ITEMS).forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'shop-item';
      
      const info = document.createElement('div');
      info.className = 'shop-item-info';
      info.innerHTML = `<strong>${item.name}</strong> <span class="shop-item-price">${item.price} suscoin</span>`;
      
      const buyBtn = document.createElement('button');
      buyBtn.className = 'btn';
      buyBtn.textContent = t('susshop.buy');
      buyBtn.disabled = appState.wallet.suscoin < item.price;
      if (buyBtn.disabled) {
        buyBtn.textContent = t('susshop.insufficient');
      }
      buyBtn.onclick = () => {
        processCommand(`buy ${item.id}`);
      };
      
      itemDiv.appendChild(info);
      itemDiv.appendChild(buyBtn);
      shopItemsEl.appendChild(itemDiv);
    });
  }
}

// Terminal input handling
function initTerminal() {
  const termIn = document.getElementById('termIn');
  const termOut = document.getElementById('termOut');
  
  if (!termIn || !termOut) return;
  
  // Helper: Get text content from contenteditable
  function getInputText() {
    return termIn.textContent || '';
  }
  
  // Helper: Set text content and move cursor to end
  function setInputText(text) {
    termIn.textContent = text;
    // Move cursor to end
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(termIn);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  }
  
  // Helper: Place caret at end of contenteditable (like terminal behavior)
  function placeCaretAtEnd(el) {
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }
  
  // Helper: Focus input and place caret at end
  function focusInput() {
    termIn.focus();
    placeCaretAtEnd(termIn);
  }
  
  // Click anywhere on terminal input line to focus input
  const inputLine = termIn.closest('.terminal-input-line');
  if (inputLine) {
    inputLine.addEventListener('mousedown', (e) => {
      // 防止点到 line 但没有真正聚焦输入
      if (e.target !== termIn && !termIn.contains(e.target)) {
        e.preventDefault();
        focusInput();
      }
    });
  }
  
  // Also handle clicking on terminal container
  const terminalContainer = termIn.closest('.terminal-container');
  if (terminalContainer) {
    terminalContainer.addEventListener('click', (e) => {
      // If clicking on container (but not on input itself), focus input
      if (e.target === terminalContainer || e.target === termOut || e.target.classList.contains('terminal-divider')) {
        focusInput();
      }
    });
  }
  
  // Initial welcome message
  addLog(t('terminal.welcome'), 'system');
  
  // Auto-focus on load (will show native caret, hide decorator cursor)
  setTimeout(() => {
    focusInput();
  }, 100);
  
  // Paste handler: paste as plain text only
  termIn.addEventListener('paste', (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    // Place caret at end after paste
    setTimeout(() => {
      placeCaretAtEnd(termIn);
    }, 0);
  });
  
  // Command submission
  termIn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = getInputText().trim();
      if (cmd) {
        addLog(`${t('terminal.prompt')} ${cmd}`, 'prompt');
        processCommand(cmd);
        setInputText('');
        appState.terminalHistoryIndex = -1;
        setTimeout(() => {
          focusInput();
        }, 0);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (appState.terminalHistory.length > 0) {
        if (appState.terminalHistoryIndex === -1) {
          appState.terminalHistoryIndex = appState.terminalHistory.length - 1;
        } else if (appState.terminalHistoryIndex > 0) {
          appState.terminalHistoryIndex--;
        }
        setInputText(appState.terminalHistory[appState.terminalHistoryIndex] || '');
        setTimeout(() => {
          placeCaretAtEnd(termIn);
        }, 0);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (appState.terminalHistoryIndex !== -1) {
        if (appState.terminalHistoryIndex < appState.terminalHistory.length - 1) {
          appState.terminalHistoryIndex++;
          setInputText(appState.terminalHistory[appState.terminalHistoryIndex]);
        } else {
          appState.terminalHistoryIndex = -1;
          setInputText('');
        }
        setTimeout(() => {
          placeCaretAtEnd(termIn);
        }, 0);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Simple autocomplete
      const value = getInputText().trim().toLowerCase();
      const commands = ['help', 'about', 'lang', 'baptize', 'seal', 'bless', 'donate', 'copy', 'balance', 'earn', 'shop', 'buy', 'confess', 'list', 'del', 'wipe', 'glitch', 'export', 'clear'];
      const matches = commands.filter(cmd => cmd.startsWith(value));
      if (matches.length === 1) {
        setInputText(matches[0] + ' ');
        setTimeout(() => {
          placeCaretAtEnd(termIn);
        }, 0);
      } else if (matches.length > 1 && value) {
        addLog('Possible commands: ' + matches.join(', '), 'system');
      }
    }
    // For all other keys, browser's native caret will handle positioning
    // No need to manually update cursor position
  });
}

// Baptism button handler
function handleBaptize() {
  appState.counters.baptize++;
  saveState();
  alert(t('baptism.success'));
  checkAchievements();
  updateUI();
}

// Donate button handler
function handleDonate() {
  appState.counters.donateClicks++;
  saveState();
  alert('💐' + t('fundraising.donate') + '. ' + t('baptism.success'));
  updateUI();
}

// Confess form handler
function handleConfessSubmit() {
  const textarea = document.getElementById('confessTextarea');
  if (!textarea) return;
  
  const text = textarea.value.trim();
  
  if (text.length === 0) {
    alert(t('confess.tooShort'));
    return;
  }
  
  if (text.length > 500) {
    alert(t('confess.tooLong'));
    return;
  }
  
  addConfession(text, false);
}

// Initialize app
function initApp() {
  loadState();
  
  // Restore glitch mode
  if (appState.flags.glitch) {
    document.body.classList.add('glitch');
  }
  
  // Initialize terminal
  initTerminal();
  
  // Render confessions
  renderConfessions();
  
  // Update UI
  updateUI();
  
  // Language change handler
  window.addEventListener('langChanged', (e) => {
    const lang = e.detail ? e.detail.lang : (window.currentLang || 'en');
    appState.lang = lang;
    saveState();
    updateUI();
    renderConfessions();
  });
  
  // Donation address copy button
  const copyBtn = document.getElementById('copyAddressBtn');
  if (copyBtn) {
    copyBtn.onclick = async () => {
      try {
        await copyAddress();
        alert(t('fundraising.copied'));
      } catch (e) {
        alert(t('fundraising.copyFailed'));
      }
    };
  }
  
  // Confess form submit
  const confessForm = document.getElementById('confessForm');
  if (confessForm) {
    confessForm.onsubmit = (e) => {
      e.preventDefault();
      handleConfessSubmit();
    };
  }
  
  // Export buttons
  const exportJsonBtn = document.getElementById('exportJsonBtn');
  if (exportJsonBtn) {
    exportJsonBtn.onclick = () => exportConfessions('json');
  }
  
  const exportTxtBtn = document.getElementById('exportTxtBtn');
  if (exportTxtBtn) {
    exportTxtBtn.onclick = () => exportConfessions('txt');
  }
  
  // Wipe button
  const wipeBtn = document.getElementById('wipeConfessBtn');
  if (wipeBtn) {
    wipeBtn.onclick = wipeAllConfessions;
  }
}

// Wait for DOM and i18n to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for i18n to initialize
    setTimeout(initApp, 100);
  });
} else {
  setTimeout(initApp, 100);
}

