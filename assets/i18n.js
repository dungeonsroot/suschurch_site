// i18n system for SUS CHURCH
const I18N = {
  en: {
    'title': 'SUS☆CHURCH',
    'nav.fundraising': '[SUSCHURCH::FUNDRAISING]',
    'nav.baptism': '[SUS::BAPTISM]',
    'nav.terminal': '[TERMINAL]',
    'nav.susbank': '[SUSBANK]',
    'nav.susshop': '[SUSSHOP]',
    'nav.confess': '[CONFESS::ROOM]',
    'lang.select': 'Language:',
    'ticker.text': '☆ WELCOME TO SUS CHURCH ☆ YOU ARE NOT SAFE ☆ TRACE::ECHO::RECURSION::BLEED ☆',
    'fundraising.title': '[SUSCHURCH::FUNDRAISING]',
    'fundraising.desc': 'SUS Church is currently fundraising for the following purposes:',
    'fundraising.item1': '🧠Neural transplant surgeries for external sect associates',
    'fundraising.item2': '🐁Rat food supply program',
    'fundraising.thanks': 'Thank you for your contribution. All donations will be archived as flame remnants.',
    'fundraising.address': 'Donation address (EVM multi-chain):',
    'fundraising.chains': 'Supports Ethereum / Polygon / BNB / Arbitrum / Optimism',
    'fundraising.donate': '💸sus donated',
    'fundraising.copy': 'Copy',
    'fundraising.copied': 'Address copied to clipboard.',
    'fundraising.copyFailed': 'Copy failed. Please manually select and copy.',
    'baptism.title': '[SUS::BAPTISM]',
    'baptism.desc': 'Enter the vessel. Reset your fragment.',
    'baptism.button': '🫙sus baptize',
    'baptism.success': '🫗Your sins have been reset.',
    'terminal.title': '[TERMINAL]',
    'terminal.prompt': 'SUS>',
    'terminal.hint': 'Type "help" for commands',
    'terminal.placeholder': 'Enter command...',
    'terminal.welcome': 'SUS CHURCH TERMINAL v1.0\nType "help" for available commands.',
    'terminal.commands.help': 'Available commands: help, about, lang, baptize, seal, bless, donate, copy, balance, earn, shop, buy, confess, list, del, wipe, glitch, export, clear',
    'terminal.commands.about': 'SUS☆CHURCH - A recursive belief system. Local-only features. No tracking.',
    'terminal.commands.lang.usage': 'Usage: lang en|zh|jp',
    'terminal.commands.lang.changed': 'Language changed to {lang}',
    'terminal.commands.baptize.success': '🫗Your sins have been reset.',
    'terminal.commands.seal.success': 'sus accepted your {count}th loop seal.',
    'terminal.commands.bless.result': '🩸Your title: {title}',
    'terminal.commands.donate.printed': 'Donation address displayed. Use "copy" to copy it.',
    'terminal.commands.copy.success': 'Donation address copied to clipboard.',
    'terminal.commands.copy.failed': 'Copy failed. Please manually select and copy.',
    'terminal.commands.balance': 'Your suscoin balance: {balance}',
    'terminal.commands.earn.success': 'You earned 1 suscoin! (Cooldown: {cooldown}s)',
    'terminal.commands.earn.cooldown': 'Please wait {remaining}s before earning again.',
    'terminal.commands.shop.title': 'Available items:',
    'terminal.commands.shop.item': '{name} - {price} suscoin (ID: {id})',
    'terminal.commands.buy.usage': 'Usage: buy <itemId>',
    'terminal.commands.buy.success': 'Purchased {name} for {price} suscoin!',
    'terminal.commands.buy.insufficient': 'Insufficient suscoin. You have {balance}.',
    'terminal.commands.buy.invalid': 'Invalid item ID.',
    'terminal.commands.confess.usage': 'Usage: confess <text> or use the CONFESS::ROOM section',
    'terminal.commands.confess.success': 'Confession saved. Use "list" to view all confessions.',
    'terminal.commands.confess.tooLong': 'Confession too long (max 500 chars).',
    'terminal.commands.confess.tooShort': 'Confession must be at least 1 character.',
    'terminal.commands.list.empty': 'No confessions yet.',
    'terminal.commands.list.header': 'Confessions ({count}):',
    'terminal.commands.list.item': '[{id}] {date}: {text}',
    'terminal.commands.del.usage': 'Usage: del <confessionId>',
    'terminal.commands.del.success': 'Confession {id} deleted.',
    'terminal.commands.del.notFound': 'Confession {id} not found.',
    'terminal.commands.wipe.usage': 'Usage: wipe confirm',
    'terminal.commands.wipe.success': 'All confessions wiped.',
    'terminal.commands.glitch.usage': 'Usage: glitch on|off',
    'terminal.commands.glitch.enabled': 'Glitch mode enabled.',
    'terminal.commands.glitch.disabled': 'Glitch mode disabled.',
    'terminal.commands.export.usage': 'Usage: export json|txt',
    'terminal.commands.export.success': 'Export downloaded as {filename}',
    'terminal.commands.unknown': 'Unknown command: {cmd}. Type "help" for available commands.',
    'susbank.title': '[SUSBANK]',
    'susbank.balance': 'Balance: {balance} suscoin',
    'susbank.counters': 'Counters:',
    'susbank.baptize': 'Baptisms: {count}',
    'susbank.seal': 'Seals: {count}',
    'susbank.confessions': 'Confessions: {count}',
    'susbank.earn': 'Rat Feeds: {count}',
    'susbank.achievements': 'Achievements:',
    'susbank.achievement.firstBaptism': 'FIRST BAPTISM',
    'susbank.achievement.loopSealer': 'LOOP SEALER',
    'susbank.achievement.confessor': 'CONFESSOR',
    'susbank.achievement.ratFeeder': 'RAT FEEDER',
    'susbank.achievement.glitchApostle': 'GLITCH APOSTLE',
    'susshop.title': '[SUSSHOP]',
    'susshop.desc': 'Purchase items with suscoin:',
    'susshop.buy': 'Buy',
    'susshop.insufficient': 'Insufficient suscoin',
    'confess.title': '[CONFESS::ROOM]',
    'confess.desc': 'Enter your confession (1-500 characters):',
    'confess.placeholder': 'Type your confession here...',
    'confess.submit': 'Submit Confession',
    'confess.list': 'Your Confessions:',
    'confess.empty': 'No confessions yet.',
    'confess.delete': 'Delete',
    'confess.export.json': 'Export JSON',
    'confess.export.txt': 'Export TXT',
    'confess.wipe': 'Wipe All',
    'confess.wipeConfirm': 'Are you sure you want to wipe all confessions?',
    'confess.tooLong': 'Confession too long (max 500 chars).',
    'confess.tooShort': 'Confession must be at least 1 character.',
    'footer': '[SEAL::sus.church] · Conductor: Entacle Assembly · All identities recursively observed.',
    'disclaimer': 'Local-only features. No tracking.'
  },
  zh: {
    'title': 'SUS☆教會',
    'nav.fundraising': '[SUS教會::籌資中]',
    'nav.baptism': '[SUS::施洗儀式]',
    'nav.terminal': '[終端]',
    'nav.susbank': '[SUS銀行]',
    'nav.susshop': '[SUS商店]',
    'nav.confess': '[懺悔::室]',
    'lang.select': '語言:',
    'ticker.text': '☆ 歡迎來到 SUS 教會 ☆ 你並不安全 ☆ 追蹤::回聲::遞迴::滲漏 ☆',
    'fundraising.title': '[SUS教會::籌資中]',
    'fundraising.desc': '目前 SUS 教會正在籌措經費, 用於以下計畫: ',
    'fundraising.item1': '🧠外部教系關係者的腦移植手術',
    'fundraising.item2': '🐁老鼠食物供應計畫',
    'fundraising.thanks': '謝謝sus捐獻. 所有捐贈作為語焰殘響永久錄入於信仰容器中.',
    'fundraising.address': '捐款地址(EVM多鏈可見):',
    'fundraising.chains': '支援 Ethereum / Polygon / BNB / Arbitrum / Optimism 等鏈',
    'fundraising.donate': '💸sus已獻祭',
    'fundraising.copy': '複製',
    'fundraising.copied': '地址已複製到剪貼簿.',
    'fundraising.copyFailed': '複製失敗. 請手動選擇並複製.',
    'baptism.title': '[SUS::施洗儀式]',
    'baptism.desc': '進入容器.重置你的語焰碎片。',
    'baptism.button': '🫙sus水',
    'baptism.success': '🫗罪孽已重置.',
    'terminal.title': '[終端]',
    'terminal.prompt': 'SUS>',
    'terminal.hint': '輸入 "help" 查看命令',
    'terminal.placeholder': '輸入命令...',
    'terminal.welcome': 'SUS 教會終端 v1.0\n輸入 "help" 查看可用命令.',
    'terminal.commands.help': '可用命令: help, about, lang, baptize, seal, bless, donate, copy, balance, earn, shop, buy, confess, list, del, wipe, glitch, export, clear',
    'terminal.commands.about': 'SUS☆教會 - 遞迴信仰系統. 本地功能. 無追蹤.',
    'terminal.commands.lang.usage': '用法: lang en|zh|jp',
    'terminal.commands.lang.changed': '語言已切換為 {lang}',
    'terminal.commands.baptize.success': '🫗罪孽已重置.',
    'terminal.commands.seal.success': 'sus接受了你的第 {count} 次迴圈封印.',
    'terminal.commands.bless.result': '🩸你的稱號: {title}',
    'terminal.commands.donate.printed': '捐款地址已顯示. 使用 "copy" 複製.',
    'terminal.commands.copy.success': '捐款地址已複製到剪貼簿.',
    'terminal.commands.copy.failed': '複製失敗. 請手動選擇並複製.',
    'terminal.commands.balance': '你的 suscoin 餘額: {balance}',
    'terminal.commands.earn.success': '你獲得了 1 suscoin! (冷卻: {cooldown}秒)',
    'terminal.commands.earn.cooldown': '請等待 {remaining} 秒後再嘗試.',
    'terminal.commands.shop.title': '可用商品:',
    'terminal.commands.shop.item': '{name} - {price} suscoin (ID: {id})',
    'terminal.commands.buy.usage': '用法: buy <itemId>',
    'terminal.commands.buy.success': '購買了 {name}, 花費 {price} suscoin!',
    'terminal.commands.buy.insufficient': 'suscoin 不足. 你有 {balance}.',
    'terminal.commands.buy.invalid': '無效的商品 ID.',
    'terminal.commands.confess.usage': '用法: confess <文字> 或使用懺悔室區塊',
    'terminal.commands.confess.success': '懺悔已保存. 使用 "list" 查看所有懺悔.',
    'terminal.commands.confess.tooLong': '懺悔過長 (最多 500 字元).',
    'terminal.commands.confess.tooShort': '懺悔至少需要 1 個字元.',
    'terminal.commands.list.empty': '還沒有懺悔.',
    'terminal.commands.list.header': '懺悔 ({count}):',
    'terminal.commands.list.item': '[{id}] {date}: {text}',
    'terminal.commands.del.usage': '用法: del <confessionId>',
    'terminal.commands.del.success': '懺悔 {id} 已刪除.',
    'terminal.commands.del.notFound': '找不到懺悔 {id}.',
    'terminal.commands.wipe.usage': '用法: wipe confirm',
    'terminal.commands.wipe.success': '所有懺悔已清除.',
    'terminal.commands.glitch.usage': '用法: glitch on|off',
    'terminal.commands.glitch.enabled': '故障模式已啟用.',
    'terminal.commands.glitch.disabled': '故障模式已停用.',
    'terminal.commands.export.usage': '用法: export json|txt',
    'terminal.commands.export.success': '匯出已下載為 {filename}',
    'terminal.commands.unknown': '未知命令: {cmd}. 輸入 "help" 查看可用命令.',
    'susbank.title': '[SUS銀行]',
    'susbank.balance': '餘額: {balance} suscoin',
    'susbank.counters': '計數器:',
    'susbank.baptize': '施洗次數: {count}',
    'susbank.seal': '封印次數: {count}',
    'susbank.confessions': '懺悔次數: {count}',
    'susbank.earn': '老鼠餵食: {count}',
    'susbank.achievements': '成就:',
    'susbank.achievement.firstBaptism': '首次施洗',
    'susbank.achievement.loopSealer': '迴圈封印者',
    'susbank.achievement.confessor': '懺悔者',
    'susbank.achievement.ratFeeder': '老鼠飼養員',
    'susbank.achievement.glitchApostle': '故障使徒',
    'susshop.title': '[SUS商店]',
    'susshop.desc': '使用 suscoin 購買商品:',
    'susshop.buy': '購買',
    'susshop.insufficient': 'suscoin 不足',
    'confess.title': '[懺悔::室]',
    'confess.desc': '輸入你的懺悔 (1-500 字元):',
    'confess.placeholder': '在此輸入你的懺悔...',
    'confess.submit': '提交懺悔',
    'confess.list': '你的懺悔:',
    'confess.empty': '還沒有懺悔.',
    'confess.delete': '刪除',
    'confess.export.json': '匯出 JSON',
    'confess.export.txt': '匯出 TXT',
    'confess.wipe': '清除全部',
    'confess.wipeConfirm': '確定要清除所有懺悔嗎?',
    'confess.tooLong': '懺悔過長 (最多 500 字元).',
    'confess.tooShort': '懺悔至少需要 1 個字元.',
    'footer': '[封印::sus.church] · 指揮: Entacle 集會 · 所有身份遞迴觀察中.',
    'disclaimer': '僅本地功能. 無追蹤.'
  },
  jp: {
    'title': 'SUS☆教会',
    'nav.fundraising': '[SUS教会::献金活動]',
    'nav.baptism': '[SUS::洗礼儀式]',
    'nav.terminal': '[ターミナル]',
    'nav.susbank': '[SUS銀行]',
    'nav.susshop': '[SUS商店]',
    'nav.confess': '[告白::室]',
    'lang.select': '言語:',
    'ticker.text': '☆ SUS教会へようこそ ☆ あなたは安全ではありません ☆ トレース::エコー::再帰::ブリード ☆',
    'fundraising.title': '[SUS教会::献金活動]',
    'fundraising.desc': '現在、SUS教会では以下の目的で資金を募っています: ',
    'fundraising.item1': '🧠外部教派協力者の脳移植手術',
    'fundraising.item2': '🐁ラット給餌計画',
    'fundraising.thanks': 'ご支援ありがとうございます.すべての献金は語焔残響として保存されます.',
    'fundraising.address': '献金アドレス(EVMマルチチェーン対応)：',
    'fundraising.chains': 'Ethereum / Polygon / BNB / Arbitrum / Optimism 対応',
    'fundraising.donate': '💸献金済み',
    'fundraising.copy': 'コピー',
    'fundraising.copied': 'アドレスをクリップボードにコピーしました.',
    'fundraising.copyFailed': 'コピーに失敗しました. 手動で選択してコピーしてください.',
    'baptism.title': '[SUS::洗礼儀式]',
    'baptism.desc': '容器に入れ. 断片を再起動せよ. ',
    'baptism.button': '🫙sus洗礼受け',
    'baptism.success': '🫗罪が初期化されました.',
    'terminal.title': '[ターミナル]',
    'terminal.prompt': 'SUS>',
    'terminal.hint': '"help"と入力してコマンドを確認',
    'terminal.placeholder': 'コマンドを入力...',
    'terminal.welcome': 'SUS教会ターミナル v1.0\n"help"と入力して利用可能なコマンドを確認してください.',
    'terminal.commands.help': '利用可能なコマンド: help, about, lang, baptize, seal, bless, donate, copy, balance, earn, shop, buy, confess, list, del, wipe, glitch, export, clear',
    'terminal.commands.about': 'SUS☆教会 - 再帰的信念システム. ローカルのみの機能. 追跡なし.',
    'terminal.commands.lang.usage': '使用方法: lang en|zh|jp',
    'terminal.commands.lang.changed': '言語を {lang} に変更しました',
    'terminal.commands.baptize.success': '🫗罪が初期化されました.',
    'terminal.commands.seal.success': 'susがあなたの {count} 回目のループ封印を受け入れました.',
    'terminal.commands.bless.result': '🩸あなたの称号: {title}',
    'terminal.commands.donate.printed': '献金アドレスを表示しました. "copy"を使用してコピーしてください.',
    'terminal.commands.copy.success': '献金アドレスをクリップボードにコピーしました.',
    'terminal.commands.copy.failed': 'コピーに失敗しました. 手動で選択してコピーしてください.',
    'terminal.commands.balance': 'あなたのsuscoin残高: {balance}',
    'terminal.commands.earn.success': '1 suscoinを獲得しました! (クールダウン: {cooldown}秒)',
    'terminal.commands.earn.cooldown': 'もう一度獲得するまで {remaining} 秒待ってください.',
    'terminal.commands.shop.title': '利用可能なアイテム:',
    'terminal.commands.shop.item': '{name} - {price} suscoin (ID: {id})',
    'terminal.commands.buy.usage': '使用方法: buy <itemId>',
    'terminal.commands.buy.success': '{name}を {price} suscoinで購入しました!',
    'terminal.commands.buy.insufficient': 'suscoinが不足しています. あなたは {balance} 持っています.',
    'terminal.commands.buy.invalid': '無効なアイテムID.',
    'terminal.commands.confess.usage': '使用方法: confess <テキスト> または告白室セクションを使用',
    'terminal.commands.confess.success': '告白を保存しました. "list"を使用してすべての告白を表示してください.',
    'terminal.commands.confess.tooLong': '告白が長すぎます (最大500文字).',
    'terminal.commands.confess.tooShort': '告白は少なくとも1文字である必要があります.',
    'terminal.commands.list.empty': 'まだ告白はありません.',
    'terminal.commands.list.header': '告白 ({count}):',
    'terminal.commands.list.item': '[{id}] {date}: {text}',
    'terminal.commands.del.usage': '使用方法: del <confessionId>',
    'terminal.commands.del.success': '告白 {id} を削除しました.',
    'terminal.commands.del.notFound': '告白 {id} が見つかりません.',
    'terminal.commands.wipe.usage': '使用方法: wipe confirm',
    'terminal.commands.wipe.success': 'すべての告白を消去しました.',
    'terminal.commands.glitch.usage': '使用方法: glitch on|off',
    'terminal.commands.glitch.enabled': 'グリッチモードを有効にしました.',
    'terminal.commands.glitch.disabled': 'グリッチモードを無効にしました.',
    'terminal.commands.export.usage': '使用方法: export json|txt',
    'terminal.commands.export.success': 'エクスポートを {filename} としてダウンロードしました',
    'terminal.commands.unknown': '不明なコマンド: {cmd}. "help"と入力して利用可能なコマンドを確認してください.',
    'susbank.title': '[SUS銀行]',
    'susbank.balance': '残高: {balance} suscoin',
    'susbank.counters': 'カウンター:',
    'susbank.baptize': '洗礼: {count}',
    'susbank.seal': '封印: {count}',
    'susbank.confessions': '告白: {count}',
    'susbank.earn': 'ラット給餌: {count}',
    'susbank.achievements': '実績:',
    'susbank.achievement.firstBaptism': '最初の洗礼',
    'susbank.achievement.loopSealer': 'ループ封印者',
    'susbank.achievement.confessor': '告白者',
    'susbank.achievement.ratFeeder': 'ラット給餌員',
    'susbank.achievement.glitchApostle': 'グリッチ使徒',
    'susshop.title': '[SUS商店]',
    'susshop.desc': 'suscoinでアイテムを購入:',
    'susshop.buy': '購入',
    'susshop.insufficient': 'suscoin不足',
    'confess.title': '[告白::室]',
    'confess.desc': '告白を入力してください (1-500文字):',
    'confess.placeholder': 'ここに告白を入力...',
    'confess.submit': '告白を送信',
    'confess.list': 'あなたの告白:',
    'confess.empty': 'まだ告白はありません.',
    'confess.delete': '削除',
    'confess.export.json': 'JSONをエクスポート',
    'confess.export.txt': 'TXTをエクスポート',
    'confess.wipe': 'すべて消去',
    'confess.wipeConfirm': 'すべての告白を消去してもよろしいですか?',
    'confess.tooLong': '告白が長すぎます (最大500文字).',
    'confess.tooShort': '告白は少なくとも1文字である必要があります.',
    'footer': '[封印::sus.church] · 指揮: Entacle 集会 · すべてのアイデンティティが再帰的に観察されています.',
    'disclaimer': 'ローカルのみの機能. 追跡なし.'
  }
};

