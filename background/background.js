// Background script for AI Question Answerer - Fast and Direct

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    try {
        if (request.action === 'getAnswer') {
            getAIAnswer(request, sendResponse);
            return true; // Keep message channel open for async response
        } else if (request.action === 'testConnection') {
            testConnection(request.apiKey, sendResponse);
            return true;
        } else if (request.action === 'getApiKey') {
            // Return API key from storage
            chrome.storage.sync.get(['apiKey'], function(result) {
                if (chrome.runtime.lastError) {
                    console.error('Storage error:', chrome.runtime.lastError);
                    sendResponse({ apiKey: '' });
                    return;
                }
                sendResponse({ apiKey: result.apiKey || '' });
            });
            return true; // Keep message channel open for async response
        } else if (request.action === 'fetchFreeModels') {
            // Fetch and return free models list
            updateFreeModelsList().then(models => {
                sendResponse({ success: true, models: models });
            }).catch(error => {
                console.error('Failed to fetch free models:', error);
                sendResponse({ success: false, error: error.message });
            });
            return true; // Keep message channel open for async response
        }
    } catch (error) {
        console.error('Error in message listener:', error);
        // Only send response if the channel is still open
        if (sendResponse) {
            try {
                sendResponse({ success: false, error: 'Message handling failed' });
            } catch (sendError) {
                console.warn('Failed to send error response:', sendError);
            }
        }
    }
    return true; // Keep message channel open for async response
});

// Enhanced AI answer with real-time thinking process
async function getAIAnswer(request, sendResponse) {
    const { text, prompt, model, temperature, maxTokens } = request;
    
    try {
        // Get API key from storage
        let result = await chrome.storage.sync.get(['apiKey']);
        let apiKey = result.apiKey;
        
        if (!apiKey) {
            sendResponse({
                success: false,
                error: 'No API key found. Please enter your OpenRouter API key in the extension settings.'
            });
            return;
        }
        
        // Get timeout setting (default 30 seconds)
        const settingsResult = await chrome.storage.sync.get(['timeout']);
        const timeout = (settingsResult.timeout || 30) * 1000; // Convert to milliseconds
        
        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            controller.abort();
        }, timeout);
        
        try {
            // Prepare request to OpenRouter with correct API format
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': chrome.runtime.getURL(''),
                    'X-Title': 'Doulet AI Assistant',
                    'X-Server-Select-Enabled': 'true'
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: temperature,
                    max_tokens: maxTokens,
                    stream: false
                }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
            }
            
            const data = await response.json();
            
            if (data && data.choices && data.choices.length > 0) {
                const answer = data.choices[0].message.content;
                sendResponse({
                    success: true,
                    answer: answer
                });
            } else {
                throw new Error('Invalid response from OpenRouter API: No choices returned');
            }
            
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                sendResponse({
                    success: false,
                    error: `Request timed out after ${(timeout / 1000)} seconds. Please try again or increase the timeout in settings.`
                });
            } else {
                throw error;
            }
        }
        
    } catch (error) {
        console.error('Error getting AI answer:', error);
        sendResponse({
            success: false,
            error: error.message || 'Failed to get answer from OpenRouter'
        });
    }
}

// Enhanced unlimited answer handler
async function getUnlimitedAnswer(request, sendResponse) {
    const { text, prompt, model, temperature, maxTokens } = request;
    
    try {
        let result = await chrome.storage.sync.get(['apiKey']);
        let apiKey = result.apiKey;
        
        if (!apiKey) {
            sendResponse({
                success: false,
                error: 'No API key found. Please enter your OpenRouter API key in the extension settings.'
            });
            return;
        }
        
        const settingsResult = await chrome.storage.sync.get(['timeout']);
        const timeout = (settingsResult.timeout || 120) * 1000; // 2 minutes for unlimited answers
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            controller.abort();
        }, timeout);
        
        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': chrome.runtime.getURL(''),
                    'X-Title': 'AI Question Answerer - Unlimited Mode',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: temperature || 0.7,
                    max_tokens: maxTokens || 2000,  // Unlimited tokens
                    stream: false
                }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
            }
            
            const data = await response.json();
            
            if (data && data.choices && data.choices.length > 0) {
                const answer = data.choices[0].message.content;
                
                // Enhanced response validation
                if (!answer || answer.trim().length === 0) {
                    // Try to get more detailed error information
                    const errorInfo = data.error || 'Empty response from AI';
                    throw new Error(`AI returned empty response: ${errorInfo}`);
                }
                
                sendResponse({
                    success: true,
                    answer: answer,
                    model: model,
                    tokens_used: data.usage?.total_tokens || 0
                });
            } else {
                throw new Error('Invalid response from OpenRouter API - no choices returned');
            }
            
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                sendResponse({
                    success: false,
                    error: `Request timed out after ${(timeout / 1000)} seconds. The question may be too complex or the model is slow. Try breaking it into smaller parts.`
                });
            } else {
                console.error('Detailed error:', error);
                sendResponse({
                    success: false,
                    error: `Failed to get answer: ${error.message}. Check your API key and internet connection.`
                });
            }
        }
        
    } catch (error) {
        console.error('Error getting AI answer:', error);
        sendResponse({
            success: false,
            error: `Extension error: ${error.message}. Please reload the extension and try again.`
        });
    }
}

