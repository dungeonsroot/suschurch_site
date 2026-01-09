// Unified Wallet API for SUS Church
// Single Source of Truth for suscoin across all modules

(function() {
  'use strict';
  
  const WALLET_KEY = 'sus.wallet.suscoin';
  const DEFAULT_COIN = 100;
  
  // Initialize wallet if not exists
  function initWallet() {
    try {
      const existing = localStorage.getItem(WALLET_KEY);
      if (existing === null) {
        // Try to migrate from old state
        const oldState = localStorage.getItem('sus_state_v1');
        if (oldState) {
          try {
            const parsed = JSON.parse(oldState);
            if (parsed.wallet && parsed.wallet.suscoin !== undefined) {
              localStorage.setItem(WALLET_KEY, parsed.wallet.suscoin.toString());
              return parsed.wallet.suscoin;
            }
          } catch (e) {
            // ignore
          }
        }
        localStorage.setItem(WALLET_KEY, DEFAULT_COIN.toString());
        return DEFAULT_COIN;
      }
      return parseInt(existing, 10) || DEFAULT_COIN;
    } catch (e) {
      console.error('Failed to init wallet:', e);
      return DEFAULT_COIN;
    }
  }
  
  // Get current balance
  function get() {
    try {
      const val = localStorage.getItem(WALLET_KEY);
      if (val === null) {
        return initWallet();
      }
      return parseInt(val, 10) || 0;
    } catch (e) {
      console.error('Failed to get wallet:', e);
      return 0;
    }
  }
  
  // Add coins
  function add(amount) {
    if (amount <= 0) return;
    try {
      const current = get();
      const newBalance = current + amount;
      localStorage.setItem(WALLET_KEY, newBalance.toString());
      window.dispatchEvent(new CustomEvent('walletChanged', { detail: { balance: newBalance } }));
      return newBalance;
    } catch (e) {
      console.error('Failed to add to wallet:', e);
      return get();
    }
  }
  
  // Spend coins (returns true if successful, false if insufficient)
  function spend(amount) {
    if (amount <= 0) return true;
    try {
      const current = get();
      if (current < amount) {
        return false;
      }
      const newBalance = current - amount;
      localStorage.setItem(WALLET_KEY, newBalance.toString());
      window.dispatchEvent(new CustomEvent('walletChanged', { detail: { balance: newBalance } }));
      return true;
    } catch (e) {
      console.error('Failed to spend from wallet:', e);
      return false;
    }
  }
  
  // Initialize on load
  initWallet();
  
  // Expose API
  window.SUS_WALLET = {
    get: get,
    add: add,
    spend: spend
  };
})();

