# Doulet AI Assistant - Free AI Assistant Extension

A powerful web extension that provides AI-powered answers when you highlight text on any webpage. Developed by Doulet Media using completely free OpenRouter AI models.

![Doulet AI Assistant](https://img.shields.io/badge/Doulet%20AI%20Assistant-v2.1.0-blue)
![Free Models](https://img.shields.io/badge/Models-10%2B%20Free-green)
![Privacy](https://img.shields.io/badge/Privacy-100%25%20Local-red)
![OpenRouter](https://img.shields.io/badge/OpenRouter-Compatible-brightgreen)
![Fixed](https://img.shields.io/badge/API-Fully%20Fixed-brightgreen)

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
3. Choose your preferred AI model from the categories below
4. Adjust settings like creativity level and response length
5. Click "Save Settings"

### Step 3: Start Using Doulet AI Assistant

- **Method 1**: Highlight text and click the floating AI button that appears

## 🤖 Available AI Models (Completely Free)

Choose from 10+ completely free AI models, categorized by their strengths:

### 🚀 Fast & Efficient Models
Perfect for quick answers and everyday use:

- **Amazon Nova 2 Lite** (3.1B parameters)
  - Ultra-fast responses
  - Great for general questions
  - 1M context window

- **Arcee AI Trinity Mini** (326M parameters)
  - Lightweight and efficient
  - Good for basic reasoning
  - 131K context window

- **NVIDIA Nemotron Nano 9B V2** (487M parameters)
  - Balanced speed and quality
  - Unified reasoning and non-reasoning
  - 128K context window

### 🧠 Advanced Reasoning Models
For complex problem-solving and deep analysis:

- **AllenAI Olmo 3 32B Think** (305M parameters)
  - Purpose-built for deep reasoning
  - Complex logic chains
  - 66K context window

- **TNG R1T Chimera** (11.5B parameters)
  - Experimental LLM with creative personality
  - Strong EQ-Bench3 score (~1305)
  - 164K context window

- **Tongyi DeepResearch 30B A3B** (1.34B parameters)
  - Optimized for long-horizon tasks
  - State-of-the-art on complex benchmarks
  - 131K context window

### 💻 Coding & Tools Models
Specialized for programming and technical tasks:

- **Kwaipilot KAT-Coder-Pro V1** (83.3B parameters)
  - Most advanced agentic coding model
  - 73.4% solve rate on SWE-Bench Verified
  - 256K context window

- **OpenAI gpt-oss-20b** (3.38B parameters)
  - Open-weight 21B parameter model
  - Mixture-of-Experts architecture
  - Optimized for consumer hardware
  - 131K context window

### 🖼️ Multimodal Models
For analyzing images and documents:

- **NVIDIA Nemotron Nano 12B 2 VL** (13.5B parameters)
  - Multimodal reasoning model
  - Video understanding and document intelligence
  - Hybrid Transformer-Mamba architecture
  - 128K context window

- **Meituan LongCat Flash Chat** (3.01B parameters)
  - Large-scale Mixture-of-Experts model
  - 560B total parameters, 27B active on average
  - Optimized for conversational and agentic tasks
  - 131K context window

## Settings

### Popup Settings
Access these by clicking the extension icon:

- **API Key**: Your OpenRouter API key
- **AI Model**: Choose from 10+ completely free models by category
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
- **Local Storage**: Your API key is stored locally in your browser only
- **Secure Communication**: All API calls use HTTPS encryption
- **OpenRouter Privacy**: Your usage is covered by OpenRouter's privacy policy

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
- This extension is for educational and personal use only
- **Never Published**: This extension will never be published on public extension stores

## Changelog

### v2.0.0 (Major Enhancement)
- **Complete Rebranding**: Renamed from AnswersAI to Doulet AI Assistant
- **10+ Completely Free Models**: Expanded from 4 to 10+ free AI models across 4 categories
- **Enhanced UI/UX**: Improved popup with grouped model selection, better styling
- **Advanced Options**: Extended options page with more customization features
- **Comprehensive Documentation**: Enhanced README with detailed model information
- **Performance Optimizations**: Better model categorization and selection
- **Privacy Enhancements**: Clearer privacy controls and documentation

### v1.0.0 (Initial Release)
- Basic text selection and AI response functionality
- Support for 4 free AI models
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
- **Website**: [doulet.media](https://doulet.media)
- **Support**: support@doulet.media
- **Documentation**: doulet.media/doulet-ai-assistant-docs

---

[![Doulet Media](https://img.shields.io/badge/Doulet%20Media-Innovating%20AI%20for%20All-blue)](https://doulet.media)
[![OpenRouter Compatible](https://img.shields.io/badge/OpenRouter-Compatible-brightgreen)](https://openrouter.ai)
[![Privacy First](https://img.shields.io/badge/Privacy-100%25%20Local-red)](https://doulet.media/privacy)