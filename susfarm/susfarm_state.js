// SusFarm - State Management and Persistence

const SUSFARM_STATE_KEY = 'susfarm.state.v1';
const TICK_INTERVAL = 60; // 60 seconds
const MARKET_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

const DEFAULT_STATE = {
  version: 3, // Bump version for atmosphere system
  plots: [],
  maxPlots: 6,
  upgrades: {
    land: 0,
    automation: 0,
    ritual: 0
  },
  buffs: {
    yieldPercent: 0,
    yieldPercentExpiry: 0,
    witherReduction: 0,
    witherReductionExpiry: 0
  },
  // New: field atmosphere system
  fieldAtmo: {
    current: 'day', // dawn, day, dusk, night, anomaly
    cycleTick: 0, // ticks until next cycle
    anomalyActive: false,
    anomalyEndsAt: 0
  },
  // New: inventory as {key: count}
  inventory: {},
  // New: player metabolism and buffs
  player: {
    metabolism: {
      fullness: 0,
      purity: 50,
      corruption: 0,
      lastConsumeAt: 0
    },
    buffs: [], // Array of active buffs
    anomaly: {
      pressure: 0,
      active: null
    }
  },
  // New: market system
  market: {
    tickWindowMs: MARKET_REFRESH_INTERVAL,
    lastWindowId: 0,
    mood: 'calm',
    activeEvent: null,
    lastPrices: {},
    prices: {},
    log: [],
    omenPending: false,
    hintedGoodKey: null,
    lastLargeSell: { time: 0, value: 0, goodKey: null }
  },
  // New: church link
  church: {
    credit: 0,
    titheRate: 0.08
  },
  streak: 0,
  lastSeenAt: Date.now(),
  lastTickAt: Date.now(),
  defaultCrop: 'lungroot',
  log: []
};

let farmState = { ...DEFAULT_STATE };

// Seeded RNG for deterministic offline progress
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Load state from localStorage
function loadState() {
  try {
    const saved = localStorage.getItem(SUSFARM_STATE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      farmState = { ...DEFAULT_STATE, ...parsed };
      
      // Ensure arrays exist
      if (!Array.isArray(farmState.plots)) farmState.plots = [];
      if (!Array.isArray(farmState.log)) farmState.log = [];
      
      // Migrate inventory from array to object if needed
      if (Array.isArray(farmState.inventory)) {
        const newInv = {};
        farmState.inventory.forEach(item => {
          const key = item.key || item.cropKey || item.type;
          if (key) newInv[key] = (newInv[key] || 0) + 1;
        });
        farmState.inventory = newInv;
      } else if (!farmState.inventory || typeof farmState.inventory !== 'object') {
        farmState.inventory = {};
      }
      
      // Ensure upgrades object exists
      farmState.upgrades = { ...DEFAULT_STATE.upgrades, ...(parsed.upgrades || {}) };
      
      // Ensure buffs object exists
      farmState.buffs = { ...DEFAULT_STATE.buffs, ...(parsed.buffs || {}) };
      
      // Ensure player object exists
      if (!farmState.player) farmState.player = { ...DEFAULT_STATE.player };
      farmState.player.metabolism = { ...DEFAULT_STATE.player.metabolism, ...(parsed.player?.metabolism || {}) };
      if (!Array.isArray(farmState.player.buffs)) farmState.player.buffs = [];
      if (!farmState.player.anomaly) farmState.player.anomaly = { ...DEFAULT_STATE.player.anomaly };
      
      // Ensure market object exists
      if (!farmState.market) farmState.market = { ...DEFAULT_STATE.market };
      if (!farmState.market.prices) farmState.market.prices = {};
      if (!farmState.market.lastPrices) farmState.market.lastPrices = {};
      if (!Array.isArray(farmState.market.log)) farmState.market.log = [];
      
      // Ensure church object exists
      if (!farmState.church) farmState.church = { ...DEFAULT_STATE.church };
      
      // Initialize market prices if empty
      if (Object.keys(farmState.market.prices).length === 0) {
        refreshMarketPrices();
      }
      
      // Calculate max plots from land upgrade
      if (farmState.upgrades.land > 0) {
        farmState.maxPlots = 6 + (farmState.upgrades.land * 3);
      }
      
      // Process offline progress
      processOfflineProgress();
    } else {
      farmState = { ...DEFAULT_STATE };
      farmState.lastSeenAt = Date.now();
      farmState.lastTickAt = Date.now();
    }
  } catch (e) {
    console.error('Failed to load farm state:', e);
    farmState = { ...DEFAULT_STATE };
    farmState.lastSeenAt = Date.now();
    farmState.lastTickAt = Date.now();
  }
  
  return farmState;
}

