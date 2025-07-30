// Background service worker
// Handles poker solver logic and communication with content script

// Import poker solver library (we'll use pokersolver as it's JavaScript native)
// In production, you'd include the actual library
// importScripts('lib/pokersolver.js');

// Simple poker hand evaluator for MVP
class SimplePokerEvaluator {
  constructor() {
    this.handRankings = {
      'AA': 85, 'KK': 82, 'QQ': 80, 'JJ': 77, 'TT': 75,
      'AK': 67, 'AQ': 66, 'AJ': 65, 'KQ': 63, 'KJ': 62,
      '99': 72, '88': 69, '77': 66, '66': 63, '55': 60,
      '44': 57, '33': 54, '22': 51
    };
  }

  evaluateHand(holeCards, communityCards, pot, playersActive, stack) {
    // Convert cards to standard notation
    const hand = this.formatHand(holeCards);
    const baseWinRate = this.getBaseWinRate(hand, playersActive);
    
    // Adjust for community cards
    const adjustedWinRate = this.adjustForCommunityCards(baseWinRate, communityCards);
    
    // Calculate pot odds
    const potOdds = this.calculatePotOdds(pot, stack);
    
    // Generate recommendation
    return this.generateRecommendation(adjustedWinRate, potOdds, stack, pot);
  }

  formatHand(holeCards) {
    if (holeCards.length < 2) return '';
    
    const [card1, card2] = holeCards;
    const rank1 = card1.rank;
    const rank2 = card2.rank;
    const suited = card1.suit === card2.suit;
    
    // Format as standard notation (e.g., "AK", "99")
    if (rank1 === rank2) {
      return rank1 + rank2;
    } else {
      // Higher rank first
      const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
      const r1Index = ranks.indexOf(rank1);
      const r2Index = ranks.indexOf(rank2);
      
      if (r1Index > r2Index) {
        return rank1 + rank2 + (suited ? 's' : '');
      } else {
        return rank2 + rank1 + (suited ? 's' : '');
      }
    }
  }

  getBaseWinRate(hand, playersActive) {
    // Get base win rate from pre-computed table
    let baseRate = this.handRankings[hand.replace('s', '')] || 50;
    
    // Adjust for number of players
    const playerAdjustment = Math.pow(0.85, playersActive - 2);
    return baseRate * playerAdjustment;
  }

  adjustForCommunityCards(baseWinRate, communityCards) {
    // Simple adjustments based on board texture
    let adjustment = 1.0;
    
    if (communityCards.length >= 3) {
      // Check for flush possibilities
      const suits = communityCards.map(c => c.suit);
      const suitCounts = {};
      suits.forEach(s => suitCounts[s] = (suitCounts[s] || 0) + 1);
      
      if (Object.values(suitCounts).some(count => count >= 3)) {
        adjustment *= 0.9; // Flush possible
      }
      
      // Check for straight possibilities
      const ranks = communityCards.map(c => c.rank);
      if (this.hasStraightPossibility(ranks)) {
        adjustment *= 0.9; // Straight possible
      }
    }
    
    return baseWinRate * adjustment;
  }

  hasStraightPossibility(ranks) {
    const rankValues = {
      '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
      '8': 8, '9': 9, 'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
    };
    
    const values = ranks.map(r => rankValues[r]).sort((a, b) => a - b);
    
    for (let i = 0; i < values.length - 2; i++) {
      if (values[i + 2] - values[i] <= 4) {
        return true;
      }
    }
    
    return false;
  }

  calculatePotOdds(pot, stack) {
    if (pot === 0) return 0;
    return pot / (pot + stack);
  }

  generateRecommendation(winRate, potOdds, stack, pot) {
    let action = '';
    let sizingRecommendation = '';
    
    if (winRate > 75) {
      action = 'RAISE';
      sizingRecommendation = `${Math.round(pot * 0.75)} - ${Math.round(pot * 1.0)}`;
    } else if (winRate > 60) {
      action = 'RAISE/CALL';
      sizingRecommendation = `${Math.round(pot * 0.5)} - ${Math.round(pot * 0.75)}`;
    } else if (winRate > 45) {
      action = 'CALL';
      sizingRecommendation = 'Call if bet is reasonable';
    } else if (winRate > 30) {
      action = 'CHECK/FOLD';
      sizingRecommendation = 'Check if possible, fold to large bets';
    } else {
      action = 'FOLD';
      sizingRecommendation = 'Fold to any bet';
    }
    
    return {
      action: action,
      sizing: sizingRecommendation,
      winRate: Math.round(winRate),
      expectedValue: this.calculateEV(winRate, pot, stack)
    };
  }

  calculateEV(winRate, pot, stack) {
    const ev = (winRate / 100) * pot - ((100 - winRate) / 100) * Math.min(pot * 0.5, stack * 0.1);
    return ev > 0 ? `+$${Math.round(ev)}` : `-$${Math.round(Math.abs(ev))}`;
  }
}

// Initialize evaluator
const evaluator = new SimplePokerEvaluator();

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyzeHand') {
    const { holeCards, communityCards, pot, playersActive, myStack } = request.hand;
    
    try {
      const recommendation = evaluator.evaluateHand(
        holeCards,
        communityCards,
        pot,
        playersActive,
        myStack
      );
      
      sendResponse({ recommendation });
    } catch (error) {
      console.error('Error analyzing hand:', error);
      sendResponse({ error: 'Failed to analyze hand' });
    }
  }
  
  return true; // Keep message channel open for async response
});

console.log('Poker Assistant: Background script loaded');
