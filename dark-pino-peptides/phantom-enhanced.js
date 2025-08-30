// Enhanced Phantom Wallet Detection and Connection
console.log('🟣 Enhanced Phantom Wallet Script Loading...');

// Global Phantom state
window.phantomWallet = {
    provider: null,
    publicKey: null,
    isConnected: false
};

// Enhanced detection with multiple strategies
async function detectPhantomEnhanced() {
    console.log('Starting enhanced Phantom detection...');
    
    // Strategy 1: Direct check
    if (window.phantom?.solana?.isPhantom) {
        console.log('✅ Found Phantom at window.phantom.solana (direct)');
        return window.phantom.solana;
    }
    
    // Strategy 2: Solana object check
    if (window.solana?.isPhantom) {
        console.log('✅ Found Phantom at window.solana');
        return window.solana;
    }
    
    // Strategy 3: Wait for injection with timeout
    console.log('Waiting for Phantom injection...');
    const maxAttempts = 50;
    
    for (let i = 0; i < maxAttempts; i++) {
        // Check both locations
        if (window.phantom?.solana?.isPhantom) {
            console.log(`✅ Phantom appeared at window.phantom.solana after ${i * 100}ms`);
            return window.phantom.solana;
        }
        
        if (window.solana?.isPhantom) {
            console.log(`✅ Phantom appeared at window.solana after ${i * 100}ms`);
            return window.solana;
        }
        
        // Wait 100ms before next check
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Strategy 4: Force wake Phantom by accessing properties
    console.log('Attempting to wake Phantom...');
    try {
        // Try to access phantom properties to wake it
        const phantomCheck = window.phantom;
        if (phantomCheck && phantomCheck.solana) {
            console.log('✅ Phantom woken up via property access');
            return phantomCheck.solana;
        }
    } catch (e) {
        console.log('Could not wake Phantom:', e);
    }
    
    console.log('❌ Phantom not detected after all strategies');
    return null;
}

// Connect with better error handling
async function connectPhantomEnhanced() {
    try {
        console.log('=== PHANTOM CONNECTION PROCESS ===');
        
        // Update button to show loading
        updateButtonState('Connecting...', false);
        
        // Detect Phantom with enhanced method
        const provider = await detectPhantomEnhanced();
        
        if (!provider) {
            // Provide detailed help
            const helpMessage = `
Phantom wallet not detected!

Please follow these steps:
1. Make sure Phantom extension is installed
2. Click the Phantom extension icon in your browser
3. Make sure Phantom is unlocked
4. Refresh this page (Cmd/Ctrl + R)
5. Try again

If you have other wallet extensions:
- Try disabling them temporarily
- MetaMask especially can block Phantom

Need help activating Phantom?
Click OK to open the Phantom activation helper.`;
            
            if (confirm(helpMessage)) {
                // Open activation helper in new tab
                window.open('phantom-activate.html', '_blank');
            }
            updateButtonState('Connect Wallet', false);
            
            // Log detailed diagnostics
            console.log('=== PHANTOM DETECTION FAILED ===');
            console.log('Diagnostics:');
            console.log('- window.phantom:', window.phantom);
            console.log('- window.solana:', window.solana);
            console.log('- window.ethereum:', window.ethereum);
            console.log('- All window keys with "phantom":', 
                Object.keys(window).filter(k => k.toLowerCase().includes('phantom'))
            );
            console.log('- All window keys with "solana":', 
                Object.keys(window).filter(k => k.toLowerCase().includes('solana'))
            );
            
            return null;
        }
        
        // Connect to Phantom
        console.log('Provider found, requesting connection...');
        const response = await provider.connect();
        
        // Save connection state
        window.phantomWallet.provider = provider;
        window.phantomWallet.publicKey = response.publicKey.toString();
        window.phantomWallet.isConnected = true;
        
        console.log('✅ Connected successfully:', window.phantomWallet.publicKey);
        
        // Update UI
        const shortAddress = window.phantomWallet.publicKey.slice(0, 4) + '...' + 
                           window.phantomWallet.publicKey.slice(-4);
        updateButtonState(shortAddress, true);
        
        // Show success
        if (window.showNotification) {
            window.showNotification('Phantom wallet connected!', 'success');
        }
        
        // Setup event listeners
        setupPhantomListeners(provider);
        
        return window.phantomWallet.publicKey;
        
    } catch (error) {
        console.error('Connection error:', error);
        
        if (error.code === 4001) {
            console.log('User rejected connection');
            if (window.showNotification) {
                window.showNotification('Connection cancelled', 'error');
            }
        } else if (error.code === -32002) {
            alert('Please unlock your Phantom wallet and try again');
        } else {
            alert('Connection failed: ' + error.message);
        }
        
        updateButtonState('Connect Wallet', false);
        return null;
    }
}

// Setup event listeners for Phantom
function setupPhantomListeners(provider) {
    // Remove old listeners
    provider.removeAllListeners();
    
    // Listen for disconnect
    provider.on('disconnect', () => {
        console.log('Phantom disconnected');
        disconnectPhantomEnhanced();
    });
    
    // Listen for account change
    provider.on('accountChanged', (publicKey) => {
        if (publicKey) {
            console.log('Account changed:', publicKey.toString());
            window.phantomWallet.publicKey = publicKey.toString();
            const shortAddress = publicKey.toString().slice(0, 4) + '...' + 
                               publicKey.toString().slice(-4);
            updateButtonState(shortAddress, true);
        } else {
            disconnectPhantomEnhanced();
        }
    });
}

// Disconnect function
function disconnectPhantomEnhanced() {
    if (window.phantomWallet.provider) {
        try {
            window.phantomWallet.provider.disconnect();
        } catch (e) {
            console.error('Disconnect error:', e);
        }
    }
    
    window.phantomWallet.provider = null;
    window.phantomWallet.publicKey = null;
    window.phantomWallet.isConnected = false;
    
    updateButtonState('Connect Wallet', false);
    
    if (window.showNotification) {
        window.showNotification('Wallet disconnected', 'info');
    }
}

// Update button UI state
function updateButtonState(text, isConnected) {
    const btn = document.getElementById('wallet-connect-nav');
    if (!btn) return;
    
    btn.innerHTML = `<span class="cart-text">${text}</span>`;
    
    if (isConnected) {
        btn.style.background = 'linear-gradient(135deg, #9945FF, #14F195)';
        btn.style.color = 'white';
        btn.style.border = 'none';
    } else {
        btn.style.background = '';
        btn.style.color = '';
        btn.style.border = '';
    }
}

// Initialize button with enhanced event handling
function initPhantomButtonEnhanced() {
    console.log('Initializing enhanced Phantom button...');
    
    // Wait for button to exist
    const waitForButton = setInterval(() => {
        const btn = document.getElementById('wallet-connect-nav');
        if (btn) {
            clearInterval(waitForButton);
            
            // Remove ALL existing listeners by replacing the button
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            // Add single click handler
            newBtn.addEventListener('click', async function(e) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                
                console.log('Wallet button clicked');
                
                if (window.phantomWallet.isConnected) {
                    // Offer to disconnect
                    if (confirm('Disconnect from Phantom?')) {
                        disconnectPhantomEnhanced();
                    }
                } else {
                    // Connect to Phantom
                    await connectPhantomEnhanced();
                }
                
                return false;
            });
            
            console.log('✅ Enhanced Phantom button initialized');
            
            // Try auto-reconnect
            attemptAutoReconnect();
        }
    }, 100);
}

