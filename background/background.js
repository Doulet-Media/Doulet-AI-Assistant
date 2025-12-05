// Background script for Doulet AI Assistant extension

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'getAnswer') {
        getAIAnswer(request, sendResponse);
        return true; // Keep message channel open for async response
    } else if (request.action === 'testConnection') {
        testConnection(request.apiKey, sendResponse);
        return true;
    } else if (request.action === 'getApiKey') {
        // Return API key from storage
        chrome.storage.sync.get(['apiKey'], function(result) {
            sendResponse({ apiKey: result.apiKey || '' });
        });
        return true; // Keep message channel open for async response
    }
});

// Get AI answer from OpenRouter
async function getAIAnswer(request, sendResponse) {
    const { text, prompt, model, temperature, maxTokens } = request;
    
    try {
        // Get API key from storage
        let result = await chrome.storage.sync.get(['apiKey']);
        let apiKey = result.apiKey;
        
        // If no API key in storage, try loading from file
        if (!apiKey) {
            apiKey = await loadApiKeyFromFile();
            if (apiKey) {
                // Store the API key in storage for future use
                await chrome.storage.sync.set({ apiKey: apiKey });
            }
        }
        
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
        const freeModels = await getFreeModels();
        const defaultModel = freeModels.length > 0 ? freeModels[0] : 'amazon/nova-2-lite-v1:free';
        
        // Load API key from apikey.txt file
        const apiKey = await loadApiKeyFromFile();
        
        // Show welcome message
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
            freeModels: freeModels,
            apiKey: apiKey
        });
        
        // Open welcome page
        chrome.tabs.create({
            url: chrome.runtime.getURL('welcome/welcome.html')
        });
    }
});

// Handle extension startup
chrome.runtime.onStartup.addListener(async function() {
    // Reload API key from file in case it was updated
    const apiKey = await loadApiKeyFromFile();
    if (apiKey) {
        chrome.storage.sync.set({ apiKey: apiKey });
    }
    
    // Recreate context menu on startup
    createContextMenu();
});

// Also load API key when the background script starts
(async function() {
    const apiKey = await loadApiKeyFromFile();
    if (apiKey) {
        chrome.storage.sync.set({ apiKey: apiKey });
    }
})();

// Load API key from apikey.txt file
async function loadApiKeyFromFile() {
    try {
        const response = await fetch(chrome.runtime.getURL('apikey.txt'));
        if (response.ok) {
            const apiKey = await response.text();
            return apiKey.trim();
        }
    } catch (error) {
        console.error('Failed to load API key from file:', error);
    }
    return '';
}

// Get free models from OpenRouter API
async function getFreeModels() {
    try {
        // Load API key from storage
        const result = await chrome.storage.sync.get(['apiKey']);
        const apiKey = result.apiKey;
        
        if (!apiKey) {
            // Return default models if no API key
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
            // Filter for models with "free" in the name or completely free models
            const freeModels = data.data
                .filter(model => {
                    // Check if "free" is in the model name or ID
                    const name = (model.name || model.id || '').toLowerCase();
                    const isFreeInName = name.includes('free');
                    
                    // Also check pricing if available
                    const isFreeByPricing = model.pricing &&
                                           model.pricing.prompt === "0" &&
                                           model.pricing.completion === "0";
                    
                    return isFreeInName || isFreeByPricing;
                })
                .map(model => model.id)
                .sort(); // Sort alphabetically
            
            // Ensure our default model is included
            if (!freeModels.includes('amazon/nova-2-lite-v1:free')) {
                freeModels.unshift('amazon/nova-2-lite-v1:free');
            }
            
            return freeModels;
        }
        
        return ['amazon/nova-2-lite-v1:free'];
    } catch (error) {
        console.error('Failed to fetch free models:', error);
        return ['amazon/nova-2-lite-v1:free'];
    }
}

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
chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId === 'get-ai-answer' && info.selectionText) {
        // Send message to content script to get answer
        chrome.tabs.sendMessage(tab.id, {
            action: 'handleContextMenuSelection',
            text: info.selectionText
        });
    }
});

// Create context menu on extension startup
createContextMenu();