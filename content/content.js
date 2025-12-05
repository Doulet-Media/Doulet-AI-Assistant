// Content script for AnswersAI extension

// Get display name for model (only supports nova-2-lite-v1:free)
function getModelDisplayName(modelId) {
    if (modelId === 'amazon/nova-2-lite-v1:free') {
        return 'Amazon Nova 2 Lite (Free)';
    }
    return modelId;
}

let currentSelection = '';
let isProcessing = false;
let settings = {};

// Load settings
chrome.storage.sync.get(null, function(result) {
    settings = result;
});

// Listen for storage changes
chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (namespace === 'sync') {
        chrome.storage.sync.get(null, function(result) {
            settings = result;
        });
    }
});

// Handle messages from options page and background script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'updateSettings') {
        settings = request.settings;
        sendResponse({success: true});
    } else if (request.action === 'handleContextMenuSelection') {
        currentSelection = request.text;
        getAIAnswer(currentSelection);
        sendResponse({success: true});
    }
});

// Create the answer button
function createAnswerButton() {
    const existingButton = document.getElementById('answersai-button');
    if (existingButton) {
        existingButton.remove();
    }

    const button = document.createElement('button');
    button.id = 'answersai-button';
    button.innerHTML = '🤖';
    button.title = 'Get AI Answer (Ctrl+Shift+Q)';
    button.style.cssText = `
        position: fixed;
        top: 8px;
        right: 8px;
        z-index: 10000;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 6px 8px;
        border-radius: 50%;
        font-size: 14px;
        line-height: 1;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(102, 126, 234, 0.25);
        transition: all 0.2s ease;
        display: none;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.95;
    `;
    
    button.addEventListener('mouseenter', function() {
        button.style.transform = 'translateY(-1px) scale(1.1)';
        button.style.boxShadow = '0 3px 12px rgba(102, 126, 234, 0.35)';
        button.style.opacity = '1';
    });
    
    button.addEventListener('mouseleave', function() {
        button.style.transform = 'translateY(0) scale(1)';
        button.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.25)';
        button.style.opacity = '0.95';
    });
    
    button.addEventListener('click', function() {
        if (currentSelection) {
            getAIAnswer(currentSelection);
        }
    });

    document.body.appendChild(button);
    return button;
}

// Create the answer modal
function createAnswerModal() {
    const existingModal = document.getElementById('answersai-modal');
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.id = 'answersai-modal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Doulet AI Assistant</h3>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="loading">
                        <div class="spinner"></div>
                        <p>Getting AI answer...</p>
                    </div>
                    <div class="answer-container" style="display: none;">
                        <div class="answer-header">
                            <div class="answer-title">AI Response</div>
                            <div class="model-badge" id="modelBadge">Model: Loading...</div>
                        </div>
                        <div class="answer"></div>
                    </div>
                    <div class="error" style="display: none;"></div>
                </div>
                <div class="modal-footer">
                    <button class="copy-btn">📋 Copy Answer</button>
                    <button class="close-footer-btn">✕ Close</button>
                </div>
            </div>
        </div>
    `;
    
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10001;
        display: none;
    `;
    
    const modalContent = modal.querySelector('.modal-content');
    modalContent.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        width: 80%;
        max-width: 600px;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        max-height: 80vh;
        overflow: hidden;
    `;
    
    const modalHeader = modal.querySelector('.modal-header');
    modalHeader.style.cssText = `
        padding: 15px 20px;
        border-bottom: 1px solid #e0e0e0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
    `;
    
    modalHeader.querySelector('h3').style.cssText = `
        margin: 0;
        font-size: 20px;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    
    modalHeader.querySelector('h3').innerHTML = '🤖 Doulet AI Assistant';
    
    const closeBtn = modal.querySelector('.close-btn');
    closeBtn.style.cssText = `
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
        font-size: 24px;
        cursor: pointer;
        color: white;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s;
    `;
    
    const modalBody = modal.querySelector('.modal-body');
    modalBody.style.cssText = `
        padding: 25px;
        max-height: 65vh;
        overflow-y: auto;
    `;
    
    const loading = modal.querySelector('.loading');
    loading.style.cssText = `
        text-align: center;
        padding: 50px 20px;
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        border-radius: 12px;
        border: 1px solid #dee2e6;
    `;
    
    const spinner = modal.querySelector('.spinner');
    spinner.style.cssText = `
        width: 48px;
        height: 48px;
        border: 5px solid #f3f3f3;
        border-top: 5px solid #667eea;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 25px;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    `;
    
    loading.querySelector('p').style.cssText = `
        margin: 0;
        color: #495057;
        font-size: 16px;
        font-weight: 500;
    `;
    
    const answer = modal.querySelector('.answer');
    answer.style.cssText = `
        line-height: 1.7;
        color: #212529;
        font-size: 15px;
        background: white;
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        border: 1px solid #e9ecef;
        white-space: pre-wrap;
    `;
    
    const error = modal.querySelector('.error');
    error.style.cssText = `
        color: #721c24;
        background: #f8d7da;
        border: 1px solid #f5c6cb;
        padding: 18px;
        border-radius: 12px;
        margin: 15px 0;
        box-shadow: 0 2px 10px rgba(220, 53, 69, 0.1);
    `;
    
    const modalFooter = modal.querySelector('.modal-footer');
    modalFooter.style.cssText = `
        padding: 20px 25px;
        border-top: 1px solid #e0e0e0;
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        background: #f8f9fa;
    `;
    
    const copyBtn = modal.querySelector('.copy-btn');
    copyBtn.style.cssText = `
        padding: 10px 20px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        transition: all 0.3s;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
        color: white;
        box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
    `;
    
    const closeFooterBtn = modal.querySelector('.close-footer-btn');
    closeFooterBtn.style.cssText = `
        padding: 10px 20px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        transition: all 0.3s;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
        color: white;
        box-shadow: 0 4px 15px rgba(108, 117, 125, 0.3);
    `;
    
    // Add event listeners
    closeBtn.addEventListener('click', () => hideModal());
    closeFooterBtn.addEventListener('click', () => hideModal());
    copyBtn.addEventListener('click', () => copyAnswer());

    document.body.appendChild(modal);
    return modal;
}

