// Phantom Wallet Integration - Simple and Reliable
console.log('Phantom Wallet Script Loading...');

// Global state
window.phantomWallet = {
    isConnected: false,
    publicKey: null,
    provider: null
};

// Wait for Phantom to inject
const waitForPhantom = () => {
    return new Promise((resolve) => {
        if (window.solana?.isPhantom) {
            resolve(window.solana);
        } else if (window.phantom?.solana?.isPhantom) {
            resolve(window.phantom.solana);
        } else {
            // Wait up to 3 seconds for Phantom to inject
            let attempts = 0;
            const interval = setInterval(() => {
                attempts++;
                
                if (window.solana?.isPhantom) {
                    clearInterval(interval);
                    resolve(window.solana);
                } else if (window.phantom?.solana?.isPhantom) {
                    clearInterval(interval);
                    resolve(window.phantom.solana);
                } else if (attempts >= 30) { // 3 seconds
                    clearInterval(interval);
                    resolve(null);
                }
            }, 100);
        }
    });
};

// Connect function
async function connectPhantom() {
    console.log('Connect Phantom called');
    
    try {
        // Wait for provider
        const provider = await waitForPhantom();
        
        if (!provider) {
            console.error('Phantom not found after waiting');
            alert('Phantom wallet not found!\n\nPlease install Phantom from phantom.app');
            window.open('https://phantom.app/', '_blank');
            return null;
        }
        
        console.log('Provider found:', provider);
        
        // Request connection
        const resp = await provider.connect();
        console.log('Connected:', resp.publicKey.toString());
        
        // Store state
        window.phantomWallet.isConnected = true;
        window.phantomWallet.publicKey = resp.publicKey.toString();
        window.phantomWallet.provider = provider;
        
        // Update button
        updatePhantomButton();
        
        // Listen for disconnect
        provider.on('disconnect', () => {
            console.log('Wallet disconnected');
            window.phantomWallet.isConnected = false;
            window.phantomWallet.publicKey = null;
            updatePhantomButton();
        });
        
        // Listen for account change
        provider.on('accountChanged', (publicKey) => {
            if (publicKey) {
                console.log('Account changed:', publicKey.toString());
                window.phantomWallet.publicKey = publicKey.toString();
                updatePhantomButton();
            } else {
                // Account disconnected
                window.phantomWallet.isConnected = false;
                window.phantomWallet.publicKey = null;
                updatePhantomButton();
            }
        });
        
        return resp.publicKey.toString();
        
    } catch (err) {
        console.error('Connection error:', err);
        
        if (err.code === 4001) {
            console.log('User rejected the request');
        } else if (err.code === -32002) {
            alert('Please unlock your Phantom wallet and try again');
        } else {
            alert('Failed to connect: ' + err.message);
        }
        
        return null;
    }
}

// Disconnect function
async function disconnectPhantom() {
    if (window.phantomWallet.provider) {
        await window.phantomWallet.provider.disconnect();
        window.phantomWallet.isConnected = false;
        window.phantomWallet.publicKey = null;
        window.phantomWallet.provider = null;
        updatePhantomButton();
    }
}

// Update button UI
function updatePhantomButton() {
    const btn = document.getElementById('wallet-connect-nav');
    if (!btn) return;
    
    if (window.phantomWallet.isConnected && window.phantomWallet.publicKey) {
        const short = window.phantomWallet.publicKey.slice(0, 4) + '...' + window.phantomWallet.publicKey.slice(-4);
        btn.innerHTML = `<span class="cart-text">${short}</span>`;
        btn.style.background = 'linear-gradient(135deg, #9945FF, #14F195)';
    } else {
        btn.innerHTML = `<span class="cart-text">Connect Wallet</span>`;
        btn.style.background = '';
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPhantom);
} else {
    initPhantom();
}

function initPhantom() {
    console.log('Initializing Phantom wallet button...');
    
    const btn = document.getElementById('wallet-connect-nav');
    if (!btn) {
        console.error('Wallet button not found!');
        return;
    }
    
    // Clear any existing handlers
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    
    // Add click handler
    newBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('Wallet button clicked');
        
        if (window.phantomWallet.isConnected) {
            if (confirm('Disconnect wallet?')) {
                await disconnectPhantom();
            }
        } else {
            await connectPhantom();
        }
    });
    
    console.log('Phantom wallet button initialized');
    
    // Try auto-connect
    setTimeout(async () => {
        const provider = await waitForPhantom();
        if (provider?.isConnected) {
            try {
                const resp = await provider.connect({ onlyIfTrusted: true });
                window.phantomWallet.isConnected = true;
                window.phantomWallet.publicKey = resp.publicKey.toString();
                window.phantomWallet.provider = provider;
                updatePhantomButton();
                console.log('Auto-connected to wallet');
            } catch (err) {
                console.log('Auto-connect not available');
            }
        }
    }, 500);
}

// Expose functions globally
window.connectPhantom = connectPhantom;
window.disconnectPhantom = disconnectPhantom;

console.log('Phantom Wallet Script Loaded');