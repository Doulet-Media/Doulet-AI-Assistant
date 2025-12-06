# Doulet AI Assistant - Certification Notes for Testers

## Extension Overview
The Doulet AI Assistant is a universal browser extension that provides AI-powered answers when users highlight text on any webpage. It integrates with OpenRouter's AI API to deliver instant responses using free AI models.

## Key Features for Testing

### 1. Text Selection and AI Response
- **Primary Function**: Highlight any text on a webpage to get AI answers
- **Activation Methods**:
  - Small floating button (32px) appears near selected text
  - Keyboard shortcut: Ctrl+Shift+Q (Windows/Linux) or Cmd+Shift+Q (Mac)
  - Right-click context menu option "Get AI Answer"
- **Response Display**: Modal window with AI answer, copy functionality, and model information

### 2. OpenRouter Integration
- **API Provider**: OpenRouter.ai (third-party AI model aggregator)
- **Required Setup**: Users must enter their OpenRouter API key in extension settings
- **Free Models**: Extension automatically discovers and uses free AI models
- **No Test Accounts**: Extension works with any valid OpenRouter API key

### 3. Settings and Configuration
- **Access**: Click extension icon → Settings button
- **Key Settings**:
  - API Key (required for functionality)
  - AI Model selection (auto-populated with free models)
  - Temperature (creativity level: 0.1-1.0)
  - Max Tokens (response length: default 400)
  - Answer Style (concise, detailed, technical, casual)
  - Language preference (auto-detect or specific languages)
  - Timeout settings (default 30 seconds)

### 4. Universal Compatibility
- **Tested Platforms**:
  - Google Workspace (Docs, Sheets, Slides, Gmail)
  - Social Media (Twitter, Facebook, LinkedIn)
  - E-commerce (Amazon, eBay)
  - News and Blogs
  - Educational sites
  - Banking/Financial sites (read-only)
- **Smart Positioning**: Button appears near text without blocking content
- **Non-Intrusive**: Small button only appears when text is selected

### 5. Privacy and Security
- **Local Storage**: All settings stored locally in browser
- **Data Transmission**: Only selected text and prompt sent to OpenRouter
- **No Tracking**: Extension does not collect usage data or browsing history
- **HTTPS Only**: All API communication uses secure connections

## Testing Scenarios

### Basic Functionality Test
1. Install extension
2. Click extension icon
3. Enter a valid OpenRouter API key (can be obtained free from openrouter.ai)
4. Navigate to any webpage with text content
5. Highlight text (minimum 3 characters)
6. Verify small floating button appears near selection
7. Click button or press Ctrl+Shift+Q
8. Verify modal appears with "Getting AI answer..." message
9. Wait for response (typically 3-10 seconds)
10. Verify answer displays in modal with model information
11. Test copy button functionality

### Keyboard Shortcut Test
1. Highlight text on any webpage
2. Press Ctrl+Shift+Q (or Cmd+Shift+Q on Mac)
3. Verify modal opens with AI response
4. Test without selected text - button should pulse to indicate action needed

### Context Menu Test
1. Right-click on selected text
2. Verify "Get AI Answer" option appears in context menu
3. Click option and verify modal opens

### Google Docs Test
1. Open Google Docs document
2. Select text in document
3. Verify floating button appears
4. Test AI response functionality
5. Verify no interference with Google Docs native features

### Model Discovery Test
1. Enter valid API key in settings
2. Open popup settings
3. Verify model dropdown populates with free models
4. Test different model selections
5. Verify responses work with various models

### Error Handling Test
1. Test without API key - should show "Please enter your OpenRouter API key" message
2. Test with invalid API key - should show connection error
3. Test with slow connection - verify timeout handling (30 seconds default)
4. Test with no internet connection - verify appropriate error messages

### UI/UX Test
1. Verify button is small (32px) and non-intrusive
2. Test button positioning on various screen sizes
3. Verify button doesn't block content or interfere with page functionality
4. Test modal appearance and functionality
5. Verify smooth animations and transitions

## Dependencies
- **OpenRouter API**: Extension requires internet connection and access to openrouter.ai
- **Browser Permissions**: Storage, activeTab, scripting, contextMenus, tabs
- **No Additional Extensions**: Works independently

## Troubleshooting for Testers
- **No Response**: Check API key validity and internet connection
- **Slow Response**: May depend on OpenRouter server load and model availability
- **Button Not Appearing**: Ensure text is properly selected (minimum 3 characters)
- **Model List Empty**: Verify API key has access to free models on OpenRouter

## Test Data
- **API Key**: Testers can create free accounts at https://openrouter.ai/keys
- **Test Pages**: Any webpage with selectable text content
- **Expected Response Time**: 3-10 seconds for most models

## Security Notes
- Extension does not store or transmit API keys to any server other than OpenRouter
- All communication uses HTTPS encryption
- No third-party tracking or analytics
- Local storage only accessible by extension