// Save state to localStorage
function saveState() {
  try {
    farmState.lastSeenAt = Date.now();
    localStorage.setItem(SUSFARM_STATE_KEY, JSON.stringify(farmState));
  } catch (e) {
    console.error('Failed to save farm state:', e);
  }
}

// Process offline progress (cap to 24 hours)
function processOfflineProgress() {
  const now = Date.now();
  const elapsed = Math.floor((now - farmState.lastSeenAt) / 1000);
  const maxOffline = 24 * 60 * 60; // 24 hours
  const ticksToProcess = Math.min(Math.floor(elapsed / TICK_INTERVAL), Math.floor(maxOffline / TICK_INTERVAL));
  
  if (ticksToProcess > 0) {
    // Process each tick deterministically
    for (let i = 0; i < ticksToProcess; i++) {
      const tickTime = farmState.lastTickAt + (i + 1) * TICK_INTERVAL * 1000;
      processTick(tickTime, true);
    }
    
    farmState.lastTickAt = now;
    saveState();
  }
}

// Process a single tick
function processTick(tickTime, isOffline = false) {
  const now = tickTime || Date.now();
  
  // Refresh market prices (every 5 minutes)
  refreshMarketPrices();
  
  // Process player buffs
  processBuffs(now);
  
  // Check anomaly
  checkAnomaly();
  
  // Update buffs expiry
  if (farmState.buffs.yieldPercentExpiry > 0 && now >= farmState.buffs.yieldPercentExpiry) {
    farmState.buffs.yieldPercent = 0;
    farmState.buffs.yieldPercentExpiry = 0;
  }
  if (farmState.buffs.witherReductionExpiry > 0 && now >= farmState.buffs.witherReductionExpiry) {
    farmState.buffs.witherReduction = 0;
    farmState.buffs.witherReductionExpiry = 0;
  }
  
  // Process atmosphere cycle
  if (!farmState.fieldAtmo) {
    farmState.fieldAtmo = {
      current: 'day',
      cycleTick: 0,
      anomalyActive: false,
      anomalyEndsAt: 0
    };
  }
  
  // Check if anomaly is active
  if (farmState.fieldAtmo.anomalyActive && now >= farmState.fieldAtmo.anomalyEndsAt) {
    farmState.fieldAtmo.anomalyActive = false;
    farmState.fieldAtmo.anomalyEndsAt = 0;
    // Return to previous cycle (default to day)
    if (!['dawn', 'day', 'dusk', 'night'].includes(farmState.fieldAtmo.current)) {
      farmState.fieldAtmo.current = 'day';
    }
  }
  
  // Cycle atmosphere (every 5-7 ticks, ~5-7 minutes)
  if (!farmState.fieldAtmo.anomalyActive) {
    farmState.fieldAtmo.cycleTick = (farmState.fieldAtmo.cycleTick || 0) + 1;
    
    // Roll for anomaly (5% chance every cycle)
    if (farmState.fieldAtmo.cycleTick >= 5) {
      const seed = Math.floor(tickTime / 1000) + 9999;
      const roll = seededRandom(seed);
      
      if (roll < 0.05) {
        // Anomaly triggered!
        farmState.fieldAtmo.anomalyActive = true;
        farmState.fieldAtmo.current = 'anomaly';
        farmState.fieldAtmo.anomalyEndsAt = now + (10 * 60 * 1000); // 10 minutes
        farmState.fieldAtmo.cycleTick = 0;
        addLog('anomaly_start', {});
      } else if (farmState.fieldAtmo.cycleTick >= 7) {
        // Normal cycle: dawn -> day -> dusk -> night
        const cycle = ['dawn', 'day', 'dusk', 'night'];
        const currentIndex = cycle.indexOf(farmState.fieldAtmo.current);
        const nextIndex = (currentIndex + 1) % cycle.length;
        farmState.fieldAtmo.current = cycle[nextIndex];
        farmState.fieldAtmo.cycleTick = 0;
      }
    }
  }
  
  // Process each plot
  farmState.plots.forEach((plot, index) => {
    if (!plot.cropKey) return;
    
    const crop = window.SUSFARM_DATA?.crops[plot.cropKey];
    if (!crop) return;
    
    // Apply growth speed multiplier from buffs
    let growthMultiplier = 1.0;
    const heartSurge = farmState.player.buffs.find(b => b.id === 'heart_surge');
    if (heartSurge) {
      growthMultiplier += heartSurge.stacks * (window.SUSFARM_DATA?.buffs.heart_surge.effects.growthSpeedMultiplier || 0);
    }
    
    // Apply atmosphere modifiers
    if (farmState.fieldAtmo.current === 'dawn') {
      growthMultiplier *= 1.1; // +10% growth speed
    } else if (farmState.fieldAtmo.current === 'night') {
      // Night increases wither risk (handled below)
    } else if (farmState.fieldAtmo.current === 'anomaly') {
      // Anomaly affects yield (handled in harvest)
    }
    
    // Apply anomaly (nullfield_freeze reduces growth)
    if (farmState.player.anomaly.active?.id === 'nullfield_freeze') {
      growthMultiplier += window.SUSFARM_DATA?.anomalies.nullfield_freeze.effects.growthSpeedReduction || 0;
    }
    
    // Reduce remaining time
    if (plot.remainingSeconds > 0) {
      const timeReduction = Math.floor(TICK_INTERVAL * growthMultiplier);
      plot.remainingSeconds = Math.max(0, plot.remainingSeconds - timeReduction);
      
      // Check for wither (bonegrain)
      if (crop.special?.type === 'wither' && plot.stage === 'grow') {
        let witherChance = crop.special.chance;
        
        // Night increases wither risk
        if (farmState.fieldAtmo.current === 'night') {
          witherChance += 0.05;
        }
        
        // Anomaly increases wither risk
        if (farmState.fieldAtmo.current === 'anomaly') {
          witherChance *= 1.2;
        }
        
        const seed = Math.floor(tickTime / 1000) + plot.id;
        const roll = seededRandom(seed);
        if (roll < witherChance) {
          // Wither!
          plot.cropKey = null;
          plot.stage = 'empty';
          plot.plantedAt = 0;
          plot.remainingSeconds = 0;
          addLog('withered', { crop: crop.emoji, plotId: plot.id });
        }
      }
    }
    
    // Update stage
    if (plot.remainingSeconds <= 0 && plot.stage !== 'ready') {
      plot.stage = 'ready';
    }
    
    // Auto-harvest if enabled
    if (plot.stage === 'ready' && farmState.upgrades.automation >= 1) {
      harvestPlot(index, true);
    }
  });
  
  // Auto-replant if enabled
  if (farmState.upgrades.automation >= 2) {
    farmState.plots.forEach((plot, index) => {
      if (!plot.cropKey && farmState.defaultCrop) {
        const crop = window.SUSFARM_DATA?.crops[farmState.defaultCrop];
        if (crop && window.SUS_WALLET?.spend(crop.seedCost)) {
          plantCrop(index, farmState.defaultCrop);
        }
      }
    });
  }
  
  // Auto-water if enabled (every 5 ticks = 5 minutes)
  if (farmState.upgrades.automation >= 3 && !isOffline) {
    const tickCount = Math.floor((now - farmState.lastTickAt) / (TICK_INTERVAL * 1000));
    if (tickCount % 5 === 0) {
      farmState.plots.forEach((plot, index) => {
        if (plot.cropKey && plot.remainingSeconds > 60 && window.SUS_WALLET?.spend(5)) {
          plot.remainingSeconds = Math.max(0, plot.remainingSeconds - 60);
        }
      });
    }
  }
}

