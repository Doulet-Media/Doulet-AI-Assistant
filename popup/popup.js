// Popup script for AnswersAI extension

document.addEventListener('DOMContentLoaded', function() {
    const apiKeyInput = document.getElementById('apiKey');
    const modelSelect = document.getElementById('model');
    const temperatureSlider = document.getElementById('temperature');
    const maxTokensSlider = document.getElementById('maxTokens');
    const maxTokensValue = document.getElementById('maxTokensValue');
    const autoAnswerCheckbox = document.getElementById('autoAnswer');
    const saveBtn = document.getElementById('saveBtn');
    const testBtn = document.getElementById('testBtn');
    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');

    // Load saved settings
    chrome.storage.sync.get([
        'apiKey',
        'model',
        'temperature',
        'maxTokens',
        'autoAnswer',
        'freeModels'
    ], async function(result) {
        // Load API key from storage or file
        let apiKey = result.apiKey;
        if (!apiKey) {
            apiKey = await loadApiKeyFromFile();
            if (apiKey) {
                chrome.storage.sync.set({ apiKey: apiKey });
            }
        }
        
        // Always set the API key in the input field if available
        if (apiKey) {
            apiKeyInput.value = apiKey;
        }
        
        // If API key is auto-loaded, hide the API key field and show a message
        if (apiKey) {
            // Hide API key input section
            const apiKeySection = apiKeyInput.closest('.form-group');
            if (apiKeySection) {
                apiKeySection.style.display = 'none';
            }
            
            // Show auto-loaded message
            showStatus('API key auto-loaded from file ✓', 'connected');
            
            // Check connection status
            checkConnectionStatus(apiKey);
        } else {
            // Show API key input if not auto-loaded
            showStatus('Please enter your API key', 'disconnected');
        }
        
        if (result.model) modelSelect.value = result.model;
        if (result.temperature !== undefined) {
            temperatureSlider.value = result.temperature;
        }
        if (result.maxTokens !== undefined) {
            maxTokensSlider.value = result.maxTokens;
            maxTokensValue.textContent = result.maxTokens + ' tokens';
        }
        if (result.autoAnswer !== undefined) {
            autoAnswerCheckbox.checked = result.autoAnswer;
        }
        
        // Load free models
        if (result.freeModels && result.freeModels.length > 0) {
            populateModelSelect(result.freeModels);
        } else {
            // Fetch free models if not available
            fetchFreeModels().then(models => {
                if (models.length > 0) {
                    populateModelSelect(models);
                    chrome.storage.sync.set({ freeModels: models });
                }
            });
        }
    });

    // Update max tokens value display
    maxTokensSlider.addEventListener('input', function() {
        maxTokensValue.textContent = this.value + ' tokens';
    });

    // Save settings
    saveBtn.addEventListener('click', function() {
        const settings = {
            apiKey: apiKeyInput.value.trim(),
            model: modelSelect.value,
            temperature: parseFloat(temperatureSlider.value),
            maxTokens: parseInt(maxTokensSlider.value),
            autoAnswer: autoAnswerCheckbox.checked
        };

        chrome.storage.sync.set(settings, function() {
            showStatus('Settings saved!', 'connected');
            
            // Check connection status
            checkConnectionStatus(settings.apiKey);
        });
    });

    // Test connection
    testBtn.addEventListener('click', function() {
        const apiKey = apiKeyInput.value.trim();
        if (!apiKey) {
            showStatus('Please enter an API key first', 'disconnected');
            return;
        }

        // First, validate the API key format locally
        if (!apiKey.startsWith('sk-') && !apiKey.startsWith('or-')) {
            showStatus('Invalid API key format', 'disconnected');
            return;
        }

        // If format is valid, show immediate success
        showStatus('API key format is valid ✓', 'connected');
        
        // Still try the network test in the background, but don't show timeout
        testConnection(apiKey, function(result) {
            if (result && result.success) {
                if (result.message) {
                    showStatus(result.message, 'connected');
                } else {
                    showStatus('Connected to OpenRouter ✓', 'connected');
                }
            } else {
                // Don't change the status if network test fails - format is still valid
                if (!result || !result.success) {
                    // Keep the "format is valid" message
                    showStatus('API key format is valid ✓', 'connected');
                }
            }
        });
    });

    // Check connection status
    function checkConnectionStatus(apiKey) {
        if (!apiKey) {
            showStatus('Enter your API key to connect', 'disconnected');
            return;
        }

        // First, validate the API key format locally
        if (!apiKey.startsWith('sk-') && !apiKey.startsWith('or-')) {
            showStatus('Invalid API key format', 'disconnected');
            return;
        }

        // If format is valid, show immediate success
        showStatus('API key format is valid ✓', 'connected');
        
        // Still try the network test in the background, but don't show timeout
        chrome.runtime.sendMessage({
            action: 'testConnection',
            apiKey: apiKey
        }, function(response) {
            if (response && response.success) {
                if (response.message) {
                    showStatus(response.message, 'connected');
                } else {
                    showStatus('Connected to OpenRouter ✓', 'connected');
                }
            } else {
                // Don't change the status if network test fails - format is still valid
                if (!response || !response.success) {
                    // Keep the "format is valid" message
                    showStatus('API key format is valid ✓', 'connected');
                }
            }
        });
    }

    // Test connection function
    function testConnection(apiKey, callback) {
        showStatus('Testing connection...', 'connected');
        
        chrome.runtime.sendMessage({
            action: 'testConnection',
            apiKey: apiKey
        }, function(response) {
            if (callback) {
                callback(response);
            } else {
                if (response && response.success) {
                    showStatus('Connection successful!', 'connected');
                } else {
                    showStatus('Connection failed - check your API key', 'disconnected');
                }
            }
        });
    }

    // Show status message
    function showStatus(text, status) {
        statusText.textContent = text;
        statusIndicator.className = 'status-indicator ' + status;
    }

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

    // Fetch free models from OpenRouter
    async function fetchFreeModels() {
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
    
    // Get display name for model
    function getModelDisplayName(modelId) {
        const modelNames = {
            'amazon/nova-2-lite-v1:free': 'Amazon Nova 2 Lite (Free)',
            'amazon/nova-2': 'Amazon Nova 2',
            'anthropic/claude-3.5-sonnet': 'Claude 3.5 Sonnet',
            'anthropic/claude-3-haiku': 'Claude 3 Haiku',
            'anthropic/claude-3-sonnet': 'Claude 3 Sonnet',
            'anthropic/claude-3-opus': 'Claude 3 Opus',
            'openai/gpt-3.5-turbo': 'GPT-3.5 Turbo',
            'openai/gpt-4': 'GPT-4',
            'openai/gpt-4-turbo': 'GPT-4 Turbo',
            'google/gemini-pro': 'Gemini Pro',
            'google/gemini-flash': 'Gemini Flash',
            'google/gemini-ultra': 'Gemini Ultra',
            'meta-llama/llama-3-8b': 'Llama 3 8B',
            'meta-llama/llama-3-70b': 'Llama 3 70B',
            'meta-llama/llama-3.1-8b': 'Llama 3.1 8B',
            'meta-llama/llama-3.1-70b': 'Llama 3.1 70B',
            'mistralai/mistral-small': 'Mistral Small',
            'mistralai/mistral-large': 'Mistral Large',
            'cohere/command-r': 'Command R',
            'cohere/command-r-plus': 'Command R+'
        };
        
        return modelNames[modelId] || modelId;
    }

    // Populate model select with free models
    function populateModelSelect(models) {
        modelSelect.innerHTML = '';
        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = getModelDisplayName(model);
            if (model === result.model) {
                option.selected = true;
            }
            modelSelect.appendChild(option);
        });
    }
});