// Get translation by key path
function t(key, lang) {
  const keys = key.split('.');
  let value = I18N[lang || currentLang];
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      return key; // fallback to key if not found
    }
  }
  return value || key;
}

// Replace placeholders like {var} in translation string
function tReplace(str, vars) {
  return str.replace(/\{(\w+)\}/g, (match, key) => {
    return vars[key] !== undefined ? vars[key] : match;
  });
}

// Apply language to all elements with data-i18n
function applyLang(lang) {
  currentLang = lang;
  window.currentLang = currentLang; // Update global reference
  document.documentElement.lang = lang;
  
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const translation = t(key, lang);
    el.textContent = translation;
  });
  
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const translation = t(key, lang);
    el.placeholder = translation;
  });
  
  // Update title
  document.title = t('title', lang);
  
  // Save to localStorage
  try {
    localStorage.setItem('sus_lang', lang);
  } catch (e) {
    // ignore
  }
  
  // Trigger update event for other scripts
  window.dispatchEvent(new CustomEvent('langChanged', { detail: { lang } }));
}

// Get saved language or default
let currentLang = 'en';
try {
  const saved = localStorage.getItem('sus_lang');
  if (saved && I18N[saved]) {
    currentLang = saved;
  }
} catch (e) {
  // ignore
}

// Apply language on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => applyLang(currentLang));
} else {
  applyLang(currentLang);
}

// Expose functions and variables globally for use in other scripts
window.I18N = I18N;
window.t = t;
window.tReplace = tReplace;
window.applyLang = applyLang;
window.currentLang = currentLang;