// Plant a crop in a plot
function plantCrop(plotIndex, cropKey) {
  if (plotIndex < 0 || plotIndex >= farmState.maxPlots) return false;
  
  const crop = window.SUSFARM_DATA?.crops[cropKey];
  if (!crop) return false;
  
  // Check if plot is empty
  if (farmState.plots[plotIndex] && farmState.plots[plotIndex].cropKey) {
    return false;
  }
  
  // Ensure plot exists
  if (!farmState.plots[plotIndex]) {
    farmState.plots[plotIndex] = {
      id: plotIndex,
      cropKey: null,
      plantedAt: 0,
      remainingSeconds: 0,
      stage: 'empty',
      lastTickAt: 0
    };
  }
  
  // Spend seed cost
  if (!window.SUS_WALLET?.spend(crop.seedCost)) {
    return false;
  }
  
  // Plant
  const now = Date.now();
  farmState.plots[plotIndex].cropKey = cropKey;
  farmState.plots[plotIndex].plantedAt = now;
  farmState.plots[plotIndex].remainingSeconds = crop.growSeconds;
  farmState.plots[plotIndex].stage = 'seed';
  farmState.plots[plotIndex].lastTickAt = now;
  
  // Update stage after a moment
  setTimeout(() => {
    if (farmState.plots[plotIndex] && farmState.plots[plotIndex].cropKey === cropKey) {
      farmState.plots[plotIndex].stage = 'grow';
    }
  }, 1000);
  
  addLog('planted', { crop: crop.emoji, cropKey: cropKey, plotId: plotIndex });
  saveState();
  return true;
}

