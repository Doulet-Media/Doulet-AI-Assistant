# Universal Compatibility Guide - Doulet AI Assistant

This guide explains the universal compatibility features added in version 2.2.0 of the Doulet AI Assistant extension.

## 🌐 Universal Website Support

The extension now works seamlessly across all websites, including previously restricted platforms:

### ✅ Google Workspace Compatibility

**Google Docs, Sheets, Slides:**
- Extension automatically loads with enhanced permissions
- Works with document text selection
- Compatible with Google's content security policies
- No interference with Google's native features

**Gmail:**
- Works in compose windows
- Compatible with email text selection
- Enhanced permissions for Google domains

### 🔒 Restricted Site Support

The extension now works on sites with strict content security policies:

- **Social Media**: Facebook, Twitter, LinkedIn
- **E-commerce**: Amazon, eBay, Shopify
- **Banking/Finance**: Major banking websites
- **Government**: .gov and .edu sites
- **Enterprise**: Corporate intranets and portals

## 🎨 Non-Intrusive Design

### Small, Unobtrusive Button
- **Size**: 40px circular button (reduced from larger rectangular design)
- **Design**: Clean, minimal icon-only interface
- **Visibility**: Appears only when text is selected
- **Positioning**: Smart placement near selection without blocking content

### Smart Positioning Algorithm
```javascript
// Button positioning logic:
1. Calculate selection position
2. Position button near selection
3. Check viewport boundaries
4. Adjust position to stay on screen
5. Avoid overlapping with content
```

### Visual Design
- **Color Scheme**: Purple gradient (consistent branding)
- **Hover Effects**: Subtle scale and shadow animations
- **Transparency**: Clean, modern appearance
- **Accessibility**: Clear visual feedback

## ⌨️ New Keyboard Shortcut

### Why Change from Ctrl+Shift+A?
- **Conflicts**: Many browsers and sites use this shortcut
- **Google Docs**: Uses Ctrl+Shift+A for text formatting
- **Browser Extensions**: Common conflict with other tools

### New Shortcut: Ctrl+Shift+Q
- **Windows/Linux**: Ctrl+Shift+Q
- **Mac**: Cmd+Shift+Q
- **Availability**: Rarely used by browsers or websites
- **Consistency**: Available in manifest.json for system recognition

### Enhanced Keyboard Handling
```javascript
// New keyboard shortcut features:
1. Prevents default browser behavior
2. Shows pulse animation if no text selected
3. Provides visual feedback
4. Works across all supported websites
```

## 🔧 Technical Enhancements

### Manifest.json Updates
```json
{
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "run_at": "document_end",  // Ensures page loads first
      "all_frames": false       // Prevents iframe conflicts
    }
  ],
  "host_permissions": [
    "https://*.openrouter.ai/*",
    "https://docs.google.com/*",    // Google Docs support
    "https://drive.google.com/*"    // Google Drive support
  ],
  "commands": {
    "_execute_action": {
      "suggested_key": {
        "default": "Ctrl+Shift+Q",
        "mac": "Command+Shift+Q"
      }
    }
  }
}
```

### Permission Enhancements
- **tabs**: Added for better page interaction
- **Google Workspace**: Specific permissions for docs.google.com
- **Universal Matching**: <all_urls> with smart loading

## 🎯 Usage Examples

### Google Docs Workflow
1. Open a Google Doc
2. Select text in your document
3. Small 🤖 button appears near selection
4. Click button or press Ctrl+Shift+Q
5. Get AI answer in modal window

### Social Media Workflow
1. Select text in a Facebook post, Twitter tweet, etc.
2. Button appears without blocking the content
3. Click to get instant AI analysis
4. Modal appears with response

### No Selection Handling
- If no text selected when using Ctrl+Shift+Q:
  - Button appears with pulse animation
  - Visual cue to select text first
  - Gentle user guidance

## 🛠️ Troubleshooting Universal Compatibility

### Google Docs Not Working?
1. Ensure extension is enabled
2. Refresh the Google Docs page
3. Check for conflicting extensions
4. Try in incognito mode

### Button Not Appearing?
1. Verify text selection (minimum 3 characters)
2. Check if button is positioned off-screen
3. Disable other content-modifying extensions
4. Try on different websites to isolate issue

### Keyboard Shortcut Conflicts?
The new Ctrl+Shift+Q should have minimal conflicts, but if issues persist:
1. Check other browser extensions
2. Verify no system-level shortcuts conflict
3. Try alternative activation methods (button or context menu)

## 📊 Performance Improvements

### Faster Loading
- **Document Ready**: Waits for document_end
- **Smart Initialization**: Only loads when needed
- **Minimal Overhead**: Small button, fast response

### Better Resource Management
- **Memory Efficient**: Removes button when not in use
- **CPU Optimized**: Minimal event listeners
- **Network Smart**: Caches model lists and settings

## 🔮 Future Enhancements

### Planned Universal Features
- **Dark Mode Detection**: Automatic theme adaptation
- **Site-Specific Styling**: Custom appearance per site type
- **Advanced Positioning**: AI-powered optimal placement
- **Multi-Monitor Support**: Smart positioning across displays

### Accessibility Improvements
- **Screen Reader Support**: Enhanced ARIA labels
- **High Contrast Mode**: Better visibility options
- **Keyboard Navigation**: Full keyboard accessibility

---

**Universal Compatibility**: Making AI assistance available everywhere you work and browse.