// Advanced prompt enhancement for better responses
function enhancePromptForUnlimitedAnswer(text, settings) {
    let prompt = '';
    
    // Add custom prompt if provided
    if (settings.customPrompt && settings.customPrompt.trim()) {
        prompt += settings.customPrompt.trim() + '\n\n';
    } else {
        // Enhanced prompt for comprehensive, unlimited answers
        prompt = `You are an expert AI assistant providing comprehensive answers for students.
        Answer the following question with the most detailed, accurate, and complete response possible.
        
        REQUIREMENTS:
        - Provide the complete answer without token limitations
        - Include all relevant information, examples, and details
        - Do not provide introductions, conclusions, or explanations
        - Do not summarize or omit any information
        - Focus on delivering the full, comprehensive answer
        - Use clear, structured formatting when appropriate
        - Include examples, facts, and supporting details
        - Ensure the answer is thorough and complete
        
        QUESTION:
        "${text}"
        
        ANSWER (comprehensive and unlimited):`;
    }
    
    // Add language preference if set
    if (settings.language && settings.language !== 'auto') {
        const languageMap = {
            'en': 'English', 'es': 'Spanish', 'fr': 'French', 'de': 'German',
            'it': 'Italian', 'pt': 'Portuguese', 'ru': 'Russian', 'zh': 'Chinese',
            'ja': 'Japanese', 'ko': 'Korean'
        };
        prompt += `\n\nIMPORTANT: Respond in ${languageMap[settings.language]} and ensure all examples and explanations are culturally appropriate.`;
    }
    
    // Add style preference for better formatting
    if (settings.answerStyle) {
        switch(settings.answerStyle) {
            case 'detailed':
                prompt += `\n\nFORMAT: Use detailed explanations, multiple examples, and thorough coverage of all aspects.`;
                break;
            case 'technical':
                prompt += `\n\nFORMAT: Use technical language, precise terminology, and include relevant formulas, data, and specifications.`;
                break;
            case 'concise':
                prompt += `\n\nFORMAT: Be comprehensive but avoid unnecessary verbosity. Focus on key points with brief examples.`;
                break;
            case 'casual':
                prompt += `\n\nFORMAT: Use conversational tone while maintaining completeness and accuracy.`;
                break;
        }
    }
    
    return prompt;
}

// Test connection to OpenRouter
async function testConnection(apiKey, sendResponse) {
    try {
        // Simple API key validation - just check if it's a valid format
        // This avoids network issues and provides instant feedback
        if (!apiKey || apiKey.trim().length === 0) {
            sendResponse({ success: false, error: 'API key is required' });
            return;
        }

        // Basic API key format validation
        if (!apiKey.startsWith('sk-') && !apiKey.startsWith('or-')) {
            sendResponse({ success: false, error: 'Invalid API key format. Should start with "sk-" or "or-"' });
            return;
        }

        // For connection testing, we'll ONLY do local validation
        // No network calls to avoid timeout issues
        // The real connection will be tested when the user actually requests an answer
        
        sendResponse({
            success: true,
            message: 'API key format is valid ✓. Connection will be tested when you request an answer.'
        });
        
    } catch (error) {
        console.error('Connection test failed:', error);
        sendResponse({ success: false, error: error.message || 'Connection test failed' });
    }
}

// Handle extension installation
chrome.runtime.onInstalled.addListener(async function(details) {
    if (details.reason === 'install') {
        // Get free models and set default
        const freeModels = await updateFreeModelsList();
        const defaultModel = freeModels.length > 0 ? freeModels[0] : 'amazon/nova-2-lite-v1:free';
        
        // Show welcome message - NO API KEY LOADED FROM FILE
        try {
            chrome.storage.sync.set({
                model: defaultModel,
                temperature: 0.7,
                maxTokens: 400,
                autoAnswer: false,
                showButton: true,
                enableSounds: false,
                answerStyle: 'concise',
                language: 'auto',
                maxAnswers: 10,
                clearHistory: false,
                anonymousMode: false,
                customPrompt: '',
                timeout: 30,
                freeModels: freeModels
                // NO apiKey field - users must enter it manually
            });
        } catch (error) {
            console.error('Failed to save settings on install:', error);
        }
        
        // Open welcome page
        chrome.tabs.create({
            url: chrome.runtime.getURL('welcome/welcome.html')
        });
    }
});