// Water a plot (reduce time by 60s, cost 5 coin)
function waterPlot(plotIndex) {
  if (plotIndex < 0 || plotIndex >= farmState.plots.length) return false;
  const plot = farmState.plots[plotIndex];
  if (!plot || !plot.cropKey || plot.stage === 'ready') return false;
  
  if (!window.SUS_WALLET?.spend(5)) return false;
  
  plot.remainingSeconds = Math.max(0, plot.remainingSeconds - 60);
  saveState();
  return true;
}

// Boost a plot (reduce time by 180s, cost 20 coin)
function boostPlot(plotIndex) {
  if (plotIndex < 0 || plotIndex >= farmState.plots.length) return false;
  const plot = farmState.plots[plotIndex];
  if (!plot || !plot.cropKey || plot.stage === 'ready') return false;
  
  if (!window.SUS_WALLET?.spend(20)) return false;
  
  plot.remainingSeconds = Math.max(0, plot.remainingSeconds - 180);
  saveState();
  return true;
}

// Harvest a plot
function harvestPlot(plotIndex, isAuto = false) {
  if (plotIndex < 0 || plotIndex >= farmState.plots.length) return false;
  const plot = farmState.plots[plotIndex];
  if (!plot || !plot.cropKey || plot.stage !== 'ready') return false;
  
  const crop = window.SUSFARM_DATA?.crops[plot.cropKey];
  if (!crop) return false;
  
  // Calculate yield with buffs
  let yieldAmount = crop.baseYield;
  if (farmState.buffs.yieldPercent > 0) {
    yieldAmount = Math.floor(yieldAmount * (1 + farmState.buffs.yieldPercent / 100));
  }
  
  // Anomaly bonus: +30% yield
  if (farmState.fieldAtmo?.current === 'anomaly' && farmState.fieldAtmo?.anomalyActive) {
    yieldAmount = Math.floor(yieldAmount * 1.3);
  }
  
  // Check for crit (heartbean)
  let isCrit = false;
  if (crop.special?.type === 'crit') {
    const roll = Math.random();
    if (roll < crop.special.chance) {
      yieldAmount *= 2;
      isCrit = true;
    }
  }
  
  // Add coins
  window.SUS_WALLET?.add(yieldAmount);
  
  // Apply buffs (brainmint)
  if (crop.special?.type === 'buff') {
    const now = Date.now();
    farmState.buffs.yieldPercent = crop.special.effect.yieldPercent || 0;
    farmState.buffs.yieldPercentExpiry = now + crop.special.duration * 1000;
  }
  
  // Drop goods (30-60% chance for corresponding good)
  const goodsKey = getGoodsKeyFromCrop(crop.key);
  if (goodsKey) {
    const dropChance = 0.30 + Math.random() * 0.30; // 30-60%
    if (Math.random() < dropChance) {
      addGoods(goodsKey, 1);
    }
  }
  
  // Check for rare drop (eyeseed)
  if (crop.special?.type === 'rare') {
    const roll = Math.random();
    if (roll < crop.special.chance) {
      addGoods('eye_fragment', 1);
    }
  }
  
  // Check for glitch harvest mutation (anomaly)
  if (farmState.player.anomaly.active?.id === 'glitch_harvest') {
    const anomaly = window.SUSFARM_DATA?.anomalies.glitch_harvest;
    if (anomaly && Math.random() < anomaly.effects.harvestMutationChance) {
      // Mutate: change the goods dropped
      const allGoods = Object.keys(window.SUSFARM_DATA?.goods || {});
      const mutated = allGoods[Math.floor(Math.random() * allGoods.length)];
      addGoods(mutated, 1);
      addLog('mutated', { from: goodsKey, to: mutated });
    }
  }
  
  // Log
  addLog('harvested', {
    crop: crop.emoji,
    cropKey: crop.key,
    plotId: plotIndex,
    yield: yieldAmount,
    isCrit: isCrit,
    isAuto: isAuto
  });
  
  // Clear plot
  plot.cropKey = null;
  plot.stage = 'empty';
  plot.plantedAt = 0;
  plot.remainingSeconds = 0;
  
  saveState();
  return true;
}

// Add log entry
function addLog(type, data = {}) {
  const entry = {
    type: type,
    timestamp: Date.now(),
    data: data
  };
  
  farmState.log.unshift(entry);
  
  // Keep only last 30 entries
  if (farmState.log.length > 30) {
    farmState.log = farmState.log.slice(0, 30);
  }
  
  saveState();
}

