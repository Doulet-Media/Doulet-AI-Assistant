# Doulet AI Assistant - Free AI Assistant Extension

A powerful web extension that provides AI-powered answers when you highlight text on any webpage. Developed by Doulet Media using completely free OpenRouter AI models.

![Doulet AI Assistant](https://img.shields.io/badge/Doulet%20AI%20Assistant-v2.4.1-blue)
![Free Models](https://img.shields.io/badge/Models-All%20Free%20Models-green)
![Privacy](https://img.shields.io/badge/Privacy-100%25%20Local-red)
![OpenRouter](https://img.shields.io/badge/OpenRouter-Compatible-brightgreen)
![Enhanced](https://img.shields.io/badge/Enhancement-Fully%20Enhanced-brightgreen)

## 🚀 Features

### ✨ Core Features
- **Instant AI Answers**: Get intelligent responses to any highlighted text
- **10+ Completely Free Models**: Access cutting-edge AI models at zero cost
- **Privacy First**: Your data stays private, no tracking or data collection
- **Easy to Use**: Simple click or keyboard shortcut (Ctrl+Shift+A)
- **Context Menu**: Right-click selected text for quick access

### 🧠 AI Model Categories
- **🚀 Fast & Efficient**: Quick responses for everyday tasks
- **🧠 Advanced Reasoning**: Complex problem-solving capabilities
- **💻 Coding & Tools**: Specialized for programming and technical tasks
- **🖼️ Multimodal**: Support for images and document analysis

### ⚙️ Advanced Customization
- **Smart Model Selection**: Choose models based on your specific needs
- **Custom Prompts**: Add personalized instructions for tailored responses
- **Language Preferences**: Get responses in your preferred language
- **Response Styles**: Concise, detailed, technical, or casual tones
- **Performance Tuning**: Adjust temperature, response length, and timeouts

## 📦 Installation

1. Download or clone this extension to your computer
2. Open Chrome or Edge and go to `chrome://extensions/` or `edge://extensions/`
3. Enable "Developer mode" (toggle in the top right)
4. Click "Load unpacked" and select the extension folder
5. The Doulet AI Assistant icon should appear in your toolbar!

> **Note**: This extension will noever be published on public extension stores due to privary reasons and to avoid api issues and provide best usage experiencefor users. 

## 🎯 Getting Started

### Step 1: Get Your Free API Key

1. Visit [OpenRouter.ai](https://openrouter.ai/keys)
2. Sign up for a free account
3. Navigate to the API keys section
4. Create a new API key

### Step 2: Configure the Extension

1. Click the Doulet AI Assistant extension icon
2. Enter your OpenRouter API key
3. **Models are automatically fetched** - no need to manually select categories
4. Choose from all available free models (marked with "free" in the name)
5. Adjust settings like creativity level and response length
6. Click "Save Settings"

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

### Popular Free Models Include
- **Amazon Nova 2 Lite** (Free tier available)
- **Anthropic Claude models** (Free tiers)
- **OpenAI GPT models** (Free tiers)
- **Google Gemini models** (Free tiers)
- **Meta Llama models** (Free tiers)
- **Mistral models** (Free tiers)
- **Cohere models** (Free tiers)
- And many more...

## Settings

### Popup Settings
Access these by clicking the extension icon:

- **API Key**: Your OpenRouter API key
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
2. **Try Different Models**: Experiment with different AI models for various types of questions
3. **Adjust Creativity**: Use lower values for factual answers, higher values for creative responses
4. **Use Context**: Select relevant paragraphs or sections for better context

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
- **Hugging Face Privacy**: Your fallback usage is covered by Hugging Face's privacy policy

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
- Hugging Face fallback uses Mistral-7B-Instruct-v0.2 model
- This extension is for educational and personal use only
- **Never Published**: This extension will never be published on public extension stores

## Hugging Face Setup

### Getting Your Hugging Face API Key

1. **Visit Hugging Face**: Go to [huggingface.co](https://huggingface.co)
2. **Create Account**: Sign up for a free account
3. **Get API Key**:
   - Go to [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
   - Click "New token"
   - Copy the generated token
4. **Enter in Extension**:
   - Open extension options
   - Paste your Hugging Face API key in the "Hugging Face API Key" field
   - Save settings

### How Fallback Works

1. **Primary API**: Extension first tries OpenRouter
2. **Rate Limit Detection**: Automatically detects 429 (rate limit) errors
3. **Seamless Switch**: Automatically switches to Hugging Face
4. **User Notification**: Shows "fallback: true" in the response
5. **Back to Primary**: Returns to OpenRouter when limit resets

### Hugging Face Model Information

- **Model**: Mistral-7B-Instruct-v0.2
- **Type**: Instruction-tuned LLM
- **Size**: 7 billion parameters
- **Quality**: High-quality text generation
- **Cost**: Free tier available

## Changelog

### v2.4.1 (Latest Enhancement - Bug Fix)
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
- **Never Public**: This extension remains private and is never published on public stores
- **Continuous Improvement**: Regular updates with new features and models

### Contact Us
- **Support**: Report issues through extension options
- **Documentation**: Available in the extension and this README

---

[![Doulet Media](https://img.shields.io/badge/Doulet%20AI%20Assistant-v2.4.0-blue)]
[![OpenRouter Compatible](https://img.shields.io/badge/OpenRouter-Compatible-brightgreen)]
[![Privacy First](https://img.shields.io/badge/Privacy-100%25%20Local-red)]
[![Enhanced](https://img.shields.io/badge/Enhancement-Fully%20Enhanced-brightgreen)]