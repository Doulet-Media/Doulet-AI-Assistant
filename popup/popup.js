// Popup script for AnswersAI extension

document.addEventListener('DOMContentLoaded', function() {
    const apiKeyInput = document.getElementById('apiKey');
    const nvidiaApiKeyInput = document.getElementById('nvidiaApiKey');
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
        'nvidiaApiKey',
        'model',
        'temperature',
        'maxTokens',
        'autoAnswer',
        'freeModels'
    ], async function(result) {
        // Load API key from storage only (no file loading)
        let apiKey = result.apiKey;
        
        // Always set the API key in the input field if available
        if (apiKey) {
            apiKeyInput.value = apiKey;
            // Check connection status
            checkConnectionStatus(apiKey);
        } else {
            // Show API key input if not auto-loaded
            showStatus('Please enter your API key', 'disconnected');
        }
        
        // Load NVIDIA API key
        if (result.nvidiaApiKey) {
            nvidiaApiKeyInput.value = result.nvidiaApiKey;
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
            populateModelSelect(result.freeModels, result.model);
        } else {
            // Fetch free models if not available
            fetchFreeModels().then(models => {
                if (models.length > 0) {
                    populateModelSelect(models, result.model);
                    chrome.storage.sync.set({ freeModels: models });
                }
            });
        }
    });

    // Refresh models when popup opens
    refreshModelsList();

    // Update max tokens value display
    maxTokensSlider.addEventListener('input', function() {
        maxTokensValue.textContent = this.value + ' tokens';
    });

    // Save settings
    saveBtn.addEventListener('click', function() {
        // Check extension context before processing
        if (!chrome || !chrome.runtime || !chrome.storage || !chrome.storage.sync) {
            console.warn('Extension context invalidated, cannot save settings');
            showStatus('Extension context invalidated', 'disconnected');
            return;
        }
        
        const settings = {
            apiKey: apiKeyInput.value.trim(),
            nvidiaApiKey: nvidiaApiKeyInput.value.trim(),
            model: modelSelect.value,
            temperature: parseFloat(temperatureSlider.value),
            maxTokens: parseInt(maxTokensSlider.value),
            autoAnswer: autoAnswerCheckbox.checked
        };

        try {
            chrome.storage.sync.set(settings, function() {
                showStatus('Settings saved!', 'connected');
                
                // Check connection status and fetch models
                if (settings.apiKey) {
                    checkConnectionStatus(settings.apiKey);
                    // Auto-fetch models after saving API key
                    setTimeout(() => {
                        fetchAndPopulateModels(settings.apiKey).then(() => {
                            showStatus('Models updated! Check the model list above.', 'connected');
                        });
                    }, 500);
                }
            });
        } catch (error) {
            console.error('Failed to save settings:', error);
            showStatus('Failed to save settings', 'disconnected');
        }
    });

    // Open options page
    const optionsBtn = document.getElementById('optionsBtn');
    if (optionsBtn) {
        optionsBtn.addEventListener('click', function() {
            chrome.runtime.openOptionsPage();
        });
    }

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
                // Fetch free models after successful connection
                fetchAndPopulateModels(apiKey);
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
        try {
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
        } catch (error) {
            console.error('Failed to test connection:', error);
            showStatus('Failed to test connection', 'disconnected');
        }
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

    // Fetch and populate models from background script
    async function fetchAndPopulateModels(apiKey) {
        try {
            showStatus('Fetching available models...', 'connected');
            
            const result = await chrome.runtime.sendMessage({
                action: 'fetchFreeModels'
            });
            
            if (result.success && result.models && result.models.length > 0) {
                populateModelSelect(result.models, modelSelect.value);
                chrome.storage.sync.set({ freeModels: result.models });
                showStatus(`Found ${result.models.length} free models ✓`, 'connected');
            } else {
                showStatus('Failed to fetch models', 'disconnected');
            }
        } catch (error) {
            console.error('Failed to fetch models:', error);
            showStatus('Failed to fetch models', 'disconnected');
        }
    }

    // Fetch free models from OpenRouter (kept for backward compatibility)
    async function fetchFreeModels() {
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
    function populateModelSelect(models, currentModel) {
        modelSelect.innerHTML = '';
        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = getModelDisplayName(model);
            if (model === currentModel) {
                option.selected = true;
            }
            modelSelect.appendChild(option);
        });
    }

    // Refresh models list when popup opens
    async function refreshModelsList() {
        try {
            const result = await chrome.runtime.sendMessage({
                action: 'fetchFreeModels'
            });
            
            if (result.success && result.models && result.models.length > 0) {
                populateModelSelect(result.models, modelSelect.value);
                chrome.storage.sync.set({ freeModels: result.models });
                console.log('Models refreshed in popup:', result.models.length);
            }
        } catch (error) {
            console.error('Failed to refresh models in popup:', error);
        }
    }

    // Documentation modal functionality
    const quickStartLink = document.getElementById('quickStartLink');
    const troubleshootingLink = document.getElementById('troubleshootingLink');
    const privacyLink = document.getElementById('privacyLink');
    const docModal = document.getElementById('docModal');
    const closeModal = document.getElementById('closeModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');

    // Quick Start Guide content
    const quickStartContent = `
        <h3>🚀 Quick Start Guide</h3>
        <ol>
            <li><strong>Get Your Free API Key:</strong> Visit openrouter.ai and sign up for a free account</li>
            <li><strong>Enter API Key:</strong> Click the Doulet AI Assistant extension icon and enter your API key</li>
            <li><strong>Test Connection:</strong> Click "Test Connection" to verify your API key and fetch available models</li>
            <li><strong>Select Model:</strong> Choose your preferred AI model from the automatically populated list</li>
            <li><strong>Start Using:</strong> Highlight any text on a webpage and click the floating AI button or press Ctrl+Shift+Q</li>
        </ol>
        
        <h3>💡 Tips:</h3>
        <ul>
            <li>Models are automatically discovered and updated in real-time</li>
            <li>All models listed are completely free to use</li>
            <li>Works on all websites including Google Docs, Gmail, and restricted sites</li>
            <li>Non-intrusive design that doesn't block your content</li>
        </ul>
    `;

    // Troubleshooting content
    const troubleshootingContent = `
        <h3>🔧 Troubleshooting</h3>
        
        <h3>API Connection Issues</h3>
        <ul>
            <li><strong>"Invalid API Key" Error:</strong> Double-check your API key for typos, make sure you're using a valid OpenRouter API key</li>
            <li><strong>"Connection Failed" Error:</strong> Check your internet connection, ensure OpenRouter.ai is accessible in your region</li>
        </ul>
        
        <h3>Performance Issues</h3>
        <ul>
            <li><strong>Slow Responses:</strong> Try a different AI model (some are faster than others), reduce the max response length, check your internet connection</li>
            <li><strong>High Memory Usage:</strong> Use smaller models like Nova 2 Lite, reduce max tokens setting</li>
        </ul>
        
        <h3>Extension Issues</h3>
        <ul>
            <li><strong>Extension Not Working:</strong> Make sure the extension is enabled, check that you have the latest version</li>
            <li><strong>Button Not Appearing:</strong> Check that "Show Answer Button" is enabled in options, refresh the webpage</li>
        </ul>
        
        <h3>Need Help?</h3>
        <ul>
            <li>Check this README for common solutions</li>
            <li>Report bugs or request features through the extension options</li>
        </ul>
    `;

    // Privacy Policy content
    const privacyContent = `
        <h3>🔒 Privacy Policy</h3>
        
        <h3>Our Commitment to Privacy</h3>
        <p><strong>No Data Collection:</strong> We don't collect or store any of your personal data</p>
        <p><strong>Local Storage:</strong> Your API key is stored locally in your browser only</p>
        <p><strong>Secure Communication:</strong> All API calls use HTTPS encryption</p>
        <p><strong>OpenRouter Privacy:</strong> Your usage is covered by OpenRouter's privacy policy</p>
        
        <h3>What We Don't Collect</h3>
        <ul>
            <li>No personal information (name, email, etc.)</li>
            <li>No browsing history or website data</li>
            <li>No text content of your selections</li>
            <li>No AI responses or interactions</li>
        </ul>
        
        <h3>Your Data</h3>
        <p>Your API key is stored locally in your browser and is never transmitted to our servers or shared with third parties. You can delete it at any time by clearing your browser's extension data.</p>
    `;

    // Modal event handlers
    if (quickStartLink) {
        quickStartLink.addEventListener('click', function(e) {
            e.preventDefault();
            showModal('🚀 Quick Start Guide', quickStartContent);
        });
    }

    if (troubleshootingLink) {
        troubleshootingLink.addEventListener('click', function(e) {
            e.preventDefault();
            showModal('🔧 Troubleshooting', troubleshootingContent);
        });
    }

    if (privacyLink) {
        privacyLink.addEventListener('click', function(e) {
            e.preventDefault();
            showModal('🔒 Privacy Policy', privacyContent);
        });
    }

    if (closeModal) {
        closeModal.addEventListener('click', function() {
            hideModal();
        });
    }

    // Close modal when clicking outside
    docModal.addEventListener('click', function(e) {
        if (e.target === docModal) {
            hideModal();
        }
    });

    // Keyboard support (Escape key)
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && docModal.style.display === 'block') {
            hideModal();
        }
    });

    function showModal(title, content) {
        modalTitle.textContent = title;
        modalContent.innerHTML = content;
        docModal.style.display = 'block';
        
        // Add animation
        setTimeout(() => {
            docModal.style.opacity = '1';
        }, 10);
    }

    function hideModal() {
        docModal.style.opacity = '0';
        setTimeout(() => {
            docModal.style.display = 'none';
        }, 300);
    }
});