// Buy upgrade
function buyUpgrade(upgradeKey) {
  const upgrade = window.SUSFARM_DATA?.upgrades[upgradeKey];
  if (!upgrade) return false;
  
  const currentLevel = farmState.upgrades[upgradeKey] || 0;
  if (currentLevel >= upgrade.maxLevel) return false;
  
  const cost = upgrade.costs[currentLevel];
  if (!cost || !window.SUS_WALLET?.spend(cost)) return false;
  
  farmState.upgrades[upgradeKey] = currentLevel + 1;
  
  // Apply land upgrade effect
  if (upgradeKey === 'land') {
    farmState.maxPlots = 6 + (farmState.upgrades.land * 3);
    // Ensure plots array is large enough
    while (farmState.plots.length < farmState.maxPlots) {
      farmState.plots.push({
        id: farmState.plots.length,
        cropKey: null,
        plantedAt: 0,
        remainingSeconds: 0,
        stage: 'empty',
        lastTickAt: 0
      });
    }
  }
  
  saveState();
  return true;
}

// Activate rite
function activateRite(riteKey) {
  const rite = window.SUSFARM_DATA?.rites[riteKey];
  if (!rite) return false;
  
  if (!window.SUS_WALLET?.spend(rite.cost)) return false;
  
  const now = Date.now();
  if (rite.effect.yieldPercent) {
    farmState.buffs.yieldPercent = rite.effect.yieldPercent;
    farmState.buffs.yieldPercentExpiry = now + rite.duration * 1000;
  }
  if (rite.effect.witherReduction) {
    farmState.buffs.witherReduction = rite.effect.witherReduction;
    farmState.buffs.witherReductionExpiry = now + rite.duration * 1000;
  }
  
  addLog('blessed', { rite: riteKey });
  saveState();
  return true;
}

// Get next reward info
function getNextReward() {
  let minTime = Infinity;
  let reward = null;
  
  farmState.plots.forEach(plot => {
    if (plot.cropKey && plot.remainingSeconds > 0) {
      const crop = window.SUSFARM_DATA?.crops[plot.cropKey];
      if (crop) {
        let yieldAmount = crop.baseYield;
        if (farmState.buffs.yieldPercent > 0) {
          yieldAmount = Math.floor(yieldAmount * (1 + farmState.buffs.yieldPercent / 100));
        }
        
        if (plot.remainingSeconds < minTime) {
          minTime = plot.remainingSeconds;
          reward = {
            time: plot.remainingSeconds,
            yield: yieldAmount,
            crop: crop.emoji
          };
        }
      }
    }
  });
  
  return reward;
}

// Helper: Get goods key from crop key
function getGoodsKeyFromCrop(cropKey) {
  const mapping = {
    'lungroot': 'lung_chunk',
    'heartbean': 'heart_pulse',
    'brainmint': 'brain_dust',
    'bonegrain': 'bone_shard',
    'bloodberry': 'blood_drop',
    'eyeseed': 'eye_fragment'
  };
  return mapping[cropKey] || null;
}

// Add goods to inventory
function addGoods(goodsKey, count) {
  if (!farmState.inventory[goodsKey]) {
    farmState.inventory[goodsKey] = 0;
  }
  farmState.inventory[goodsKey] += count;
  saveState();
}

// Market: Refresh prices
function refreshMarketPrices() {
  const now = Date.now();
  const windowId = Math.floor(now / MARKET_REFRESH_INTERVAL);
  
  // Check if we need to refresh
  if (windowId === farmState.market.lastWindowId && Object.keys(farmState.market.prices).length > 0) {
    return; // Already refreshed for this window
  }
  
  // Store last prices for % change calculation
  farmState.market.lastPrices = { ...farmState.market.prices };
  
  // Roll for event
  rollMarketEvent(windowId);
  
  // Generate new prices
  const goods = window.SUSFARM_DATA?.goods || {};
  Object.keys(goods).forEach(key => {
    const good = goods[key];
    if (good.basePrice === 0) {
      farmState.market.prices[key] = 0; // Not sellable
      return;
    }
    
    let multiplier = 0.8 + Math.random() * 0.6; // 0.8-1.4 base
    
    // Apply event multipliers
    if (farmState.market.activeEvent?.effects?.multipliers?.[key]) {
      multiplier *= farmState.market.activeEvent.effects.multipliers[key];
    }
    
    // Apply volatility clamp (freeze event)
    if (farmState.market.activeEvent?.effects?.volatilityClamp) {
      const [min, max] = farmState.market.activeEvent.effects.volatilityClamp;
      multiplier = Math.max(min, Math.min(max, multiplier));
    }
    
    // Apply player buffs (lung_calm reduces volatility)
    const lungCalm = farmState.player.buffs.find(b => b.id === 'lung_calm');
    if (lungCalm) {
      const reduction = lungCalm.stacks * (window.SUSFARM_DATA?.buffs.lung_calm.effects.volatilityReduction || 0);
      const center = 1.0;
      multiplier = center + (multiplier - center) * (1 - reduction);
    }
    
    // Apply anomaly effects
    if (farmState.player.anomaly.active?.id === 'nullfield_freeze') {
      multiplier = 0.98 + Math.random() * 0.04; // Clamp to 0.98-1.02
    }
    
    farmState.market.prices[key] = Math.floor(good.basePrice * multiplier);
  });
  
  farmState.market.lastWindowId = windowId;
  saveState();
}

