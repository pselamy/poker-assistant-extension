// Content script - runs on poker sites
// Detects cards and game state from the DOM

class PokerAssistant {
  constructor() {
    this.observer = null;
    this.currentHand = {
      holeCards: [],
      communityCards: [],
      pot: 0,
      playersActive: 0,
      myStack: 0
    };
    this.siteConfig = this.detectPokerSite();
    this.initializeObserver();
  }

  detectPokerSite() {
    const hostname = window.location.hostname;
    
    // Site-specific selectors for different poker platforms
    const siteConfigs = {
      'pokerstars.com': {
        name: 'PokerStars',
        selectors: {
          holeCards: '.hole-cards img',
          communityCards: '.community-cards img',
          pot: '.pot-size',
          playerCount: '.seat.active',
          myStack: '.my-stack'
        }
      },
      '888poker.com': {
        name: '888poker',
        selectors: {
          holeCards: '[class*="holeCard"]',
          communityCards: '[class*="boardCard"]',
          pot: '[class*="potSize"]',
          playerCount: '[class*="playerSeat"]:not(.empty)',
          myStack: '[class*="myChips"]'
        }
      }
      // Add more sites as needed
    };

    for (const [domain, config] of Object.entries(siteConfigs)) {
      if (hostname.includes(domain)) {
        console.log(`Poker Assistant: Detected ${config.name}`);
        return config;
      }
    }

    console.warn('Poker Assistant: Unknown poker site, using generic selectors');
    return {
      name: 'Generic',
      selectors: {
        holeCards: '[class*="hole"], [class*="card"][class*="player"]',
        communityCards: '[class*="community"], [class*="board"], [class*="flop"], [class*="turn"], [class*="river"]',
        pot: '[class*="pot"]',
        playerCount: '[class*="player"]:not(.folded)',
        myStack: '[class*="chips"], [class*="stack"]'
      }
    };
  }

  initializeObserver() {
    // Use MutationObserver for efficient DOM monitoring
    this.observer = new MutationObserver((mutations) => {
      this.detectGameState();
    });

    // Start observing the entire document
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'src']
    });

    console.log('Poker Assistant: Observer initialized');
  }

  detectGameState() {
    const newHoleCards = this.detectCards(this.siteConfig.selectors.holeCards);
    const newCommunityCards = this.detectCards(this.siteConfig.selectors.communityCards);
    
    // Check if hand has changed
    if (this.hasHandChanged(newHoleCards, newCommunityCards)) {
      this.currentHand.holeCards = newHoleCards;
      this.currentHand.communityCards = newCommunityCards;
      this.currentHand.pot = this.detectPot();
      this.currentHand.playersActive = this.countActivePlayers();
      this.currentHand.myStack = this.detectMyStack();
      
      this.analyzeHand();
    }
  }

  detectCards(selector) {
    const cards = [];
    const elements = document.querySelectorAll(selector);
    
    elements.forEach(element => {
      const card = this.parseCard(element);
      if (card) cards.push(card);
    });
    
    return cards;
  }

  parseCard(element) {
    // Try to extract card from image src, alt text, or class names
    const src = element.src || '';
    const alt = element.alt || '';
    const className = element.className || '';
    const text = element.textContent || '';
    
    // Common patterns: "Ah" (ace of hearts), "KS" (king of spades), etc.
    const cardPattern = /([2-9TJQKA])([hdcs])/i;
    
    let match = src.match(cardPattern) || 
                alt.match(cardPattern) || 
                className.match(cardPattern) ||
                text.match(cardPattern);
    
    if (match) {
      return {
        rank: match[1].toUpperCase(),
        suit: match[2].toLowerCase()
      };
    }
    
    return null;
  }

  hasHandChanged(newHoleCards, newCommunityCards) {
    return JSON.stringify(newHoleCards) !== JSON.stringify(this.currentHand.holeCards) ||
           JSON.stringify(newCommunityCards) !== JSON.stringify(this.currentHand.communityCards);
  }

  detectPot() {
    const potElement = document.querySelector(this.siteConfig.selectors.pot);
    if (potElement) {
      const potText = potElement.textContent;
      const potValue = parseFloat(potText.replace(/[^0-9.]/g, ''));
      return isNaN(potValue) ? 0 : potValue;
    }
    return 0;
  }

  countActivePlayers() {
    const players = document.querySelectorAll(this.siteConfig.selectors.playerCount);
    return players.length;
  }

  detectMyStack() {
    const stackElement = document.querySelector(this.siteConfig.selectors.myStack);
    if (stackElement) {
      const stackText = stackElement.textContent;
      const stackValue = parseFloat(stackText.replace(/[^0-9.]/g, ''));
      return isNaN(stackValue) ? 0 : stackValue;
    }
    return 0;
  }

  analyzeHand() {
    if (this.currentHand.holeCards.length < 2) return;
    
    console.log('Poker Assistant: Analyzing hand', this.currentHand);
    
    // Send to background script for solver analysis
    chrome.runtime.sendMessage({
      action: 'analyzeHand',
      hand: this.currentHand
    }, (response) => {
      if (response && response.recommendation) {
        this.displayRecommendation(response.recommendation);
      }
    });
  }

  displayRecommendation(recommendation) {
    // Remove any existing recommendation
    const existingOverlay = document.getElementById('poker-assistant-overlay');
    if (existingOverlay) {
      existingOverlay.remove();
    }
    
    // Create new overlay
    const overlay = document.createElement('div');
    overlay.id = 'poker-assistant-overlay';
    overlay.className = 'poker-assistant-recommendation';
    overlay.innerHTML = `
      <div class="pa-header">Poker Assistant</div>
      <div class="pa-recommendation">${recommendation.action}</div>
      <div class="pa-details">
        <div>Win Rate: ${recommendation.winRate}%</div>
        <div>EV: ${recommendation.expectedValue}</div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      overlay.classList.add('fade-out');
      setTimeout(() => overlay.remove(), 500);
    }, 5000);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new PokerAssistant());
} else {
  new PokerAssistant();
}

console.log('Poker Assistant: Content script loaded');
