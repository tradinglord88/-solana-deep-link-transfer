// Phantom Wallet Connection with EIP-6963 Support and Fallbacks
console.log('🚀 Phantom EIP-6963 Enhanced Script Loading...');

// Global state
window.phantomWalletState = {
    provider: null,
    publicKey: null,
    isConnected: false,
    providers: new Map(), // Store all discovered providers
    phantomProvider: null
};

// EIP-6963 Provider Discovery
class WalletProviderDiscovery {
    constructor() {
        this.providers = new Map();
        this.phantomProvider = null;
        this.initializeDiscovery();
    }

    initializeDiscovery() {
        console.log('Initializing EIP-6963 provider discovery...');
        
        // Listen for EIP-6963 provider announcements
        window.addEventListener('eip6963:announceProvider', (event) => {
            const { detail } = event;
            if (detail?.info && detail?.provider) {
                console.log(`Provider announced: ${detail.info.name}`, detail.info);
                this.providers.set(detail.info.uuid, detail);
                
                // Check if this is Phantom
                if (detail.info.name?.toLowerCase().includes('phantom') || 
                    detail.provider.isPhantom) {
                    console.log('✅ Phantom detected via EIP-6963!');
                    this.phantomProvider = detail.provider;
                    window.phantomWalletState.phantomProvider = detail.provider;
                }
            }
        });

        // Request providers
        this.requestProviders();
    }

    requestProviders() {
        console.log('Requesting EIP-6963 providers...');
        window.dispatchEvent(new Event('eip6963:requestProvider'));
    }

    getPhantomProvider() {
        return this.phantomProvider;
    }

    getAllProviders() {
        return Array.from(this.providers.values());
    }
}

// Traditional provider detection (fallback)
function detectPhantomTraditional() {
    console.log('Attempting traditional Phantom detection...');
    
    // Method 1: window.phantom.solana
    if (window.phantom?.solana?.isPhantom) {
        console.log('Found Phantom at window.phantom.solana');
        return window.phantom.solana;
    }
    
    // Method 2: window.solana (if not overridden)
    if (window.solana?.isPhantom) {
        console.log('Found Phantom at window.solana');
        return window.solana;
    }
    
    // Method 3: Check window.solana without isPhantom flag
    if (window.solana && !window.solana.isMetaMask) {
        console.log('Found Solana provider (possibly Phantom)');
        // Additional check for Phantom-specific methods
        if (window.solana.connect && window.solana.disconnect) {
            return window.solana;
        }
    }
    
    // Method 4: Search through window object
    for (const key in window) {
        try {
            if (window[key]?.isPhantom && window[key]?.connect) {
                console.log(`Found Phantom at window.${key}`);
                return window[key];
            }
        } catch (e) {
            // Skip inaccessible properties
        }
    }
    
    return null;
}

// Comprehensive Phantom detection with retries
async function detectPhantomComprehensive(maxRetries = 50) {
    return new Promise((resolve) => {
        let attempts = 0;
        
        const checkForPhantom = () => {
            attempts++;
            
            // Try EIP-6963 first
            if (window.phantomWalletState.phantomProvider) {
                console.log('✅ Phantom found via EIP-6963');
                resolve(window.phantomWalletState.phantomProvider);
                return;
            }
            
            // Try traditional detection
            const traditionalProvider = detectPhantomTraditional();
            if (traditionalProvider) {
                console.log('✅ Phantom found via traditional method');
                resolve(traditionalProvider);
                return;
            }
            
            // Continue checking
            if (attempts < maxRetries) {
                setTimeout(checkForPhantom, 100);
            } else {
                console.log('❌ Phantom not found after comprehensive search');
                resolve(null);
            }
        };
        
        checkForPhantom();
    });
}

