# Poker Assistant Chrome Extension

A real-time poker hand analyzer that runs directly in your browser. The extension automatically detects your cards, analyzes the game state, and provides instant strategic recommendations.

## Features

- **Automatic Card Detection**: Uses DOM observation to detect your hole cards and community cards in real-time
- **Instant Analysis**: Provides recommendations without any manual input
- **Multi-Site Support**: Works on major poker platforms:
  - PokerStars
  - 888poker
  - PartyPoker
  - GGPoker
  - WSOP
- **Overlay Recommendations**: Shows strategic advice directly on the poker table
- **Session Statistics**: Tracks your performance over time
- **Customizable Settings**: Toggle auto-analysis, overlays, and sound alerts

## Installation

### Developer Mode (Current)

1. Clone this repository:
   ```bash
   git clone https://github.com/pselamy/poker-assistant-extension.git
   cd poker-assistant-extension
   ```

2. Open Chrome and go to `chrome://extensions/`

3. Enable "Developer mode" in the top right

4. Click "Load unpacked" and select the extension directory

5. The extension icon should appear in your toolbar

### Chrome Web Store (Future)

Once published, you'll be able to install directly from the Chrome Web Store.

## How It Works

1. **Content Script**: Runs on poker sites and monitors the DOM for cards and game state
2. **Background Worker**: Analyzes hands using poker algorithms and returns recommendations
3. **Overlay Display**: Shows recommendations directly on the poker table for 5 seconds

## Architecture

```
poker-assistant-extension/
├── manifest.json          # Extension configuration
├── content.js            # DOM monitoring and card detection
├── background.js         # Poker solver logic
├── overlay.css          # Recommendation overlay styles
├── popup.html           # Extension popup interface
├── popup.css           # Popup styles
├── popup.js            # Popup functionality
└── icons/              # Extension icons
```

## Key Technologies

- **Chrome Extension Manifest V3**: Modern extension architecture
- **MutationObserver**: Efficient DOM monitoring
- **Poker Hand Evaluation**: Built-in hand strength calculator
- **Chrome Storage API**: Persistent settings and statistics

## Privacy & Security

- All analysis happens locally in your browser
- No data is sent to external servers
- No screenshots or screen recording
- Only reads publicly visible game information

## Development

### Adding New Poker Sites

Edit `content.js` and add site-specific selectors:

```javascript
'newpokersite.com': {
  name: 'New Poker Site',
  selectors: {
    holeCards: '.your-cards-selector',
    communityCards: '.board-cards-selector',
    pot: '.pot-amount',
    playerCount: '.active-players',
    myStack: '.my-chips'
  }
}
```

### Improving Hand Analysis

The current analyzer uses a simplified approach. To integrate advanced solvers:

1. **Option 1**: Include pokersolver.js library
2. **Option 2**: Use wasm-postflop for GTO calculations
3. **Option 3**: Create a separate solver service

## Roadmap

- [ ] Add more poker sites
- [ ] Integrate advanced GTO solver
- [ ] Add hand history tracking
- [ ] Implement HUD statistics
- [ ] Support for tournaments vs cash games
- [ ] Multi-table support
- [ ] Export session data
- [ ] Mobile responsive overlay

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on multiple poker sites
5. Submit a pull request

## License

MIT License - See LICENSE file

## Disclaimer

This tool is for educational purposes. Always follow the terms of service of the poker sites you play on. Using assistive tools may be against some sites' policies.
