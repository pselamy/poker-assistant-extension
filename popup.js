// Popup script - handles extension popup interface

// Load settings and stats when popup opens
document.addEventListener('DOMContentLoaded', () => {
  loadStatus();
  loadStats();
  loadSettings();
  setupEventListeners();
});

function loadStatus() {
  // Check if content script is active on current tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    const statusEl = document.getElementById('status');
    const statusTextEl = document.getElementById('status-text');
    
    // Check if we're on a supported poker site
    const supportedSites = ['pokerstars.com', '888poker.com', 'partypoker.com', 'ggpoker.com', 'wsop.com'];
    const isSupported = supportedSites.some(site => tab.url?.includes(site));
    
    if (isSupported) {
      statusEl.classList.add('active');
      statusTextEl.textContent = 'Active on this site';
    } else {
      statusEl.classList.remove('active');
      statusTextEl.textContent = 'Not on a poker site';
    }
  });
}

function loadStats() {
  // Load statistics from storage
  chrome.storage.local.get(['stats'], (result) => {
    const stats = result.stats || {
      handsAnalyzed: 0,
      handsWon: 0,
      totalProfit: 0
    };
    
    document.getElementById('hands-count').textContent = stats.handsAnalyzed;
    
    const winRate = stats.handsAnalyzed > 0 
      ? Math.round((stats.handsWon / stats.handsAnalyzed) * 100) 
      : 0;
    document.getElementById('win-rate').textContent = winRate + '%';
    
    const profitEl = document.getElementById('profit-loss');
    profitEl.textContent = '$' + stats.totalProfit.toFixed(2);
    profitEl.style.color = stats.totalProfit >= 0 ? '#4caf50' : '#f44336';
  });
}

function loadSettings() {
  // Load settings from storage
  chrome.storage.local.get(['settings'], (result) => {
    const settings = result.settings || {
      autoAnalyze: true,
      showOverlay: true,
      soundAlerts: false
    };
    
    document.getElementById('auto-analyze').checked = settings.autoAnalyze;
    document.getElementById('show-overlay').checked = settings.showOverlay;
    document.getElementById('sound-alerts').checked = settings.soundAlerts;
  });
}

function setupEventListeners() {
  // Save settings when changed
  const settingsInputs = document.querySelectorAll('.settings-section input');
  settingsInputs.forEach(input => {
    input.addEventListener('change', saveSettings);
  });
  
  // Reset statistics button
  document.getElementById('reset-stats').addEventListener('click', () => {
    if (confirm('Reset all statistics?')) {
      chrome.storage.local.set({
        stats: {
          handsAnalyzed: 0,
          handsWon: 0,
          totalProfit: 0
        }
      }, () => {
        loadStats();
      });
    }
  });
  
  // Advanced settings button
  document.getElementById('open-settings').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
}

function saveSettings() {
  const settings = {
    autoAnalyze: document.getElementById('auto-analyze').checked,
    showOverlay: document.getElementById('show-overlay').checked,
    soundAlerts: document.getElementById('sound-alerts').checked
  };
  
  chrome.storage.local.set({ settings }, () => {
    // Notify content scripts of settings change
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          action: 'settingsUpdated',
          settings: settings
        }).catch(() => {
          // Ignore errors for tabs without content script
        });
      });
    });
  });
}