// Connect to Phantom
async function connectPhantom() {
    try {
        console.log('=== PHANTOM CONNECTION ATTEMPT ===');
        
        // Update button to show loading
        updateButton('Detecting...');
        
        // Initialize EIP-6963 discovery
        const discovery = new WalletProviderDiscovery();
        
        // Wait a bit for EIP-6963 responses
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Try comprehensive detection
        const provider = await detectPhantomComprehensive();
        
        if (!provider) {
            console.error('Phantom not detected');
            
            // Show helpful message
            const message = `
Phantom wallet not detected. This can happen when:

1. Phantom is not installed
2. Other wallet extensions are blocking it
3. Phantom needs to be refreshed

Solutions to try:
• Refresh this page (Ctrl+R / Cmd+R)
• Click the Phantom extension icon to wake it up
• Disable other wallet extensions temporarily
• Try in a new browser tab

Would you like to install Phantom?`;
            
            if (confirm(message)) {
                window.open('https://phantom.app/', '_blank');
            }
            
            updateButton('Connect Wallet');
            return null;
        }
        
        // Connect to Phantom
        console.log('Connecting to Phantom...');
        const response = await provider.connect();
        
        // Save state
        window.phantomWalletState.provider = provider;
        window.phantomWalletState.publicKey = response.publicKey.toString();
        window.phantomWalletState.isConnected = true;
        
        console.log('✅ Connected:', window.phantomWalletState.publicKey);
        
        // Update UI
        const short = window.phantomWalletState.publicKey.slice(0, 4) + '...' + 
                     window.phantomWalletState.publicKey.slice(-4);
        updateButton(short, true);
        
        // Show success
        if (window.showNotification) {
            window.showNotification('Phantom connected!', 'success');
        }
        
        // Set up event listeners
        provider.on('disconnect', () => {
            console.log('Wallet disconnected');
            disconnectPhantom();
        });
        
        provider.on('accountChanged', (publicKey) => {
            if (publicKey) {
                window.phantomWalletState.publicKey = publicKey.toString();
                const short = publicKey.toString().slice(0, 4) + '...' + 
                             publicKey.toString().slice(-4);
                updateButton(short, true);
            } else {
                disconnectPhantom();
            }
        });
        
        return window.phantomWalletState.publicKey;
        
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
            alert(`Connection failed: ${error.message}`);
        }
        
        updateButton('Connect Wallet');
        return null;
    }
}

// Disconnect
function disconnectPhantom() {
    if (window.phantomWalletState.provider) {
        try {
            window.phantomWalletState.provider.disconnect();
        } catch (e) {
            console.log('Disconnect error:', e);
        }
    }
    
    window.phantomWalletState.provider = null;
    window.phantomWalletState.publicKey = null;
    window.phantomWalletState.isConnected = false;
    
    updateButton('Connect Wallet');
    
    if (window.showNotification) {
        window.showNotification('Disconnected', 'info');
    }
}

// Update button UI
function updateButton(text, connected = false) {
    const btn = document.getElementById('wallet-connect-nav');
    if (!btn) return;
    
    btn.innerHTML = `<span class="cart-text">${text}</span>`;
    
    if (connected) {
        btn.style.background = 'linear-gradient(135deg, #9945FF, #14F195)';
        btn.style.color = 'white';
    } else {
        btn.style.background = '';
    }
}

// Initialize button
function initButton() {
    console.log('Initializing wallet button...');
    
    const btn = document.getElementById('wallet-connect-nav');
    if (!btn) {
        console.log('Button not found, retrying...');
        setTimeout(initButton, 500);
        return;
    }
    
    // Remove old handlers
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    
    // Add click handler
    newBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('Wallet button clicked');
        
        if (window.phantomWalletState.isConnected) {
            if (confirm('Disconnect wallet?')) {
                disconnectPhantom();
            }
        } else {
            await connectPhantom();
        }
    });
    
    console.log('✅ Wallet button ready');
    
    // Try auto-connect after a delay
    setTimeout(async () => {
        const provider = await detectPhantomComprehensive(10);
        if (provider?.isConnected) {
            try {
                const response = await provider.connect({ onlyIfTrusted: true });
                window.phantomWalletState.provider = provider;
                window.phantomWalletState.publicKey = response.publicKey.toString();
                window.phantomWalletState.isConnected = true;
                const short = response.publicKey.toString().slice(0, 4) + '...' + 
                             response.publicKey.toString().slice(-4);
                updateButton(short, true);
                console.log('Auto-connected to Phantom');
            } catch (e) {
                console.log('Auto-connect not available');
            }
        }
    }, 1500);
}

// Initialize on multiple events for reliability
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initButton);
} else {
    initButton();
}

// Backup initialization
window.addEventListener('load', () => {
    setTimeout(initButton, 100);
});

// Manual test function
window.testPhantomConnection = async function() {
    console.log('=== MANUAL PHANTOM TEST ===');
    console.log('1. Checking window.phantom:', window.phantom);
    console.log('2. Checking window.solana:', window.solana);
    console.log('3. Running comprehensive detection...');
    const provider = await detectPhantomComprehensive(20);
    if (provider) {
        console.log('✅ Provider found!');
        try {
            const resp = await provider.connect();
            console.log('✅ Connected:', resp.publicKey.toString());
        } catch (e) {
            console.error('❌ Connection failed:', e);
        }
    } else {
        console.log('❌ No provider found');
        console.log('Available window properties:', 
            Object.keys(window).filter(k => 
                k.toLowerCase().includes('phantom') || 
                k.toLowerCase().includes('solana')
            )
        );
    }
};

// Expose functions globally
window.connectPhantom = connectPhantom;
window.disconnectPhantom = disconnectPhantom;
window.phantomPublicKey = () => window.phantomWalletState.publicKey;

console.log('✅ Phantom EIP-6963 Enhanced Script Ready');
console.log('Use window.testPhantomConnection() to debug');