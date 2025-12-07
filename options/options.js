// Options page script for AnswersAI extension

document.addEventListener('DOMContentLoaded', function() {
    // Get all form elements
    const autoAnswerCheckbox = document.getElementById('autoAnswer');
    const showButtonCheckbox = document.getElementById('showButton');
    const enableSoundsCheckbox = document.getElementById('enableSounds');
    const answerStyleSelect = document.getElementById('answerStyle');
    const languageSelect = document.getElementById('language');
    const maxAnswersInput = document.getElementById('maxAnswers');
    const clearHistoryCheckbox = document.getElementById('clearHistory');
    const anonymousModeCheckbox = document.getElementById('anonymousMode');
    const customPromptTextarea = document.getElementById('customPrompt');
    const timeoutInput = document.getElementById('timeout');
    const modelSelect = document.getElementById('model');
    const nvidiaApiKeyInput = document.getElementById('nvidiaApiKey');
    
    const saveBtn = document.getElementById('saveBtn');
    const resetBtn = document.getElementById('resetBtn');
    const testBtn = document.getElementById('testBtn');
    const statusDiv = document.getElementById('status');

    // Load current settings
    chrome.storage.sync.get(null, async function(result) {
        // General settings
        autoAnswerCheckbox.checked = result.autoAnswer || false;
        showButtonCheckbox.checked = result.showButton !== false; // Default to true
        enableSoundsCheckbox.checked = result.enableSounds || false;
        
        // Selection enhancement setting
        const enableSelectionEnhancementCheckbox = document.getElementById('enableSelectionEnhancement');
        if (enableSelectionEnhancementCheckbox) {
            enableSelectionEnhancementCheckbox.checked = result.enableSelectionEnhancement || false;
        }
        
        // Answer settings
        answerStyleSelect.value = result.answerStyle || 'concise';
        languageSelect.value = result.language || 'auto';
        maxAnswersInput.value = result.maxAnswers || 10;
        
        // Privacy settings
        clearHistoryCheckbox.checked = result.clearHistory || false;
        anonymousModeCheckbox.checked = result.anonymousMode || false;
        
        // Advanced settings
        customPromptTextarea.value = result.customPrompt || '';
        timeoutInput.value = result.timeout || 30;
        
        // Model selection
        if (result.model) modelSelect.value = result.model;
        
        // NVIDIA API key
        if (result.nvidiaApiKey) nvidiaApiKeyInput.value = result.nvidiaApiKey;
        
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
        
        // Refresh models when options page loads
        refreshModelsList();
    });

    // Save settings
    saveBtn.addEventListener('click', function() {
        const settings = {
            autoAnswer: autoAnswerCheckbox.checked,
            showButton: showButtonCheckbox.checked,
            enableSounds: enableSoundsCheckbox.checked,
            enableSelectionEnhancement: enableSelectionEnhancementCheckbox ? enableSelectionEnhancementCheckbox.checked : false,
            answerStyle: answerStyleSelect.value,
            language: languageSelect.value,
            maxAnswers: parseInt(maxAnswersInput.value) || 10,
            clearHistory: clearHistoryCheckbox.checked,
            anonymousMode: anonymousModeCheckbox.checked,
            customPrompt: customPromptTextarea.value,
            timeout: parseInt(timeoutInput.value) || 30,
            model: modelSelect.value,
            nvidiaApiKey: nvidiaApiKeyInput.value
        };

        chrome.storage.sync.set(settings, function() {
            showStatus('Settings saved successfully!', 'success');
            
            // Update content script with new settings
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                if (tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: 'updateSettings',
                        settings: settings
                    });
                }
            });
        });
    });

    // Reset to defaults
    resetBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to reset all settings to defaults?')) {
            const defaults = {
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
                nvidiaApiKey: ''
            };

            // Reset form values
            autoAnswerCheckbox.checked = defaults.autoAnswer;
            showButtonCheckbox.checked = defaults.showButton;
            enableSoundsCheckbox.checked = defaults.enableSounds;
            answerStyleSelect.value = defaults.answerStyle;
            languageSelect.value = defaults.language;
            maxAnswersInput.value = defaults.maxAnswers;
            clearHistoryCheckbox.checked = defaults.clearHistory;
            anonymousModeCheckbox.checked = defaults.anonymousMode;
            customPromptTextarea.value = defaults.customPrompt;
            timeoutInput.value = defaults.timeout;
            nvidiaApiKeyInput.value = defaults.nvidiaApiKey;

            chrome.storage.sync.set(defaults, function() {
                showStatus('Settings reset to defaults!', 'success');
            });
        }
    });

    // Test API connection
    testBtn.addEventListener('click', function() {
        chrome.storage.sync.get(['apiKey'], function(result) {
            if (!result.apiKey) {
                showStatus('Please enter your API key in the popup settings first.', 'error');
                return;
            }

            showStatus('Testing connection...', 'success');
            
            chrome.runtime.sendMessage({
                action: 'testConnection',
                apiKey: result.apiKey
            }, function(response) {
                if (response && response.success) {
                    showStatus('Connection successful! Your API key is working.', 'success');
                    // Fetch free models after successful connection
                    fetchAndPopulateModels(result.apiKey);
                } else {
                    showStatus('Connection failed. Please check your API key.', 'error');
                }
            });
        });
    });

    // Show status message
    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = 'status ' + type;
        statusDiv.style.display = 'block';
        
        // Auto-hide after 3 seconds
        setTimeout(function() {
            statusDiv.style.display = 'none';
        }, 3000);
    }
});

// Add some interactivity
document.addEventListener('click', function(e) {
    if (e.target && e.target.id === 'testBtn') {
        // Button click animation
        e.target.style.transform = 'scale(0.95)';
        setTimeout(() => {
            e.target.style.transform = 'scale(1)';
        }, 150);
    }
});

// Fetch and populate models from background script
async function fetchAndPopulateModels(apiKey) {
    try {
        const result = await chrome.runtime.sendMessage({
            action: 'fetchFreeModels'
        });
        
        if (result.success && result.models && result.models.length > 0) {
            populateModelSelect(result.models);
            chrome.storage.sync.set({ freeModels: result.models });
            console.log(`Found ${result.models.length} free models`);
        }
    } catch (error) {
        console.error('Failed to fetch models:', error);
    }
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

// Fetch free models from OpenRouter (kept for backward compatibility)
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
        return ['amazon/nova-2-lite-v1:free'];
    }
}

// Populate model select with free models (enhanced version)
function populateModelSelect(models) {
    // Get the model select element from the popup or create a display
    const modelSelect = document.getElementById('model');
    if (modelSelect) {
        modelSelect.innerHTML = '';
        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = getModelDisplayName(model);
            modelSelect.appendChild(option);
        });
    }
    
    // Also log the available models for debugging
    console.log('Available free models:', models);
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

// Refresh models list when options page loads
async function refreshModelsList() {
    try {
        const result = await chrome.runtime.sendMessage({
            action: 'fetchFreeModels'
        });
        
        if (result.success && result.models && result.models.length > 0) {
            populateModelSelect(result.models);
            chrome.storage.sync.set({ freeModels: result.models });
            console.log('Models refreshed in options:', result.models.length);
        }
    } catch (error) {
        console.error('Failed to refresh models in options:', error);
    }
}