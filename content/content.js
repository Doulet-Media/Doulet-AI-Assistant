// Content script for AnswersAI extension

// Get display name for model (only supports nova-2-lite-v1:free)
function getModelDisplayName(modelId) {
    if (modelId === 'amazon/nova-2-lite-v1:free') {
        return 'Amazon Nova 2 Lite (Free)';
    }
    return modelId;
}

// Enhanced selection and visibility features
let currentSelection = '';
let isProcessing = false;
let settings = {};
let isSelectionEnhanced = false;
let originalSelectionStyles = new Map();

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
    try {
        // Validate extension context before processing
        if (!chrome || !chrome.runtime) {
            console.warn('Extension context invalidated in message listener');
            if (sendResponse) {
                try {
                    sendResponse({success: false, error: 'Extension context invalidated'});
                } catch (error) {
                    console.warn('Failed to send error response:', error);
                }
            }
            return;
        }
        
        if (request.action === 'updateSettings') {
            settings = request.settings;
            sendResponse({success: true});
        } else if (request.action === 'handleContextMenuSelection') {
            currentSelection = request.text;
            getAIAnswer(currentSelection);
            sendResponse({success: true});
        }
    } catch (error) {
        console.error('Error in message listener:', error);
        if (sendResponse) {
            try {
                sendResponse({success: false, error: 'Message handling failed'});
            } catch (sendError) {
                console.warn('Failed to send error response:', sendError);
            }
        }
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
        z-index: 1000000;
        width: 45px;
        height: 45px;
        border-radius: 50%;
        border: none;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        font-size: 20px;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        display: none;
        opacity: 0;
        user-select: none;
        -webkit-user-select: none;
        touch-action: manipulation;
        backdrop-filter: blur(10px);
        border: 2px solid rgba(255, 255, 255, 0.2);
    `;
    
    button.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-3px) scale(1.1)';
        this.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.5)';
        this.style.zIndex = '1000001';
    });
    
    button.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
        this.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
    });
    
    button.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Check extension context
        if (!chrome || !chrome.runtime) {
            console.warn('Extension context invalidated, cannot get AI answer');
            return;
        }
        
        if (currentSelection) {
            getAIAnswer(currentSelection);
        } else {
            // Show pulse animation to indicate no selection
            this.style.animation = 'pulse 1s ease-in-out 3';
            setTimeout(() => {
                this.style.animation = '';
            }, 3000);
        }
    });
    
    // Enhanced click detection for restricted sites
    button.addEventListener('mousedown', function(e) {
        e.stopPropagation();
    });
    
    button.addEventListener('mouseup', function(e) {
        e.stopPropagation();
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
                    <button class="close-btn" aria-label="Close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="loading">
                        <div class="spinner" aria-hidden="true"></div>
                        <p>Getting AI answer...</p>
                        <div class="loading-subtext">This may take a moment. Please wait...</div>
                    </div>
                    <div class="answer-container" style="display: none;">
                        <div class="answer-header">
                            <div class="answer-title">AI Response</div>
                            <div class="model-badge" id="modelBadge">Model: Loading...</div>
                        </div>
                        <div class="answer" role="status" aria-live="polite"></div>
                        <div class="answer-footer">
                            <small class="answer-help">Tip: Use Ctrl+C to copy or click the Copy button below</small>
                        </div>
                    </div>
                    <div class="error" style="display: none;" role="alert"></div>
                </div>
                <div class="modal-footer">
                    <button class="copy-btn" aria-label="Copy answer to clipboard">📋 Copy Answer</button>
                    <button class="close-footer-btn" aria-label="Close modal">✕ Close</button>
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
        margin: 0 auto 15px;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    `;
    
    loading.querySelector('p').style.cssText = `
        margin: 0 0 8px 0;
        color: #495057;
        font-size: 16px;
        font-weight: 600;
    `;
    
    const loadingSubtext = loading.querySelector('.loading-subtext');
    loadingSubtext.style.cssText = `
        margin: 0;
        color: #6c757d;
        font-size: 13px;
        font-weight: 400;
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
        max-height: 40vh;
        overflow-y: auto;
    `;
    
    const answerFooter = modal.querySelector('.answer-footer');
    answerFooter.style.cssText = `
        margin-top: 15px;
        padding-top: 15px;
        border-top: 1px solid #e9ecef;
    `;
    
    const answerHelp = answerFooter.querySelector('.answer-help');
    answerHelp.style.cssText = `
        color: #6c757d;
        font-style: italic;
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
        font-size: 14px;
        line-height: 1.5;
    `;
    
    // Add helpful error suggestions
    error.innerHTML = `
        <strong>Oops!</strong> Something went wrong. Here are some things to try:
        <ul style="margin-top: 8px; margin-left: 20px;">
            <li>Check your internet connection</li>
            <li>Verify your API key is correct</li>
            <li>Try selecting different text</li>
            <li>Wait a moment and try again (you may have hit the rate limit)</li>
        </ul>
        <div style="margin-top: 10px; font-size: 12px; color: #495057;">
            Tip: If problems persist, check the extension settings or contact support.
        </div>
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

// Copy answer to clipboard with enhanced feedback
function copyAnswer() {
    const answerText = document.querySelector('.answer').textContent;
    navigator.clipboard.writeText(answerText).then(() => {
        const copyBtn = document.querySelector('.copy-btn');
        const originalText = copyBtn.textContent;
        const originalBackground = copyBtn.style.background;
        
        // Enhanced feedback
        copyBtn.textContent = '✅ Copied to Clipboard!';
        copyBtn.style.background = '#28a745';
        copyBtn.style.transform = 'scale(1.05)';
        
        // Play success sound
        playSuccessSound();
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.background = originalBackground;
            copyBtn.style.transform = 'scale(1)';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
        // Fallback: create temporary textarea
        const textArea = document.createElement('textarea');
        textArea.value = answerText;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            // Show fallback success message
            const copyBtn = document.querySelector('.copy-btn');
            copyBtn.textContent = '✅ Copied (fallback)!';
            copyBtn.style.background = '#28a745';
            setTimeout(() => {
                copyBtn.textContent = '📋 Copy Answer';
                copyBtn.style.background = '';
            }, 2000);
        } catch (fallbackErr) {
            console.error('Fallback copy also failed:', fallbackErr);
        } finally {
            document.body.removeChild(textArea);
        }
    });
}

// Enhanced success sound
function playSuccessSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5
        oscillator.frequency.exponentialRampToValueAtTime(440, audioContext.currentTime + 0.1); // A4
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.15);
    } catch (e) {
        // Ignore audio errors
    }
}

// Handle text selection with enhanced universal compatibility
function handleTextSelection() {
    try {
        // Check if extension context is still valid before processing
        if (!chrome || !chrome.runtime) {
            console.warn('Extension context invalidated, ignoring text selection');
            return;
        }
        
        // Additional validation for chrome APIs
        if (!chrome.storage || !chrome.storage.sync) {
            console.warn('Extension storage not available, ignoring text selection');
            return;
        }
        
        // Enhanced selection detection for all websites
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();
        
        // Enhanced selection validation for universal compatibility
        if (selectedText.length > 0) {
            // Validate selection quality
            if (selectedText.length < 3 && !/[a-zA-Z]/.test(selectedText)) {
                // Too short or only numbers/symbols, ignore
                return;
            }
            
            currentSelection = selectedText;
            
            // Enhanced selection visibility if enabled
            if (settings.enableSelectionEnhancement && !isSelectionEnhanced) {
                enhanceSelectionVisibility();
            }
            
            // Create or get the answer button
            let button = document.getElementById('answersai-button');
            if (!button) {
                button = createAnswerButton();
            }
            
            if (button) {
                button.style.display = 'block';
                
                // Enhanced positioning for universal website compatibility
                try {
                    const range = selection.getRangeAt(0);
                    const rect = range.getBoundingClientRect();
                    
                    // Calculate position ensuring button stays on screen
                    let top = rect.top + window.scrollY - 50;
                    let left = rect.right + window.scrollX + 10;
                    
                    // Keep button within viewport with better calculations
                    const viewportWidth = window.innerWidth;
                    const viewportHeight = window.innerHeight;
                    const scrollX = window.scrollX;
                    const scrollY = window.scrollY;
                    
                    // Adjust position if near edges
                    if (left + 60 > scrollX + viewportWidth) {
                        left = rect.left + scrollX - 60;
                    }
                    
                    if (top < scrollY) {
                        top = scrollY + 10;
                    }
                    
                    if (top + 40 > scrollY + viewportHeight - 10) {
                        top = rect.bottom + scrollY + 10;
                    }
                    
                    // Ensure button doesn't go off-screen left
                    if (left < scrollX + 10) {
                        left = scrollX + 10;
                    }
                    
                    button.style.top = top + 'px';
                    button.style.left = left + 'px';
                    button.style.opacity = '1';
                    
                    // Add smooth animation
                    button.style.transition = 'all 0.3s ease';
                    
                } catch (error) {
                    console.warn('Failed to position button:', error);
                    // Fallback positioning
                    button.style.top = (window.scrollY + 10) + 'px';
                    button.style.left = (window.scrollX + 10) + 'px';
                }
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
                button.style.opacity = '0';
            }
            
            // Reset selection enhancement when no text selected
            if (isSelectionEnhanced) {
                resetSelectionVisibility();
            }
        }
    } catch (error) {
        console.error('Error in text selection handler:', error);
    }
}

// Optimized event listeners for better performance
document.addEventListener('mouseup', handleTextSelection, { passive: true });
document.addEventListener('keyup', function(e) {
    if (e.shiftKey) {
        setTimeout(handleTextSelection, 50);
    }
}, { passive: true });

// Lightweight mutation observer
const observer = new MutationObserver(function(mutations) {
    setTimeout(handleTextSelection, 100);
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Enhanced selection handler with Google Workspace support
function enhancedSelectionHandler() {
    // Validate extension context before processing
    if (!chrome || !chrome.runtime) {
        console.warn('Extension context invalidated, ignoring enhanced selection handler');
        return;
    }
    
    // Check if browser selection is blocked
    if (settings.blockBrowserSelection) {
        // Prevent default browser selection behavior
        document.addEventListener('selectstart', function(e) {
            if (settings.blockBrowserSelection) {
                e.preventDefault();
                return false;
            }
        }, { passive: false });
        
        // Override getSelection to provide custom selection
        const originalGetSelection = window.getSelection;
        window.getSelection = function() {
            const selection = originalGetSelection.call(window);
            if (settings.blockBrowserSelection && selection.toString().trim().length > 0) {
                // Apply custom styling to selected text
                const range = selection.getRangeAt(0);
                const selectedNodes = getSelectedNodes(range);
                
                selectedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        node.classList.add('extension-selection');
                    }
                });
            }
            return selection;
        };
    }
    
    // Note: Google Workspace support has been disabled to prevent loading issues
    // The extension now focuses on universal compatibility across all websites
}

// Enhanced selection visibility with safe DOM operations
function enhanceSelectionVisibility() {
    try {
        // Check if extension context is still valid
        if (!chrome || !chrome.runtime) {
            console.warn('Extension context invalidated, skipping selection enhancement');
            return;
        }
        
        // Additional validation for chrome APIs
        if (!chrome.storage || !chrome.storage.sync) {
            console.warn('Extension storage not available, skipping selection enhancement');
            return;
        }
        
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        
        const range = selection.getRangeAt(0);
        const selectedNodes = getSelectedNodes(range);
        
        // Store original styles and enhance visibility
        selectedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                try {
                    const computedStyle = window.getComputedStyle(node);
                    originalSelectionStyles.set(node, {
                        backgroundColor: computedStyle.backgroundColor,
                        color: computedStyle.color,
                        fontWeight: computedStyle.fontWeight
                    });
                    
                    // Enhanced selection styling
                    node.style.backgroundColor = '#fff3cd'; // Light yellow background
                    node.style.color = '#856404'; // Darker text for contrast
                    node.style.fontWeight = '600'; // Bold text
                    node.style.outline = '2px solid #ffc107'; // Orange outline
                    node.style.outlineOffset = '2px';
                } catch (nodeError) {
                    console.warn('Failed to enhance node styling:', nodeError);
                }
            }
        });
        
        isSelectionEnhanced = true;
    } catch (error) {
        console.warn('Failed to enhance selection visibility:', error);
    }
}

// Reset selection visibility with safe DOM operations
function resetSelectionVisibility() {
    try {
        // Check if extension context is still valid
        if (!chrome || !chrome.runtime) {
            console.warn('Extension context invalidated, skipping selection reset');
            return;
        }
        
        // Additional validation for chrome APIs
        if (!chrome.storage || !chrome.storage.sync) {
            console.warn('Extension storage not available, skipping selection reset');
            return;
        }
        
        originalSelectionStyles.forEach((originalStyle, node) => {
            try {
                if (node && node.style) {
                    node.style.backgroundColor = originalStyle.backgroundColor;
                    node.style.color = originalStyle.color;
                    node.style.fontWeight = originalStyle.fontWeight;
                    node.style.outline = '';
                    node.style.outlineOffset = '';
                }
            } catch (nodeError) {
                console.warn('Failed to reset node styling:', nodeError);
            }
        });
        
        originalSelectionStyles.clear();
        isSelectionEnhanced = false;
    } catch (error) {
        console.warn('Failed to reset selection visibility:', error);
    }
}

// Get all nodes within a selection range
function getSelectedNodes(range) {
    const nodes = [];
    const walker = document.createTreeWalker(
        range.commonAncestorContainer,
        NodeFilter.SHOW_ELEMENT,
        {
            acceptNode: function(node) {
                const nodeRange = document.createRange();
                nodeRange.selectNodeContents(node);
                
                if (range.intersectsNode(node)) {
                    return NodeFilter.FILTER_ACCEPT;
                }
                return NodeFilter.FILTER_REJECT;
            }
        }
    );
    
    let node;
    while (node = walker.nextNode()) {
        nodes.push(node);
    }
    
    return nodes;
}

// Note: Google Workspace support has been disabled to prevent loading issues
// The extension now focuses on universal compatibility across all websites

// Get AI answer
async function getAIAnswer(text) {
    if (isProcessing) return;
    
    // Enhanced text validation
    if (!text || text.trim().length === 0) {
        alert('Please select some text to get an AI answer.');
        return;
    }
    
    // Further validate text quality
    const cleanText = text.trim();
    if (cleanText.length < 3) {
        alert('Please select more text (minimum 3 characters).');
        return;
    }
    
    // Check for meaningful content
    const meaningfulContent = /[a-zA-Z\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\u0400-\u04FF]/.test(cleanText);
    if (!meaningfulContent && !/[0-9]/.test(cleanText)) {
        alert('Please select text with letters or numbers.');
        return;
    }
    
    currentSelection = cleanText;
    
    // Load API key from storage or file
    let apiKey = settings.apiKey;
    if (!apiKey) {
        // Check extension context before trying to get API key
        if (!chrome || !chrome.runtime || !chrome.runtime.sendMessage) {
            console.warn('Extension context invalidated, cannot get API key');
            alert('Extension context invalidated. Please reload the extension.');
            return;
        }
        
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
    
    // Add timeout for the API request (increased for unlimited answers)
    const timeout = settings.timeout || 120;  // 2 minutes for unlimited responses
    const requestTimeout = setTimeout(() => {
        if (isProcessing) {
            isProcessing = false;
            loading.style.display = 'none';
            error.style.display = 'block';
            error.textContent = `Request timeout after ${timeout} seconds. Please try again or increase the timeout in settings.`;
        }
    }, timeout * 1000);
    
    // Build detailed, comprehensive prompt for students
    let prompt = '';
    
    // Add custom prompt if provided, otherwise use enhanced approach
    if (settings.customPrompt && settings.customPrompt.trim()) {
        prompt += settings.customPrompt.trim() + '\n\n';
    } else {
        // Enhanced prompt for detailed, comprehensive answers
        prompt = `You are an expert AI assistant providing detailed, comprehensive answers for students.
        Answer the following question with the most thorough, informative, and educational response possible.
        
        REQUIREMENTS:
        - Provide EXTREMELY detailed and comprehensive explanations
        - Include multiple relevant examples, case studies, and practical applications
        - Explain concepts step-by-step with clear reasoning
        - Include relevant facts, statistics, and supporting evidence
        - Use proper formatting (bullet points, numbered lists, paragraphs) when appropriate
        - Ensure the answer is educational and informative
        - DO NOT provide one-sentence or overly simple answers
        - DO NOT skip important details or explanations
        - DO NOT provide introductions or conclusions - go straight to the answer
        - Focus on delivering complete, detailed information
        - MINIMUM 300 words required for comprehensive coverage
        
        QUESTION:
        "${cleanText}"
        
        DETAILED ANSWER (comprehensive, educational, and thorough):`;
    }
    
    // Add language preference if set
    if (settings.language && settings.language !== 'auto') {
        const languageMap = {
            'en': 'English', 'es': 'Spanish', 'fr': 'French', 'de': 'German',
            'it': 'Italian', 'pt': 'Portuguese', 'ru': 'Russian', 'zh': 'Chinese',
            'ja': 'Japanese', 'ko': 'Korean'
        };
        prompt += `\n\nRespond in ${languageMap[settings.language]}.`;
    }
    
    // Check extension context before sending message
    if (!chrome || !chrome.runtime || !chrome.runtime.sendMessage) {
        console.warn('Extension context invalidated, cannot send message to background');
        isProcessing = false;
        loading.style.display = 'none';
        error.style.display = 'block';
        error.textContent = 'Extension context invalidated. Please reload the extension.';
        return;
    }
    
    // Additional context validation
    if (!chrome.storage || !chrome.storage.sync) {
        console.warn('Extension storage not available, context may be invalidated');
        isProcessing = false;
        loading.style.display = 'none';
        error.style.display = 'block';
        error.textContent = 'Extension storage not available. Please reload the extension.';
        return;
    }
    
    chrome.runtime.sendMessage({
        action: 'getAnswer',
        text: currentSelection,
        prompt: prompt,
        model: settings.model || 'amazon/nova-2-lite-v1:free',
        temperature: settings.temperature || 0.8,  // Slightly higher for more creativity
        maxTokens: settings.maxTokens || 4000      // Increased tokens for detailed responses
    }, function(response) {
        clearTimeout(requestTimeout);
        isProcessing = false;
        
        if (response && response.success) {
            loading.style.display = 'none';
            answerContainer.style.display = 'block';
            answer.style.display = 'block';
            
            // Enhanced response validation for detailed answers
            const answerText = response.answer || '';
            if (!answerText || answerText.trim().length === 0) {
                error.style.display = 'block';
                error.innerHTML = `
                    <strong>Empty Response Received</strong><br>
                    The AI returned an empty response. This can happen with:
                    <ul style="margin-top: 8px; margin-left: 20px;">
                        <li>Non-question text (try rephrasing as a question)</li>
                        <li>Text that's too short or vague</li>
                        <li>Technical issues with the AI service</li>
                    </ul>
                    <div style="margin-top: 10px;">
                        <strong>Suggestions:</strong>
                        <ul style="margin-top: 8px; margin-left: 20px;">
                            <li>Try selecting more text or rephrasing your selection</li>
                            <li>Add a question mark or question word (what, why, how)</li>
                            <li>Wait a moment and try again</li>
                        </ul>
                    </div>
                `;
                answerContainer.style.display = 'none';
                return;
            }
            
            // Check if answer is too short (likely not detailed enough)
            const wordCount = answerText.trim().split(/\s+/).length;
            if (wordCount < 100) {
                // Try to get a more detailed response by adjusting the prompt
                const enhancedPrompt = `${prompt}\n\nIMPORTANT: This response is too short. Please provide a MUCH more detailed and comprehensive response. Include multiple examples, thorough explanations, and extensive details. Minimum 500 words required.`;
                
                // Make another request with enhanced prompt
                chrome.runtime.sendMessage({
                    action: 'getAnswer',
                    text: currentSelection,
                    prompt: enhancedPrompt,
                    model: settings.model || 'amazon/nova-2-lite-v1:free',
                    temperature: Math.min((settings.temperature || 0.8) + 0.2, 1.0), // Slightly higher temperature for more detail
                    maxTokens: settings.maxTokens || 5000  // Even more tokens for enhanced detail
                }, function(enhancedResponse) {
                    if (enhancedResponse && enhancedResponse.success) {
                        const enhancedAnswerText = enhancedResponse.answer || '';
                        const enhancedWordCount = enhancedAnswerText.trim().split(/\s+/).length;
                        
                        // Only use enhanced answer if it's significantly more detailed
                        if (enhancedWordCount > wordCount * 2) {
                            const cleanAnswer = enhancedAnswerText.replace(/^\s*[\r\n]+/gm, '\n').trim();
                            answer.textContent = cleanAnswer;
                            
                            // Show enhancement notice
                            const enhancementNotice = document.createElement('div');
                            enhancementNotice.style.cssText = `
                                background: #e7f3ff;
                                border: 1px solid #b3d9ff;
                                color: #0c5bab;
                                padding: 8px 12px;
                                border-radius: 8px;
                                margin-bottom: 15px;
                                font-size: 13px;
                            `;
                            enhancementNotice.textContent = 'Enhanced: Provided more detailed response';
                            answerContainer.insertBefore(enhancementNotice, answer);
                            
                            // Remove notice after 3 seconds
                            setTimeout(() => {
                                if (enhancementNotice.parentNode) {
                                    enhancementNotice.parentNode.removeChild(enhancementNotice);
                                }
                            }, 3000);
                        } else {
                            const cleanAnswer = answerText.replace(/^\s*[\r\n]+/gm, '\n').trim();
                            answer.textContent = cleanAnswer;
                        }
                    } else {
                        const cleanAnswer = answerText.replace(/^\s*[\r\n]+/gm, '\n').trim();
                        answer.textContent = cleanAnswer;
                    }
                    
                    // Play sound if enabled
                    if (settings.enableSounds) {
                        playNotificationSound();
                    }
                });
                return;
            }
            
            // Clean and display answer
            const cleanAnswer = answerText.replace(/^\s*[\r\n]+/gm, '\n').trim();
            answer.textContent = cleanAnswer;
            
            // Play sound if enabled
            if (settings.enableSounds) {
                playNotificationSound();
            }
        } else {
            loading.style.display = 'none';
            error.style.display = 'block';
            const errorMessage = response && response.error
                ? response.error
                : 'Failed to get answer. Please check your API key, internet connection, and try again.';
            error.innerHTML = `
                <strong>Request Failed</strong><br>
                ${errorMessage}
                <div style="margin-top: 10px; font-size: 12px; color: #495057;">
                    Tip: If this happens frequently, try switching to NVIDIA NIM API in settings for better reliability.
                </div>
            `;
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
        // Validate extension context before sending message
        if (!chrome || !chrome.runtime || !chrome.runtime.sendMessage) {
            console.warn('Extension context invalidated, cannot get API key from background');
            return null;
        }
        
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
    // Check extension context before processing
    if (!chrome || !chrome.runtime) {
        console.warn('Extension context invalidated, ignoring keyboard shortcut');
        return;
    }
    
    // Additional validation for chrome APIs
    if (!chrome.storage || !chrome.storage.sync || !chrome.runtime.sendMessage) {
        console.warn('Extension APIs not available, ignoring keyboard shortcut');
        return;
    }
    
    // Toggle selection enhancement with Ctrl+Shift+E
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        
        // Check if extension context is valid before accessing chrome API
        if (!chrome || !chrome.storage || !chrome.storage.sync) {
            console.warn('Extension context invalidated, cannot toggle selection enhancement');
            return;
        }
        
        settings.enableSelectionEnhancement = !settings.enableSelectionEnhancement;
        
        // Show toggle status
        const status = settings.enableSelectionEnhancement ? 'ON' : 'OFF';
        const color = settings.enableSelectionEnhancement ? '#28a745' : '#dc3545';
        
        let indicator = document.getElementById('enhancement-status-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'enhancement-status-indicator';
            indicator.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                background: ${color};
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: bold;
                z-index: 99999;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                transition: all 0.3s;
            `;
            document.body.appendChild(indicator);
        }
        
        indicator.style.background = color;
        indicator.textContent = `Selection Enhancement: ${status}`;
        
        if (settings.enableSelectionEnhancement) {
            // Apply enhancement to current selection if any
            const selection = window.getSelection();
            if (selection.toString().trim().length > 0) {
                enhanceSelectionVisibility();
            }
        } else {
            // Reset selection styling
            resetSelectionVisibility();
        }
        
        setTimeout(() => {
            if (indicator) {
                indicator.style.opacity = '0';
                setTimeout(() => indicator.remove(), 300);
            }
        }, 2000);
    }
    
    // Toggle browser selection blocking with Ctrl+Shift+S
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        
        // Check if extension context is valid before accessing chrome API
        if (!chrome || !chrome.storage || !chrome.storage.sync) {
            console.warn('Extension context invalidated, cannot toggle selection blocking');
            return;
        }
        
        settings.blockBrowserSelection = !settings.blockBrowserSelection;
        
        // Show toggle status
        const status = settings.blockBrowserSelection ? 'ON' : 'OFF';
        const color = settings.blockBrowserSelection ? '#dc3545' : '#28a745';
        
        let indicator = document.getElementById('selection-block-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'selection-block-indicator';
            indicator.style.cssText = `
                position: fixed;
                top: 10px;
                left: 10px;
                background: ${color};
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: bold;
                z-index: 99999;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                transition: all 0.3s;
            `;
            document.body.appendChild(indicator);
        }
        
        indicator.style.background = color;
        indicator.textContent = `Block Browser Selection: ${status}`;
        
        // Apply or remove selection blocking
        toggleSelectionBlocking(settings.blockBrowserSelection);
        
        setTimeout(() => {
            if (indicator) {
                indicator.style.opacity = '0';
                setTimeout(() => indicator.remove(), 300);
            }
        }, 2000);
    }
    
    // Original Ctrl+Shift+Q functionality
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

