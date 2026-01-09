// SusFarm - Crop and Upgrade Definitions

const SUSFARM_DATA = {
  crops: {
    lungroot: {
      key: 'lungroot',
      emoji: '🫁',
      nameKey: 'g.susfarm.crop.lungroot',
      growSeconds: 300, // 5 min
      baseYield: 30,
      seedCost: 5,
      risk: 'low',
      special: null
    },
    heartbean: {
      key: 'heartbean',
      emoji: '🫀',
      nameKey: 'g.susfarm.crop.heartbean',
      growSeconds: 480, // 8 min
      baseYield: 55,
      seedCost: 5,
      risk: 'medium',
      special: {
        type: 'crit',
        chance: 0.10, // 10% chance double yield
        description: '10% chance for double yield'
      }
    },
    brainmint: {
      key: 'brainmint',
      emoji: '🧠',
      nameKey: 'g.susfarm.crop.brainmint',
      growSeconds: 600, // 10 min
      baseYield: 70,
      seedCost: 5,
      risk: 'low',
      special: {
        type: 'buff',
        duration: 600, // 10 minutes
        effect: { yieldPercent: 10 }, // +10% global yield
        description: 'Grants +10% yield buff for 10 minutes'
      }
    },
    bonegrain: {
      key: 'bonegrain',
      emoji: '🦴',
      nameKey: 'g.susfarm.crop.bonegrain',
      growSeconds: 720, // 12 min
      baseYield: 85,
      seedCost: 5,
      risk: 'high',
      special: {
        type: 'wither',
        chance: 0.08, // 8% chance per tick
        description: '8% chance to wither each tick'
      }
    },
    bloodberry: {
      key: 'bloodberry',
      emoji: '🩸',
      nameKey: 'g.susfarm.crop.bloodberry',
      growSeconds: 360, // 6 min
      baseYield: 40,
      seedCost: 5,
      risk: 'medium',
      special: {
        type: 'event',
        chance: 0.05, // +5% event chance
        description: 'Increases random event chance'
      }
    },
    eyeseed: {
      key: 'eyeseed',
      emoji: '👁️',
      nameKey: 'g.susfarm.crop.eyeseed',
      growSeconds: 900, // 15 min
      baseYield: 120,
      seedCost: 5,
      risk: 'low',
      special: {
        type: 'rare',
        chance: 0.05, // 5% chance rare goods
        description: '5% chance to drop rare goods'
      }
    }
  },
  
  upgrades: {
    land: {
      key: 'land',
      nameKey: 'g.susfarm.upgrade.land',
      maxLevel: 10,
      costs: [200, 600, 1400, 3000, 6000, 12000, 25000, 50000, 100000, 200000],
      effect: (level) => ({ plots: 3 * level }) // +3 plots per level
    },
    automation: {
      key: 'automation',
      nameKey: 'g.susfarm.upgrade.auto',
      maxLevel: 5,
      costs: [300, 900, 2000, 5000, 12000],
      effect: (level) => {
        const effects = {};
        if (level >= 1) effects.autoHarvest = true;
        if (level >= 2) effects.autoReplant = true;
        if (level >= 3) effects.autoWater = true;
        return effects;
      }
    },
    ritual: {
      key: 'ritual',
      nameKey: 'g.susfarm.upgrade.ritual',
      maxLevel: 3,
      costs: [500, 2000, 8000],
      effect: (level) => ({ buffDuration: 30 * 60 * (1 + level * 0.5) }) // 30min, 45min, 60min
    }
  },
  
  rites: {
    baptism: {
      key: 'baptism',
      nameKey: 'g.susfarm.rite.baptism',
      descKey: 'g.susfarm.rite.baptism.desc',
      cost: 50,
      duration: 30 * 60, // 30 minutes
      effect: { yieldPercent: 10 } // +10% yield
    }
  },
  
  // Goods definitions
  goods: {
    lung_chunk: {
      key: 'lung_chunk',
      emoji: '🫁',
      nameKey: 'g.susfarm.goods.lung_chunk',
      basePrice: 12,
      volatility: 0.15, // ±15%
      rarity: 'common',
      edible: true,
      nutrition: 18,
      purityDelta: 6,
      corruptionDelta: -2,
      anomalyDelta: 4,
      sourceCrop: 'lungroot'
    },
    heart_pulse: {
      key: 'heart_pulse',
      emoji: '🫀',
      nameKey: 'g.susfarm.goods.heart_pulse',
      basePrice: 18,
      volatility: 0.25, // ±25% (higher)
      rarity: 'common',
      edible: true,
      nutrition: 22,
      purityDelta: 4,
      corruptionDelta: 2,
      anomalyDelta: 5,
      sourceCrop: 'heartbean'
    },
    brain_dust: {
      key: 'brain_dust',
      emoji: '🧠',
      nameKey: 'g.susfarm.goods.brain_dust',
      basePrice: 22,
      volatility: 0.18,
      rarity: 'common',
      edible: true,
      nutrition: 20,
      purityDelta: 8,
      corruptionDelta: -3,
      anomalyDelta: 3,
      sourceCrop: 'brainmint'
    },
    bone_shard: {
      key: 'bone_shard',
      emoji: '🦴',
      nameKey: 'g.susfarm.goods.bone_shard',
      basePrice: 35,
      volatility: 0.12, // Lower volatility
      rarity: 'uncommon',
      edible: false,
      sourceCrop: 'bonegrain'
    },
    blood_drop: {
      key: 'blood_drop',
      emoji: '🩸',
      nameKey: 'g.susfarm.goods.blood_drop',
      basePrice: 15,
      volatility: 0.22,
      rarity: 'common',
      edible: true,
      nutrition: 16,
      purityDelta: -2,
      corruptionDelta: 8,
      anomalyDelta: 6,
      sourceCrop: 'bloodberry'
    },
    eye_fragment: {
      key: 'eye_fragment',
      emoji: '👁️',
      nameKey: 'g.susfarm.goods.eye_fragment',
      basePrice: 60,
      volatility: 0.20,
      rarity: 'rare',
      edible: false,
      sourceCrop: 'eyeseed'
    },
    relic_seed: {
      key: 'relic_seed',
      emoji: '🔮',
      nameKey: 'g.susfarm.goods.relic_seed',
      basePrice: 100,
      volatility: 0.30,
      rarity: 'legendary',
      edible: false,
      sourceCrop: null // Event only
    },
    omen_token: {
      key: 'omen_token',
      emoji: '🧿',
      nameKey: 'g.susfarm.goods.omen_token',
      basePrice: 0, // Not sellable
      volatility: 0,
      rarity: 'special',
      edible: false,
      sourceCrop: null // Ritual only
    }
  },
  
  // Market events
  marketEvents: {
    surge: {
      id: 'surge',
      chance: 0.12,
      mood: 'hot',
      headlineKey: 'g.susfarm.market.event.surge.headline',
      bodyKey: 'g.susfarm.market.event.surge.body',
      effect: (goods) => {
        const targets = Object.keys(goods).filter(k => Math.random() < 0.3);
        const multipliers = {};
        targets.forEach(key => {
          multipliers[key] = 1.2 + Math.random() * 0.4; // 1.2-1.6
        });
        return { multipliers, mood: 'hot' };
      }
    },
    crash: {
      id: 'crash',
      chance: 0.10,
      mood: 'panic',
      headlineKey: 'g.susfarm.market.event.crash.headline',
      bodyKey: 'g.susfarm.market.event.crash.body',
      effect: (goods) => {
        const target = Object.keys(goods)[Math.floor(Math.random() * Object.keys(goods).length)];
        return {
          multipliers: { [target]: 0.5 + Math.random() * 0.3 }, // 0.5-0.8
          mood: 'panic'
        };
      }
    },
    freeze: {
      id: 'freeze',
      chance: 0.07,
      mood: 'calm',
      headlineKey: 'g.susfarm.market.event.freeze.headline',
      bodyKey: 'g.susfarm.market.event.freeze.body',
      effect: () => ({
        volatilityClamp: [0.95, 1.05],
        mood: 'calm'
      })
    },
    omen_leak: {
      id: 'omen_leak',
      chance: 0.06,
      mood: 'corrupted',
      headlineKey: 'g.susfarm.market.event.omen_leak.headline',
      bodyKey: 'g.susfarm.market.event.omen_leak.body',
      effect: () => ({
        omenPending: true,
        mood: 'corrupted'
      })
    },
    insider_tip: {
      id: 'insider_tip',
      chance: 0.04,
      mood: 'hot',
      headlineKey: 'g.susfarm.market.event.insider_tip.headline',
      bodyKey: 'g.susfarm.market.event.insider_tip.body',
      effect: (goods) => {
        const hinted = Object.keys(goods)[Math.floor(Math.random() * Object.keys(goods).length)];
        return {
          hintedGoodKey: hinted,
          mood: 'hot'
        };
      }
    },
    relic_listing: {
      id: 'relic_listing',
      chance: 0.03,
      mood: 'sacred',
      headlineKey: 'g.susfarm.market.event.relic_listing.headline',
      bodyKey: 'g.susfarm.market.event.relic_listing.body',
      effect: () => ({
        relicListing: true,
        mood: 'sacred'
      })
    },
    ritual_echo: {
      id: 'ritual_echo',
      chance: 0.25, // Triggered by ritual
      mood: 'sacred',
      headlineKey: 'g.susfarm.market.event.ritual_echo.headline',
      bodyKey: 'g.susfarm.market.event.ritual_echo.body',
      effect: () => ({
        multipliers: { omen_token: 1.1 },
        mood: 'sacred'
      })
    },
    manipulation: {
      id: 'manipulation',
      chance: 0.20, // Triggered by large sell
      mood: 'corrupted',
      headlineKey: 'g.susfarm.market.event.manipulation.headline',
      bodyKey: 'g.susfarm.market.event.manipulation.body',
      effect: (goods, manipulatedKey) => ({
        multipliers: { [manipulatedKey]: 1.3 + Math.random() * 0.3 }, // Reverse pump
        mood: 'corrupted'
      })
    }
  },
  
  // Buffs
  buffs: {
    heart_surge: {
      id: 'heart_surge',
      nameKey: 'g.susfarm.buff.heart_surge.name',
      descKey: 'g.susfarm.buff.heart_surge.desc',
      emoji: '🫀',
      baseDuration: 10 * 60, // 10 minutes
      maxStacks: 5,
      effects: {
        growthSpeedMultiplier: 0.15, // +15% per stack
        marketHeatBonus: 0.1 // +10% surge chance per stack
      }
    },
    brain_bloom: {
      id: 'brain_bloom',
      nameKey: 'g.susfarm.buff.brain_bloom.name',
      descKey: 'g.susfarm.buff.brain_bloom.desc',
      emoji: '🧠',
      baseDuration: 10 * 60,
      maxStacks: 5,
      effects: {
        extraSpores: 1,
        confessSuccessBonus: 0.10
      }
    },
    lung_calm: {
      id: 'lung_calm',
      nameKey: 'g.susfarm.buff.lung_calm.name',
      descKey: 'g.susfarm.buff.lung_calm.desc',
      emoji: '🫁',
      baseDuration: 10 * 60,
      maxStacks: 5,
      effects: {
        volatilityReduction: 0.3,
        purityRegen: 2 // per minute
      }
    },
    blood_debt: {
      id: 'blood_debt',
      nameKey: 'g.susfarm.buff.blood_debt.name',
      descKey: 'g.susfarm.buff.blood_debt.desc',
      emoji: '🩸',
      baseDuration: 10 * 60,
      maxStacks: 5,
      effects: {
        sellProfitMultiplier: 0.2,
        corruptionPerSell: 3,
        anomalyPerSell: 2
      }
    },
    womb_reactor: {
      id: 'womb_reactor',
      nameKey: 'g.susfarm.buff.womb_reactor.name',
      descKey: 'g.susfarm.buff.womb_reactor.desc',
      emoji: '🫃',
      baseDuration: 10 * 60,
      maxStacks: 1, // Only 1 stack
      effects: {
        tempPlotBonus: 1,
        triggerAnomalyOnExpire: true
      }
    },
    overeat: {
      id: 'overeat',
      nameKey: 'g.susfarm.buff.overeat.name',
      descKey: 'g.susfarm.buff.overeat.desc',
      emoji: '🫨',
      baseDuration: 5 * 60, // 5 minutes debuff
      maxStacks: 1,
      effects: {
        yieldReduction: -0.15,
        corruptionGain: 1 // per minute
      }
    }
  },
  
  // Anomalies
  anomalies: {
    blessing_overflow: {
      id: 'blessing_overflow',
      headlineKey: 'g.susfarm.anomaly.blessing_overflow.headline',
      bodyKey: 'g.susfarm.anomaly.blessing_overflow.body',
      effects: {
        ritualSuccessBonus: 0.25,
        marketSurgeChanceBonus: 0.15
      }
    },
    corruption_bloom: {
      id: 'corruption_bloom',
      headlineKey: 'g.susfarm.anomaly.corruption_bloom.headline',
      bodyKey: 'g.susfarm.anomaly.corruption_bloom.body',
      effects: {
        crashChanceBonus: 0.15,
        manipulationChanceBonus: 0.10,
        sellProfitBonus: 0.10
      }
    },
    inverse_mercy: {
      id: 'inverse_mercy',
      headlineKey: 'g.susfarm.anomaly.inverse_mercy.headline',
      bodyKey: 'g.susfarm.anomaly.inverse_mercy.body',
      effects: {
        ritualPurityLoss: 5,
        ritualCorruptionGain: 3,
        ritualCreditBonus: 0.2
      }
    },
    nullfield_freeze: {
      id: 'nullfield_freeze',
      headlineKey: 'g.susfarm.anomaly.nullfield_freeze.headline',
      bodyKey: 'g.susfarm.anomaly.nullfield_freeze.body',
      effects: {
        marketVolatilityClamp: [0.98, 1.02],
        growthSpeedReduction: -0.20
      }
    },
    relic_gravity: {
      id: 'relic_gravity',
      headlineKey: 'g.susfarm.anomaly.relic_gravity.headline',
      bodyKey: 'g.susfarm.anomaly.relic_gravity.body',
      effects: {
        relicListingChanceMultiplier: 2.0,
        anomalyPressurePerTrade: 2
      }
    },
    glitch_harvest: {
      id: 'glitch_harvest',
      headlineKey: 'g.susfarm.anomaly.glitch_harvest.headline',
      bodyKey: 'g.susfarm.anomaly.glitch_harvest.body',
      effects: {
        harvestMutationChance: 0.20
      }
    }
  }
};

// Export for use in other scripts
window.SUSFARM_DATA = SUSFARM_DATA;

