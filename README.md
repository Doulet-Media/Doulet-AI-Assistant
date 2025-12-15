# Doulet AI Assistant - Free AI Assistant Extension

A powerful web extension that provides AI-powered answers when you highlight text on any webpage. Developed by Doulet Media using NVIDIA NIM as primary AI service with OpenRouter as fallback support.

![Doulet AI Assistant](https://img.shields.io/badge/Doulet%20AI%20Assistant-v3.5.0-blue)
![NVIDIA NIM](https://img.shields.io/badge/NVIDIA%20NIM-Primary%20API-brightgreen)
![OpenRouter](https://img.shields.io/badge/OpenRouter-Fallback%20API-orange)
![Privacy](https://img.shields.io/badge/Privacy-100%25%20Local-red)
![Enhanced](https://img.shields.io/badge/Enhancement-Ultra%20Enhanced-brightgreen)
![Detailed](https://img.shields.io/badge/Responses-Detailed%20&%20Comprehensive-orange)

## 🚀 Features

### ✨ Core Features
- **Ultra-Detailed AI Answers**: Get comprehensive, educational responses with examples and explanations
- **10+ Completely Free Models**: Access cutting-edge AI models at zero cost
- **Smart Response Enhancement**: Automatic retry for more detailed answers when needed
- **Empty Response Prevention**: Intelligent handling of non-questions and edge cases
- **Privacy First**: Your data stays private, no tracking or data collection
- **Easy to Use**: Simple click or keyboard shortcut (Ctrl+Shift+Q)
- **Context Menu**: Right-click selected text for quick access

### 🧠 AI Model Categories
- **🚀 Fast & Efficient**: Quick responses for everyday tasks
- **🧠 Advanced Reasoning**: Complex problem-solving capabilities
- **💻 Coding & Tools**: Specialized for programming and technical tasks
- **🖼️ Multimodal**: Support for images and document analysis

### ⚙️ Advanced Customization
- **Smart Model Selection**: Choose models based on your specific needs
- **Enhanced Custom Prompts**: Add personalized instructions for tailored, detailed responses
- **Language Preferences**: Get responses in your preferred language
- **Response Styles**: Concise, detailed, technical, or casual tones
- **Performance Tuning**: Adjust temperature, response length, and timeouts
- **Minimum Word Count**: Ensures comprehensive answers (100+ words minimum)
- **Automatic Enhancement**: Smart retry system for better quality responses

## 📦 Installation

1. Download or clone this extension to your computer
2. Open Chrome or Edge and go to `chrome://extensions/` or `edge://extensions/`
3. Enable "Developer mode" (toggle in the top right)
4. Click "Load unpacked" and select the extension folder
5. The Doulet AI Assistant icon should appear in your toolbar!

> **Note** This extension doesn't work on Google School Accounts due to board restriction. The only ways to use this is either getting it on edge and login to Google account to normally use or use on personal Google accounts.

## 🎯 Getting Started

### Step 1: Get Your Free API Key

1. Visit [Nvidia NIM](https://build.nvidia.com/)
2. Sign up for a free account
3. Navigate to the API keys section
4. Create a new API key

### Step 2: Configure the Extension

1. Click the Doulet AI Assistant extension icon
2. Enter your NVIDIA NIM API key (primary API) - **Required**
3. Optionally, enter your OpenRouter API key (fallback API)
4. **Models are automatically fetched** - no need to manually select categories
5. Choose from all available NVIDIA NIM models:
   - `meta/llama-3.3-70b-instruct`
   - `meta/llama-4-maverick-17b-128e-instruct`
   - `meta/llama-4-scout-17b-16e-instruct`
   - `deepseek-ai/deepseek-r1`
   - `qwen/qwen2.5-coder-32b-instruct`
6. Adjust settings like creativity level and response length
7. Click "Save Settings"

### Step 3: Start Using Doulet AI Assistant

- **Method 1**: Highlight text and click the floating AI button that appears

## 🤖 Available AI Models (All Free Models)

The extension automatically discovers and provides access to all free AI models available on OpenRouter. Models are automatically fetched when you enter your API key.

### How It Works
- **Automatic Discovery**: The extension queries OpenRouter's API to find all free models
- **Smart Filtering**: Models are filtered using the most reliable method:
  - **Primary Filter**: Check pricing object - free models have `prompt = "0"` and `completion = "0"`
  - **Secondary Filter**: Check for ":free" suffix in model ID (common naming convention)
  - **Tertiary Filter**: Check for "free" keyword in model name or ID
- **Real-time Updates**: Get the latest free models whenever you update your API key

### Model Categories
The extension automatically categorizes models based on their capabilities:

- **General Purpose**: Versatile models for everyday use
- **Advanced Reasoning**: Complex problem-solving capabilities
- **Coding & Development**: Specialized for programming tasks
- **Multimodal**: Support for images and document analysis

## Settings

### Popup Settings
Access these by clicking the extension icon:

- **API Key**: YourONvidia NIM API key
- **AI Model**: Choose from all available free models (automatically fetched)
- **Creativity Level**: Control how creative or conservative the responses are (0.0-1.0)
- **Max Response Length**: Limit the length of AI responses (100-1000 tokens)
- **Auto-answer**: Automatically show answers when text is selected

### Advanced Options
Access these via the options page:

- **Answer Style**: Choose between concise, detailed, technical, or casual responses
- **Language**: Set your preferred language for responses (Auto-detect, English, Spanish, French, German, Italian, Portuguese, Russian, Chinese, Japanese, Korean)
- **Privacy Settings**: Control data storage and anonymous mode
- **Custom Prompts**: Add custom instructions for the AI
- **Request Timeout**: Set how long to wait for responses (5-120 seconds)
- **Maximum Answers per Session**: Limit usage (1-100)
- **Notification Sounds**: Enable/disable audio feedback
- **Show Answer Button**: Toggle the floating button on text selection

## Keyboard Shortcuts

- **Ctrl+Shift+A**: Get AI answer for selected text
- **Click extension icon**: Open settings and options

## Tips for Best Results

1. **Be Specific**: The more specific your selected text, the better the answer
2. **Ask Questions**: For best results, select text that forms clear questions (ends with ? or contains question words)
3. **Try Different Models**: Experiment with different AI models for various types of questions
4. **Adjust Creativity**: Use lower values for factual answers, higher values for creative responses
5. **Use Context**: Select relevant paragraphs or sections for better context
6. **Detailed Responses**: The extension automatically provides comprehensive answers with examples and explanations
7. **Enhancement Feature**: If the initial response is too short, the extension will automatically retry for more detail
8. **Non-Questions**: For statements or non-questions, the extension provides helpful guidance on how to improve your selection

## Troubleshooting

### 🔧 Troubleshooting

#### API Connection Issues
- **"Invalid API Key" Error**: Double-check your API key for typos, make sure you're using a valid OpenRouter API key, try testing the connection in the popup settings
- **"Connection Failed" Error**: Check your internet connection, ensure OpenRouter.ai is accessible in your region, try again in a few moments (server might be temporarily unavailable)

#### Performance Issues
- **Slow Responses**: Try a different AI model (some are faster than others), reduce the max response length, check your internet connection, increase timeout settings for complex queries
- **High Memory Usage**: Use smaller models like Nova 2 Lite or Trinity Mini, reduce max tokens setting

#### Extension Issues
- **Extension Not Working**: Make sure the extension is enabled in Chrome, check that you have the latest version, try reloading the extension
- **Button Not Appearing**: Check that "Show Answer Button" is enabled in options, refresh the webpage

## Privacy & Security

- **No Data Collection**: We don't collect or store any of your data
- **Local Storage**: Your API keys are stored locally in your browser only
- **Secure Communication**: All API calls use HTTPS encryption
- **OpenRouter Privacy**: Your usage is covered by OpenRouter's privacy policy
- **NVIDIA NIM Privacy**: Your fallback usage is covered by NVIDIA's privacy policy

## Support

If you encounter issues or have questions:

1. Check this README for common solutions
2. Visit our [GitHub repository](https://github.com/doulet-media/answersai) (hypothetical)
3. Report bugs or request features through the extension options

## Contributing

This extension is developed by Doulet Media. While this is a complete implementation, you're welcome to:

- Report bugs and issues
- Suggest new features
- Share feedback and improvements

## Legal

- This extension uses OpenRouter's API services
- You must comply with OpenRouter's terms of service
- Some AI models may have specific usage guidelines (check model documentation)
- NVIDIA NIM fallback uses enterprise-grade LLMs
- This extension is for educational and personal use only
- **Never Published**: This extension will never be published on public extension stores

## NVIDIA NIM Setup

### Getting Your NVIDIA NIM API Key

1. **Visit NVIDIA NIM**: Go to [build.nvidia.com/models](https://build.nvidia.com/models)
2. **Create Account**: Sign up for a free NVIDIA account
3. **Get API Key**:
   - Navigate to the API keys section
   - Create a new API key for NIM
   - Copy the generated token (format: nvapi-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx)
4. **Enter in Extension**:
   - Open extension options or popup settings
   - Paste your NVIDIA API key in the "NVIDIA NIM API Key (Primary)" field
   - Save settings

### How Primary/Fallback Works

1. **Primary API**: Extension first tries NVIDIA NIM
2. **Failure Detection**: Automatically detects when NVIDIA NIM is unavailable
3. **Seamless Switch**: Automatically switches to OpenRouter as fallback
4. **User Notification**: Shows "fallback: true" in the response when using OpenRouter
5. **Back to Primary**: Returns to NVIDIA NIM when it becomes available again

### NVIDIA NIM Model Information

- **Default Model**: meta/llama-4-scout-17b-16e-instruct
- **Available Models**: Choose from the following NVIDIA NIM models:
  - `meta/llama-3.3-70b-instruct`
  - `meta/llama-4-maverick-17b-128e-instruct`
  - `meta/llama-4-scout-17b-16e-instruct`
  - `deepseek-ai/deepseek-r1`
  - `qwen/qwen2.5-coder-32b-instruct`
- **Type**: Enterprise-grade LLMs
- **Performance**: High-quality, fast responses
- **Cost**: Free tier available

## Changelog

### v3.5.0 (Latest Enhancement - Unlimited Responses & Enhanced Stability)
- **Unlimited Responses**: Increased max tokens to 16000/20000 for truly unlimited AI responses
- **Enhanced Stability**: Improved extension context validation to prevent "context invalidated" errors
- **Robust Error Handling**: Enhanced validation for chrome APIs with typeof checks
- **Fixed Response Cutoff**: Eliminated response truncation with maximum token limits
- **Improved Context Validation**: Added typeof checks for more reliable extension context detection
- **Version Update**: Updated to v3.5.0

### v3.4.0 (Previous Enhancement - NVIDIA NIM Primary)
- **NVIDIA NIM Primary**: Switched NVIDIA NIM to primary API with OpenRouter as fallback
- **Enhanced API Priority**: NVIDIA NIM is now required, OpenRouter is optional fallback
- **Updated Documentation**: All references updated to reflect new API priority
- **Improved UI Labels**: Options page updated to show NVIDIA NIM as primary and OpenRouter as fallback
- **Better Error Handling**: Enhanced error messages for API failures
- **Version Update**: Updated to v3.4.0

### v3.3.0 (Previous Enhancement - Ultra-Detailed Responses)
- **Ultra-Detailed Responses**: Enhanced prompt generation for comprehensive, educational answers
- **Smart Response Enhancement**: Automatic retry system for more detailed responses when answers are too short
- **Empty Response Prevention**: Intelligent handling of non-questions with helpful user guidance
- **Enhanced Model Parameters**: Optimized temperature (0.8), max tokens (4000+), and penalties for better detail
- **Minimum Word Count**: Ensures comprehensive answers (100+ words minimum) with examples and explanations
- **Improved Error Messages**: Better guidance for empty responses and non-questions
- **Enhancement Notifications**: Visual feedback when responses are automatically enhanced
- **Response Validation**: Advanced validation to ensure answer quality and completeness
- **Version Update**: Updated to v3.3.0

### v3.2.0 (Previous Enhancement - NVIDIA NIM Integration)
- **NVIDIA NIM Fallback**: Added NVIDIA NIM as backup API when OpenRouter reaches daily limit (429 error)
- **Dual API Support**: Primary OpenRouter with NVIDIA NIM fallback for uninterrupted service
- **NVIDIA API Key Management**: Added fields in popup and options pages for NVIDIA API key
- **Enhanced Fallback Logic**: Automatic switching with clear user feedback
- **NVIDIA Model Support**: Default model meta/llama-4-scout-17b-16e-instruct with additional models
- **Updated Documentation**: Replaced Hugging Face references with NVIDIA NIM setup
- **Improved Reliability**: 2-tier fallback strategy (OpenRouter → NVIDIA NIM)
- **Version Update**: Updated to v3.2.0

### v2.4.1 (Previous Enhancement - Bug Fix)
- **Enhanced Model Fetching**: Improved algorithm to fetch ALL free models from OpenRouter
- **Automatic Model Discovery**: Models are automatically fetched when API key is entered
- **Smart Filtering**: Enhanced filtering to include all models with "free" in their names
- **Real-time Updates**: Get latest free models without manual intervention
- **Better Error Handling**: Improved connection and model fetching error handling
- **Version Update**: Updated to v2.4.0

### v2.3.0 (Previous Enhancement)
- **Enhanced Model Filtering**: Improved algorithm to find more free models
- **Better Error Handling**: Enhanced error handling for API connections
- **Performance Improvements**: Optimized model fetching and caching
- **UI Improvements**: Better user interface for model selection

### v2.2.0 (Major Enhancement)
- **Enhanced Model Discovery**: Improved algorithm to find more free models
- **Better Error Handling**: Enhanced error handling for API connections
- **Performance Improvements**: Optimized model fetching and caching
- **UI Improvements**: Better user interface for model selection

### v2.1.0 (Enhancement Update)
- **Enhanced Model Filtering**: Improved algorithm to find more free models
- **Better Error Handling**: Enhanced error handling for API connections
- **Performance Improvements**: Optimized model fetching and caching
- **UI Improvements**: Better user interface for model selection

### v2.0.0 (Major Enhancement)
- **Complete Rebranding**: Renamed from AnswersAI to Doulet AI Assistant
- **Enhanced Model Discovery**: Improved algorithm to find more free models
- **Enhanced UI/UX**: Improved popup with grouped model selection, better styling
- **Advanced Options**: Extended options page with more customization features
- **Comprehensive Documentation**: Enhanced README with detailed model information
- **Performance Optimizations**: Better model categorization and selection
- **Privacy Enhancements**: Clearer privacy controls and documentation

### v1.0.0 (Initial Release)
- Basic text selection and AI response functionality
- Support for free AI models
- Popup settings interface
- Options page with basic configuration
- Welcome page and documentation

## License

This extension is provided as-is for educational and personal use. The code is open for learning and modification.

---

## 🏢 About Doulet Media

**Developed by Doulet Media**
*Making AI accessible to everyone, for free.*

### Our Commitment
- **Privacy First**: We don't collect or store any user data
- **Free Access**: All models are completely free to use
- **Open Source**: Full transparency with our implementation
- **Continuous Improvement**: Regular updates with new features and models

### Contact Us
- **Support**: Report issues through extension options
- **Documentation**: Available in the extension and this README

---

[![Doulet Media](https://img.shields.io/badge/Doulet%20AI%20Assistant-v3.5.0-blue)]
[![NVIDIA NIM Primary](https://img.shields.io/badge/NVIDIA%20NIM-Primary%20API-brightgreen)]
[![OpenRouter Fallback](https://img.shields.io/badge/OpenRouter-Fallback%20API-orange)]
[![Privacy First](https://img.shields.io/badge/Privacy-100%25%20Local-red)]
[![Enhanced](https://img.shields.io/badge/Enhancement-Ultra%20Enhanced-brightgreen)]
[![Detailed](https://img.shields.io/badge/Responses-Detailed%20&%20Comprehensive-orange)]