// Market: Roll for event
function rollMarketEvent(windowId) {
  const now = Date.now();
  
  // Clear expired event
  if (farmState.market.activeEvent && now >= farmState.market.activeEvent.endsAt) {
    farmState.market.activeEvent = null;
    farmState.market.mood = 'calm';
  }
  
  // Check omen pending (force event)
  if (farmState.market.omenPending) {
    farmState.market.omenPending = false;
    const roll = Math.random();
    if (roll < 0.5) {
      triggerMarketEvent('surge', windowId);
    } else {
      triggerMarketEvent('crash', windowId);
    }
    return;
  }
  
  // Check insider tip (boost hinted good)
  if (farmState.market.hintedGoodKey) {
    const good = window.SUSFARM_DATA?.goods[farmState.market.hintedGoodKey];
    if (good) {
      const event = {
        id: 'insider_boost',
        endsAt: now + MARKET_REFRESH_INTERVAL,
        effects: {
          multipliers: { [farmState.market.hintedGoodKey]: 1.3 + Math.random() * 0.2 }
        },
        headlineKey: 'g.susfarm.market.event.insider_tip.headline',
        bodyKey: 'g.susfarm.market.event.insider_tip.body',
        targetKeys: [farmState.market.hintedGoodKey]
      };
      farmState.market.activeEvent = event;
      farmState.market.mood = 'hot';
      addMarketLog('insider_boost', { good: farmState.market.hintedGoodKey });
      farmState.market.hintedGoodKey = null;
      return;
    }
  }
  
  // Check manipulation (reverse pump)
  if (farmState.market.lastLargeSell.time > 0 && 
      now - farmState.market.lastLargeSell.time < 2 * 60 * 1000 &&
      Math.random() < 0.20) {
    triggerMarketEvent('manipulation', windowId, farmState.market.lastLargeSell.goodKey);
    farmState.market.lastLargeSell = { time: 0, value: 0, goodKey: null };
    return;
  }
  
  // Normal event roll
  const events = window.SUSFARM_DATA?.marketEvents || {};
  const roll = Math.random();
  let cumulative = 0;
  
  for (const [key, event] of Object.entries(events)) {
    if (key === 'ritual_echo' || key === 'manipulation') continue; // Special triggers
    cumulative += event.chance;
    if (roll < cumulative) {
      triggerMarketEvent(key, windowId);
      return;
    }
  }
}

// Market: Trigger specific event
function triggerMarketEvent(eventKey, windowId, extraData = null) {
  const eventDef = window.SUSFARM_DATA?.marketEvents[eventKey];
  if (!eventDef) return;
  
  const now = Date.now();
  const goods = window.SUSFARM_DATA?.goods || {};
  const effects = eventDef.effect(goods, extraData);
  
  const event = {
    id: eventKey,
    endsAt: now + MARKET_REFRESH_INTERVAL * (1 + Math.floor(Math.random() * 2)), // 1-2 windows
    effects: effects,
    headlineKey: eventDef.headlineKey,
    bodyKey: eventDef.bodyKey,
    targetKeys: effects.targetKeys || []
  };
  
  farmState.market.activeEvent = event;
  farmState.market.mood = eventDef.mood || 'calm';
  
  addMarketLog('event', { event: eventKey });
  saveState();
}

// Market: Add log entry
function addMarketLog(type, data = {}) {
  const entry = {
    type: type,
    timestamp: Date.now(),
    data: data
  };
  
  farmState.market.log.unshift(entry);
  if (farmState.market.log.length > 30) {
    farmState.market.log = farmState.market.log.slice(0, 30);
  }
  saveState();
}