// Handle extension startup
chrome.runtime.onStartup.addListener(async function() {
    // Recreate context menu on startup
    createContextMenu();
    
    // Validate extension context
    const isValid = validateExtensionContext();
    if (!isValid) {
        console.error('Extension context is not properly initialized');
    }
});

// Connection validation function
function validateExtensionContext() {
    try {
        // Test if we can access chrome APIs
        chrome.storage.sync.get(null, function(result) {
            if (chrome.runtime.lastError) {
                console.warn('Storage API not accessible:', chrome.runtime.lastError);
                return false;
            }
            return true;
        });
        return true;
    } catch (error) {
        console.warn('Extension context validation failed:', error);
        return false;
    }
}

// Enhanced message listener for new features
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    try {
        if (request.action === 'getAnswer') {
            getAIAnswer(request, sendResponse);
            return true;
        } else if (request.action === 'getStreamingAnswer') {
            getStreamingAnswer(request, sendResponse);
            return true;
        } else if (request.action === 'testConnection') {
            testConnection(request.apiKey, sendResponse);
            return true;
        } else if (request.action === 'getApiKey') {
            chrome.storage.sync.get(['apiKey'], function(result) {
                if (chrome.runtime.lastError) {
                    console.error('Storage error:', chrome.runtime.lastError);
                    sendResponse({ apiKey: '' });
                    return;
                }
                sendResponse({ apiKey: result.apiKey || '' });
            });
            return true;
        } else if (request.action === 'fetchFreeModels') {
            updateFreeModelsList().then(models => {
                sendResponse({ success: true, models: models });
            }).catch(error => {
                console.error('Failed to fetch free models:', error);
                sendResponse({ success: false, error: error.message });
            });
            return true;
        } else if (request.action === 'detectContent') {
            const detection = detectQuizContent(request.text);
            sendResponse({ success: true, detection: detection });
            return true;
        } else if (request.action === 'updateStats') {
            updateStudyStats();
            sendResponse({ success: true });
            return true;
        }
    } catch (error) {
        console.error('Error in message listener:', error);
        if (sendResponse) {
            try {
                sendResponse({ success: false, error: 'Message handling failed' });
            } catch (sendError) {
                console.warn('Failed to send error response:', sendError);
            }
        }
    }
    return true;
});

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener(async function(command) {
    if (command === 'toggle-study-mode') {
        // Toggle study mode
        const result = await chrome.storage.sync.get(['studyMode']);
        const newMode = !result.studyMode;
        await chrome.storage.sync.set({ studyMode: newMode });
        
        // Show notification
        if (chrome.notifications && chrome.notifications.create) {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: chrome.runtime.getURL('icons/icon48.png'),
                title: 'Study Mode ' + (newMode ? 'Enabled' : 'Disabled'),
                message: newMode ? 'Enhanced study features activated!' : 'Study mode deactivated'
            });
        }
    } else if (command === 'toggle-thinking') {
        // Toggle thinking process
        const result = await chrome.storage.sync.get(['enableThinking']);
        const newThinking = !result.enableThinking;
        await chrome.storage.sync.set({ enableThinking: newThinking });
        
        if (chrome.notifications && chrome.notifications.create) {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: chrome.runtime.getURL('icons/icon48.png'),
                title: 'Thinking Process ' + (newThinking ? 'Enabled' : 'Disabled'),
                message: newThinking ? 'Real-time thinking enabled!' : 'Thinking process disabled'
            });
        }
    } else if (command === 'copy-answer') {
        // Copy last answer with citation
        const result = await chrome.storage.sync.get(['lastAnswer']);
        if (result.lastAnswer) {
            navigator.clipboard.writeText(result.lastAnswer).then(() => {
                if (chrome.notifications && chrome.notifications.create) {
                    chrome.notifications.create({
                        type: 'basic',
                        iconUrl: chrome.runtime.getURL('icons/icon48.png'),
                        title: 'Answer Copied',
                        message: 'Answer copied with citation!'
                    });
                }
            });
        }
    }
});

