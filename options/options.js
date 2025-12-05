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

    // Save settings
    saveBtn.addEventListener('click', function() {
        const settings = {
            autoAnswer: autoAnswerCheckbox.checked,
            showButton: showButtonCheckbox.checked,
            enableSounds: enableSoundsCheckbox.checked,
            answerStyle: answerStyleSelect.value,
            language: languageSelect.value,
            maxAnswers: parseInt(maxAnswersInput.value) || 10,
            clearHistory: clearHistoryCheckbox.checked,
            anonymousMode: anonymousModeCheckbox.checked,
            customPrompt: customPromptTextarea.value,
            timeout: parseInt(timeoutInput.value) || 30,
            model: modelSelect.value
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
                timeout: 30
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
        
        const response = await fetch('https://openrouter.ai/api/v1/models/user', {
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
            // Filter for completely free models (pricing.prompt = "0")
            const freeModels = data.data
                .filter(model => {
                    return model.pricing &&
                           model.pricing.prompt === "0" &&
                           model.pricing.completion === "0";
                })
                .map(model => model.id);
            
            // Add the specific model you want to use
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

// Populate model select with free models
function populateModelSelect(models) {
    // This would need to be added to the HTML first
    // For now, we'll just log the available models
    console.log('Available free models:', models);
}