// Market: Sell goods
function sellGoods(goodsKey, count = 1) {
  if (!farmState.inventory[goodsKey] || farmState.inventory[goodsKey] < count) {
    return false;
  }
  
  const good = window.SUSFARM_DATA?.goods[goodsKey];
  if (!good || good.basePrice === 0) return false;
  
  const price = farmState.market.prices[goodsKey] || good.basePrice;
  const totalValue = price * count;
  
  // Apply buffs (blood_debt)
  let profitMultiplier = 1.0;
  const bloodDebt = farmState.player.buffs.find(b => b.id === 'blood_debt');
  if (bloodDebt) {
    profitMultiplier += bloodDebt.stacks * (window.SUSFARM_DATA?.buffs.blood_debt.effects.sellProfitMultiplier || 0);
    farmState.player.metabolism.corruption += bloodDebt.stacks * (window.SUSFARM_DATA?.buffs.blood_debt.effects.corruptionPerSell || 0);
    farmState.player.anomaly.pressure += bloodDebt.stacks * (window.SUSFARM_DATA?.buffs.blood_debt.effects.anomalyPerSell || 0);
  }
  
  // Apply anomaly (corruption_bloom)
  if (farmState.player.anomaly.active?.id === 'corruption_bloom') {
    profitMultiplier += 0.10;
  }
  
  const profit = Math.floor(totalValue * profitMultiplier);
  
  // Tithe
  const tithe = Math.floor(profit * farmState.church.titheRate);
  const netProfit = profit - tithe;
  
  // Update inventory
  farmState.inventory[goodsKey] -= count;
  if (farmState.inventory[goodsKey] <= 0) {
    delete farmState.inventory[goodsKey];
  }
  
  // Add coins and credit
  window.SUS_WALLET?.add(netProfit);
  farmState.church.credit += tithe;
  
  // Track large sells for manipulation
  if (profit > 100) {
    farmState.market.lastLargeSell = {
      time: Date.now(),
      value: profit,
      goodKey: goodsKey
    };
  }
  
  // Check insider tip taunt
  if (farmState.market.hintedGoodKey === goodsKey) {
    addMarketLog('insider_taunt', { good: goodsKey });
    farmState.market.hintedGoodKey = null;
  }
  
  // Anomaly pressure from relic_gravity
  if (farmState.player.anomaly.active?.id === 'relic_gravity') {
    farmState.player.anomaly.pressure += window.SUSFARM_DATA?.anomalies.relic_gravity.effects.anomalyPressurePerTrade || 0;
  }
  
  addMarketLog('sold', { good: goodsKey, count: count, profit: profit });
  checkAnomaly();
  saveState();
  return true;
}

// Consume goods
function consumeGoods(goodsKey, count = 1) {
  const good = window.SUSFARM_DATA?.goods[goodsKey];
  if (!good || !good.edible) return false;
  
  if (!farmState.inventory[goodsKey] || farmState.inventory[goodsKey] < count) {
    return false;
  }
  
  const now = Date.now();
  const cooldown = 15 * 1000; // 15 seconds
  const timeSinceLastConsume = now - farmState.player.metabolism.lastConsumeAt;
  
  // Check cooldown
  if (timeSinceLastConsume < cooldown) {
    // Violation: add corruption
    farmState.player.metabolism.corruption += 5;
    addLog('consume_cooldown', {});
    saveState();
    return false;
  }
  
  // Apply nutrition and deltas
  for (let i = 0; i < count; i++) {
    farmState.player.metabolism.fullness += good.nutrition || 0;
    farmState.player.metabolism.purity = Math.max(0, Math.min(100, 
      farmState.player.metabolism.purity + (good.purityDelta || 0)));
    farmState.player.metabolism.corruption = Math.max(0, Math.min(100,
      farmState.player.metabolism.corruption + (good.corruptionDelta || 0)));
    farmState.player.anomaly.pressure = Math.max(0, Math.min(100,
      farmState.player.anomaly.pressure + (good.anomalyDelta || 0)));
  }
  
  // Check overeat
  if (farmState.player.metabolism.fullness > 100) {
    applyBuff('overeat', 1);
    farmState.player.anomaly.pressure = Math.min(100, farmState.player.anomaly.pressure + 10);
    addLog('overeat', {});
  }
  
  // Apply buff based on good
  const buffMap = {
    'lung_chunk': 'lung_calm',
    'heart_pulse': 'heart_surge',
    'brain_dust': 'brain_bloom',
    'blood_drop': 'blood_debt'
  };
  
  const buffId = buffMap[goodsKey];
  if (buffId) {
    applyBuff(buffId, count);
  }
  
  // Remove from inventory
  farmState.inventory[goodsKey] -= count;
  if (farmState.inventory[goodsKey] <= 0) {
    delete farmState.inventory[goodsKey];
  }
  
  farmState.player.metabolism.lastConsumeAt = now;
  addLog('consumed', { good: goodsKey, count: count });
  checkAnomaly();
  saveState();
  return true;
}

// Apply buff
function applyBuff(buffId, stacks = 1) {
  const buffDef = window.SUSFARM_DATA?.buffs[buffId];
  if (!buffDef) return;
  
  const now = Date.now();
  let existing = farmState.player.buffs.find(b => b.id === buffId);
  
  if (existing) {
    // Refresh duration and add stacks
    existing.endsAt = now + buffDef.baseDuration * 1000;
    existing.stacks = Math.min(buffDef.maxStacks, existing.stacks + stacks);
  } else {
    // Create new buff
    existing = {
      id: buffId,
      tier: 1,
      stacks: Math.min(buffDef.maxStacks, stacks),
      endsAt: now + buffDef.baseDuration * 1000,
      sourceKey: buffId,
      effects: buffDef.effects,
      tagKeys: []
    };
    farmState.player.buffs.push(existing);
  }
  
  // Special: womb_reactor adds temp plot
  if (buffId === 'womb_reactor') {
    farmState.maxPlots += 1;
  }
  
  saveState();
}