// Enhanced keyboard shortcuts for better student experience
document.addEventListener('keydown', function(e) {
    // Check extension context before processing
    if (!chrome || !chrome.runtime) {
        return;
    }
    
    // Copy answer with Ctrl+C when modal is open
    if (document.getElementById('answersai-modal') &&
        document.getElementById('answersai-modal').style.display === 'block') {
        if (e.ctrlKey && e.key.toLowerCase() === 'c') {
            e.preventDefault();
            copyAnswer();
            return;
        }
    }
    
    // Close modal with Escape key
    if (e.key === 'Escape') {
        const modal = document.getElementById('answersai-modal');
        if (modal && modal.style.display === 'block') {
            hideModal();
            return;
        }
    }
});

// Function to toggle browser selection blocking
function toggleSelectionBlocking(enabled) {
    // Validate extension context before modifying DOM
    if (!chrome || !chrome.runtime) {
        console.warn('Extension context invalidated, cannot toggle selection blocking');
        return;
    }
    
    if (enabled) {
        // Disable browser text selection
        document.addEventListener('selectstart', preventSelection, { passive: false });
        document.addEventListener('mousedown', preventSelection, { passive: false });
        document.addEventListener('mouseup', preventSelection, { passive: false });
        document.addEventListener('mousemove', preventSelection, { passive: false });
        
        // Add visual indicator that selection is blocked
        let blocker = document.getElementById('selection-blocker');
        if (!blocker) {
            blocker = document.createElement('div');
            blocker.id = 'selection-blocker';
            blocker.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(220, 53, 69, 0.05);
                pointer-events: none;
                z-index: 99998;
                border: 2px dashed rgba(220, 53, 69, 0.3);
                display: none;
            `;
            document.body.appendChild(blocker);
        }
        blocker.style.display = 'block';
        
        console.log('Browser selection blocking enabled');
    } else {
        // Re-enable browser text selection
        document.removeEventListener('selectstart', preventSelection);
        document.removeEventListener('mousedown', preventSelection);
        document.removeEventListener('mouseup', preventSelection);
        document.removeEventListener('mousemove', preventSelection);
        
        // Hide visual indicator
        let blocker = document.getElementById('selection-blocker');
        if (blocker) {
            blocker.style.display = 'none';
        }
        
        console.log('Browser selection blocking disabled');
    }
}

// Function to prevent browser selection
function preventSelection(e) {
    // Validate extension context before processing
    if (!chrome || !chrome.runtime) {
        console.warn('Extension context invalidated, cannot prevent selection');
        return true;
    }
    
    if (settings.blockBrowserSelection) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
    return true;
}

// Initialize text selection functionality
(function initializeTextSelection() {
    try {
        // Validate extension context before initialization
        if (!chrome || !chrome.runtime) {
            console.warn('Extension context invalidated, cannot initialize text selection');
            return;
        }
        
        console.log('Doulet AI Assistant content script loaded');
        
        // Create initial elements
        createAnswerButton();
        createAnswerModal();
        
        // Force initial check for any existing selection
        setTimeout(handleTextSelection, 100);
        
        // Add a fallback text selection handler that's always active
        document.addEventListener('selectionchange', function() {
            try {
                // Validate extension context before processing
                if (!chrome || !chrome.runtime) {
                    console.warn('Extension context invalidated, ignoring selection change');
                    return;
                }
                
                // Small delay to ensure selection is complete
                setTimeout(handleTextSelection, 50);
            } catch (error) {
                console.error('Error in selectionchange handler:', error);
            }
        });
        
        // Add additional mouseup listener for better compatibility
        document.addEventListener('mouseup', function(e) {
            // Validate extension context before processing
            if (!chrome || !chrome.runtime) {
                console.warn('Extension context invalidated, ignoring mouseup');
                return;
            }
            
            // Small delay to ensure selection is complete
            setTimeout(handleTextSelection, 10);
        }, { passive: true });
        
    } catch (error) {
        console.error('Error initializing text selection:', error);
    }
})();

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

// Initialize selection blocking state
if (settings.blockBrowserSelection) {
    toggleSelectionBlocking(true);
}