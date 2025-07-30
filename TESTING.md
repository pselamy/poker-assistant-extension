# Quick Start Guide

## Testing the Extension

1. **Open Chrome Extensions Page**
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)

2. **Load the Extension**
   - Click "Load unpacked"
   - Select the `poker-assistant-extension` folder
   - The extension should appear in your extensions list

3. **Test on a Poker Site**
   - Visit any supported poker site:
     - PokerStars.com
     - 888poker.com
     - PartyPoker.com
     - GGPoker.com
     - WSOP.com
   - Join a table or open a replay
   - The extension will automatically detect cards

4. **Check the Console**
   - Right-click on the poker page
   - Select "Inspect" 
   - Go to Console tab
   - You should see "Poker Assistant: Content script loaded"

5. **View Recommendations**
   - When cards are dealt, a recommendation overlay will appear
   - It shows for 5 seconds in the top-right corner

## Troubleshooting

- **No overlay appearing?**
  - Check if the site is supported
  - Look for errors in the console
  - Try refreshing the page

- **Cards not detected?**
  - The site may use different HTML structure
  - Check console for detection attempts
  - May need to add site-specific selectors

## Development Tips

- Use Chrome DevTools to inspect poker site elements
- Test with play money tables first
- Monitor the console for debugging info
- The extension reloads automatically when you save changes