// Check and process buffs
function processBuffs(now) {
  farmState.player.buffs = farmState.player.buffs.filter(buff => {
    if (now >= buff.endsAt) {
      // Expire buff
      if (buff.id === 'womb_reactor') {
        farmState.maxPlots = Math.max(6, farmState.maxPlots - 1);
      }
      if (buff.id === 'womb_reactor' && window.SUSFARM_DATA?.buffs.womb_reactor.effects.triggerAnomalyOnExpire) {
        farmState.player.anomaly.pressure = 100; // Force anomaly
      }
      return false;
    }
    return true;
  });
  
  // Apply purity regen from lung_calm
  const lungCalm = farmState.player.buffs.find(b => b.id === 'lung_calm');
  if (lungCalm) {
    const regen = lungCalm.stacks * (window.SUSFARM_DATA?.buffs.lung_calm.effects.purityRegen || 0);
    farmState.player.metabolism.purity = Math.min(100, 
      farmState.player.metabolism.purity + regen / 60); // Per minute
  }
  
  // Apply corruption from overeat
  const overeat = farmState.player.buffs.find(b => b.id === 'overeat');
  if (overeat) {
    const gain = window.SUSFARM_DATA?.buffs.overeat.effects.corruptionGain || 0;
    farmState.player.metabolism.corruption = Math.min(100,
      farmState.player.metabolism.corruption + gain / 60); // Per minute
  }
}

// Check anomaly trigger
function checkAnomaly() {
  if (farmState.player.anomaly.pressure >= 100 && !farmState.player.anomaly.active) {
    // Trigger anomaly
    farmState.player.anomaly.pressure = 30; // Reset to 30
    
    const anomalies = window.SUSFARM_DATA?.anomalies || {};
    const keys = Object.keys(anomalies);
    const selected = keys[Math.floor(Math.random() * keys.length)];
    const anomalyDef = anomalies[selected];
    
    const now = Date.now();
    const duration = (10 + Math.random() * 10) * 60 * 1000; // 10-20 minutes
    
    farmState.player.anomaly.active = {
      id: selected,
      endsAt: now + duration,
      headlineKey: anomalyDef.headlineKey,
      bodyKey: anomalyDef.bodyKey,
      effects: anomalyDef.effects
    };
    
    addLog('anomaly', { id: selected });
    addMarketLog('anomaly', { id: selected });
    saveState();
  }
  
  // Clear expired anomaly
  const now = Date.now();
  if (farmState.player.anomaly.active && now >= farmState.player.anomaly.active.endsAt) {
    farmState.player.anomaly.active = null;
    saveState();
  }
}

// Trigger ritual echo (called from suschurch)
function triggerRitualEcho() {
  const now = Date.now();
  const windowId = Math.floor(now / MARKET_REFRESH_INTERVAL);
  if (Math.random() < 0.25) {
    triggerMarketEvent('ritual_echo', windowId);
  }
}

// Initialize state
loadState();

// Start tick loop
let tickInterval = null;
function startTickLoop() {
  if (tickInterval) clearInterval(tickInterval);
  
  tickInterval = setInterval(() => {
    processTick();
    saveState();
    if (window.updateSusFarmUI) window.updateSusFarmUI();
  }, TICK_INTERVAL * 1000);
}

// Start on load
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startTickLoop);
  } else {
    startTickLoop();
  }
}

// Export API
window.SUSFARM_STATE = {
  getState: () => farmState,
  plantCrop: plantCrop,
  waterPlot: waterPlot,
  boostPlot: boostPlot,
  harvestPlot: harvestPlot,
  buyUpgrade: buyUpgrade,
  activateRite: activateRite,
  getNextReward: getNextReward,
  saveState: saveState,
  loadState: loadState,
  // Market
  refreshMarketPrices: refreshMarketPrices,
  sellGoods: sellGoods,
  getMarketPrices: () => farmState.market.prices,
  getMarketEvent: () => farmState.market.activeEvent,
  getMarketMood: () => farmState.market.mood,
  // Consume
  consumeGoods: consumeGoods,
  // Buffs
  applyBuff: applyBuff,
  // Anomaly
  checkAnomaly: checkAnomaly,
  // Ritual
  triggerRitualEcho: triggerRitualEcho
};