// Removed automatic loading from file - users must enter API key manually in settings

// Removed loadApiKeyFromFile function - no longer needed

// Get free models from OpenRouter API
async function getFreeModels() {
    try {
        // Load API key from storage
        const result = await chrome.storage.sync.get(['apiKey']);
        const apiKey = result.apiKey;
        
        if (!apiKey) {
            // Return minimal fallback list if no API key
            return ['amazon/nova-2-lite-v1:free'];
        }
        
        const response = await fetch('https://openrouter.ai/api/v1/models', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && data.data) {
            // Filter for completely free models using pricing object (most reliable method)
            const freeModels = data.data
                .filter(model => {
                    // Primary filter: Check pricing (most reliable method)
                    // Free models have prompt = "0" and completion = "0"
                    const isFreeByPricing = model.pricing &&
                                           model.pricing.prompt === "0" &&
                                           model.pricing.completion === "0";
                    
                    // Secondary filter: Check for :free suffix in ID (common naming convention)
                    const id = (model.id || '').toLowerCase();
                    const hasFreeSuffix = id.includes(':free');
                    
                    // Tertiary filter: Check for "free" keyword in ID or name
                    const name = (model.name || '').toLowerCase();
                    const hasFreeKeyword = name.includes('free') || id.includes('free');
                    
                    // Combine filters - prioritize pricing check, but include models with :free suffix
                    return isFreeByPricing || hasFreeSuffix || hasFreeKeyword;
                })
                .map(model => model.id)
                .filter(id => id && id.length > 0) // Ensure valid model IDs
                .sort(); // Sort alphabetically
            
            return freeModels.length > 0 ? freeModels : ['amazon/nova-2-lite-v1:free'];
        }
        
        return ['amazon/nova-2-lite-v1:free'];
    } catch (error) {
        console.error('Failed to fetch free models:', error);
        // Return minimal fallback
        return ['amazon/nova-2-lite-v1:free'];
    }
}

// Fetch and update free models list when API key is available
async function updateFreeModelsList() {
    try {
        const freeModels = await getFreeModels();
        await chrome.storage.sync.set({ freeModels: freeModels });
        console.log('Updated free models list:', freeModels);
        return freeModels;
    } catch (error) {
        console.error('Failed to update free models list:', error);
        return ['amazon/nova-2-lite-v1:free'];
    }
}

// Listen for storage changes to automatically update models when API key is saved
chrome.storage.onChanged.addListener(async function(changes, namespace) {
    if (namespace === 'sync' && changes.apiKey) {
        console.log('API key changed, updating free models...');
        await updateFreeModelsList();
    }
});

// Create context menu item
function createContextMenu() {
    try {
        // Create context menu item - Chrome will handle duplicates automatically
        chrome.contextMenus.create({
            id: 'get-ai-answer',
            title: 'Get AI Answer',
            contexts: ['selection']
        }, function() {
            // Check if there was an error creating the context menu
            if (chrome.runtime.lastError) {
                // If menu already exists, that's fine - just ignore the error
                if (chrome.runtime.lastError.message.includes('Cannot create item with duplicate id')) {
                    console.log('Context menu already exists, using existing one');
                } else {
                    console.log('Context menu creation error:', chrome.runtime.lastError);
                }
            }
        });
    } catch (error) {
        console.log('Context menu creation error:', error);
    }
}

// Handle context menu click
chrome.contextMenus.onClicked.addListener(async function(info, tab) {
    if (info.menuItemId === 'get-ai-answer' && info.selectionText) {
        try {
            // First, check if content script is available
            const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
            
            // Send message to content script to get answer
            chrome.tabs.sendMessage(tab.id, {
                action: 'handleContextMenuSelection',
                text: info.selectionText
            }, function(response) {
                // Handle response or error
                if (chrome.runtime.lastError) {
                    console.warn('Content script not available, showing error to user');
                    // If content script is not available, show a notification (if API is available)
                    if (chrome.notifications && chrome.notifications.create) {
                        try {
                            chrome.notifications.create({
                                type: 'basic',
                                iconUrl: chrome.runtime.getURL('icons/icon48.png'),
                                title: 'Doulet AI Assistant',
                                message: 'Please refresh the page and try again. The extension needs to be loaded on this page.'
                            });
                        } catch (notificationError) {
                            console.warn('Failed to create notification:', notificationError);
                        }
                    } else {
                        console.warn('Notifications API not available');
                    }
                }
            });
        } catch (error) {
            console.error('Failed to handle context menu click:', error);
        }
    }
});

// Create context menu on extension startup
createContextMenu();