// Show modal
function showModal() {
    const modal = document.getElementById('answersai-modal');
    if (modal) {
        modal.style.display = 'block';
    }
}

// Hide modal
function hideModal() {
    const modal = document.getElementById('answersai-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Copy answer to clipboard
function copyAnswer() {
    const answerText = document.querySelector('.answer').textContent;
    navigator.clipboard.writeText(answerText).then(() => {
        const copyBtn = document.querySelector('.copy-btn');
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        copyBtn.style.background = '#28a745';
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
    });
}

// Handle text selection
document.addEventListener('mouseup', function() {
    const selection = window.getSelection();
    if (selection.toString().trim().length > 0) {
        currentSelection = selection.toString().trim();
        
        const button = document.getElementById('answersai-button') || createAnswerButton();
        if (button) {
            button.style.display = 'block';
            
            // Position button near selection but not blocking content
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            
            // Calculate position ensuring button stays on screen
            let top = rect.top + window.scrollY - 50;
            let left = rect.right + window.scrollX + 10;
            
            // Keep button within viewport
            if (left + 50 > window.scrollX + window.innerWidth) {
                left = rect.left + window.scrollX - 50;
            }
            if (top < window.scrollY) {
                top = window.scrollY + 10;
            }
            
            button.style.top = top + 'px';
            button.style.left = left + 'px';
        }
        
        // Auto-answer if enabled
        if (settings.autoAnswer && settings.apiKey) {
            setTimeout(() => {
                getAIAnswer(currentSelection);
            }, 500);
        }
    } else {
        const button = document.getElementById('answersai-button');
        if (button) {
            button.style.display = 'none';
        }
    }
});

// Get AI answer
async function getAIAnswer(text) {
    if (isProcessing) return;
    
    // Load API key from storage or file
    let apiKey = settings.apiKey;
    if (!apiKey) {
        // Try to get API key from background script (most reliable)
        try {
            const result = await chrome.runtime.sendMessage({
                action: 'getApiKey'
            });
            if (result && result.apiKey) {
                apiKey = result.apiKey;
            }
        } catch (error) {
            console.error('Failed to get API key from background:', error);
        }
    }
    
    // If still no API key, try reloading settings from storage
    if (!apiKey) {
        try {
            const result = await chrome.storage.sync.get(['apiKey']);
            if (result && result.apiKey) {
                apiKey = result.apiKey;
            }
        } catch (error) {
            console.error('Failed to reload settings:', error);
        }
    }
    
    if (!apiKey) {
        alert('Please enter your OpenRouter API key in the extension settings.');
        return;
    }
    
    isProcessing = true;
    createAnswerModal();
    showModal();
    
    const loading = document.querySelector('.loading');
    const answerContainer = document.querySelector('.answer-container');
    const answer = document.querySelector('.answer');
    const error = document.querySelector('.error');
    const modelBadge = document.querySelector('#modelBadge');
    
    // Set model badge
    if (modelBadge) {
        const modelName = getModelDisplayName(settings.model || 'amazon/nova-2-lite-v1:free');
        modelBadge.textContent = `Model: ${modelName}`;
    }
    
    loading.style.display = 'block';
    answerContainer.style.display = 'none';
    answer.style.display = 'none';
    error.style.display = 'none';
    
    // Add timeout for the API request
    const timeout = settings.timeout || 30;
    const requestTimeout = setTimeout(() => {
        if (isProcessing) {
            isProcessing = false;
            loading.style.display = 'none';
            error.style.display = 'block';
            error.textContent = `Request timeout after ${timeout} seconds. Please try again or increase the timeout in settings.`;
        }
    }, timeout * 1000);
    
    // Build prompt based on settings
    let prompt = '';
    
    // Add custom prompt if provided
    if (settings.customPrompt && settings.customPrompt.trim()) {
        prompt += settings.customPrompt.trim() + '\n\n';
    }
    
    // Add language preference
    let languagePrompt = '';
    if (settings.language && settings.language !== 'auto') {
        const languageMap = {
            'en': 'English',
            'es': 'Spanish',
            'fr': 'French',
            'de': 'German',
            'it': 'Italian',
            'pt': 'Portuguese',
            'ru': 'Russian',
            'zh': 'Chinese',
            'ja': 'Japanese',
            'ko': 'Korean'
        };
        languagePrompt = ` Respond in ${languageMap[settings.language]}.`;
    }
    
    // Add answer style preference
    let stylePrompt = '';
    if (settings.answerStyle) {
        switch(settings.answerStyle) {
            case 'concise':
                stylePrompt = ' Provide a concise answer in 2-3 sentences.';
                break;
            case 'detailed':
                stylePrompt = ' Provide a detailed and comprehensive answer.';
                break;
            case 'technical':
                stylePrompt = ' Provide a technical and in-depth answer with specific details.';
                break;
            case 'casual':
                stylePrompt = ' Provide a casual and conversational answer.';
                break;
        }
    }
    
    // Build final prompt
    prompt += `Please provide a helpful answer to the following text or question.${stylePrompt}${languagePrompt} Keep your response under ${settings.maxTokens || 400} tokens:\n\n"${text}"`;
    
    chrome.runtime.sendMessage({
        action: 'getAnswer',
        text: text,
        prompt: prompt,
        model: settings.model || 'amazon/nova-2-lite-v1:free',
        temperature: settings.temperature || 0.7,
        maxTokens: settings.maxTokens || 400
    }, function(response) {
        clearTimeout(requestTimeout);
        isProcessing = false;
        
        if (response && response.success) {
            loading.style.display = 'none';
            answerContainer.style.display = 'block';
            answer.style.display = 'block';
            answer.textContent = response.answer;
            
            // Play sound if enabled
            if (settings.enableSounds) {
                playNotificationSound();
            }
        } else {
            loading.style.display = 'none';
            error.style.display = 'block';
            error.textContent = response ? response.error : 'Failed to get answer. Please check your API key and try again.';
        }
    });
}

// Play notification sound
function playNotificationSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
        // Ignore audio errors
    }
}

// Removed loadApiKeyFromFile function - API key must be entered manually in settings

// Get API key from background script
async function getApiKeyFromBackground() {
    try {
        const result = await chrome.runtime.sendMessage({
            action: 'getApiKey'
        });
        return result && result.apiKey ? result.apiKey : null;
    } catch (error) {
        console.error('Failed to get API key from background:', error);
        return null;
    }
}

// Keyboard shortcut (Ctrl+Shift+Q)
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'q') {
        e.preventDefault();
        const selection = window.getSelection();
        if (selection.toString().trim().length > 0) {
            currentSelection = selection.toString().trim();
            getAIAnswer(currentSelection);
        } else {
            // If no text selected, show a subtle hint
            const button = document.getElementById('answersai-button') || createAnswerButton();
            if (button) {
                button.style.display = 'block';
                button.style.animation = 'pulse 1s ease-in-out 3';
                setTimeout(() => {
                    button.style.animation = '';
                }, 3000);
            }
        }
    }
});

// Add pulse animation for hints
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
    }
    #answersai-button {
        animation-duration: 0.3s;
    }
`;
document.head.appendChild(style);

// Create initial elements
createAnswerButton();
createAnswerModal();