// Auto-reconnect if previously connected
async function attemptAutoReconnect() {
    setTimeout(async () => {
        const provider = await detectPhantomEnhanced();
        if (provider && provider.isConnected) {
            try {
                const response = await provider.connect({ onlyIfTrusted: true });
                window.phantomWallet.provider = provider;
                window.phantomWallet.publicKey = response.publicKey.toString();
                window.phantomWallet.isConnected = true;
                
                const shortAddress = response.publicKey.toString().slice(0, 4) + '...' + 
                                   response.publicKey.toString().slice(-4);
                updateButtonState(shortAddress, true);
                
                console.log('Auto-reconnected to Phantom');
            } catch (e) {
                // Auto-reconnect not available, that's ok
            }
        }
    }, 1500);
}

// Diagnostic function
window.phantomDiagnostics = async function() {
    console.log('=== PHANTOM DIAGNOSTICS ===');
    console.log('Time:', new Date().toISOString());
    
    // Check for Phantom
    console.log('\n1. Direct Checks:');
    console.log('- window.phantom:', window.phantom);
    console.log('- window.phantom?.solana:', window.phantom?.solana);
    console.log('- window.phantom?.solana?.isPhantom:', window.phantom?.solana?.isPhantom);
    console.log('- window.solana:', window.solana);
    console.log('- window.solana?.isPhantom:', window.solana?.isPhantom);
    
    // Check for other wallets
    console.log('\n2. Other Wallets (potential conflicts):');
    console.log('- MetaMask (window.ethereum):', !!window.ethereum);
    console.log('- Backpack:', !!window.backpack);
    console.log('- Solflare:', !!window.solflare);
    console.log('- Brave:', !!window.braveSolana);
    console.log('- Coin98:', !!window.coin98);
    
    // Window properties
    console.log('\n3. Related Window Properties:');
    const phantomKeys = Object.keys(window).filter(k => k.toLowerCase().includes('phantom'));
    const solanaKeys = Object.keys(window).filter(k => k.toLowerCase().includes('solana'));
    console.log('- Keys with "phantom":', phantomKeys);
    console.log('- Keys with "solana":', solanaKeys);
    
    // Try detection
    console.log('\n4. Running Enhanced Detection...');
    const provider = await detectPhantomEnhanced();
    console.log('- Detection result:', provider ? 'FOUND' : 'NOT FOUND');
    
    if (provider) {
        console.log('- Provider details:', {
            isPhantom: provider.isPhantom,
            isConnected: provider.isConnected,
            publicKey: provider.publicKey?.toString()
        });
    }
    
    console.log('\n=== END DIAGNOSTICS ===');
    return provider;
};

// Initialize on multiple events to ensure it runs
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPhantomButtonEnhanced);
} else {
    initPhantomButtonEnhanced();
}

// Backup initialization
window.addEventListener('load', () => {
    setTimeout(initPhantomButtonEnhanced, 100);
});

// Expose functions globally
window.connectPhantom = connectPhantomEnhanced;
window.disconnectPhantom = disconnectPhantomEnhanced;
window.getPhantomWallet = () => window.phantomWallet;

console.log('✅ Enhanced Phantom Script Ready');
console.log('Debug commands available:');
console.log('- window.phantomDiagnostics() - Run full diagnostics');
console.log('- window.connectPhantom() - Manually trigger connection');
console.log('- window.getPhantomWallet() - Check wallet state');