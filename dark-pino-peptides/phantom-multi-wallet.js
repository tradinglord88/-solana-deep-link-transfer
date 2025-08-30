// Phantom Wallet Connection - Multi-Wallet Compatible Version
console.log('Phantom Multi-Wallet Script Loading...');

// Global state
let phantomPublicKey = null;
let phantomProvider = null;

// Enhanced Phantom detection that works with multiple wallets
function getPhantomProvider() {
    // Method 1: Check window.phantom first (preferred)
    if ('phantom' in window) {
        const provider = window.phantom?.solana;
        if (provider?.isPhantom) {
            console.log('Found Phantom at window.phantom.solana');
            return provider;
        }
    }
    
    // Method 2: Check window.solana (might be overridden by other wallets)
    if ('solana' in window) {
        const provider = window.solana;
        if (provider?.isPhantom) {
            console.log('Found Phantom at window.solana');
            return provider;
        }
    }
    
    // Method 3: Check ethereum.providers array (when multiple wallets installed)
    if (window.ethereum?.providers?.length) {
        const provider = window.ethereum.providers.find(p => p.isPhantom);
        if (provider) {
            console.log('Found Phantom in ethereum.providers array');
            return provider;
        }
    }
    
    // Method 4: Check if solana exists but isn't MetaMask
    if (window.solana && !window.solana.isMetaMask) {
        console.log('Found Solana provider (possibly Phantom without flag)');
        return window.solana;
    }
    
    return null;
}

// Wait for wallets to inject (with multiple attempts)
async function waitForPhantom(maxAttempts = 30) {
    return new Promise((resolve) => {
        let attempts = 0;
        
        // Check immediately
        const provider = getPhantomProvider();
        if (provider) {
            resolve(provider);
            return;
        }
        
        // Keep checking every 100ms
        const interval = setInterval(() => {
            attempts++;
            const provider = getPhantomProvider();
            
            if (provider || attempts >= maxAttempts) {
                clearInterval(interval);
                resolve(provider);
            }
        }, 100);
    });
}

// Connect to Phantom Wallet
async function connectWallet() {
    try {
        console.log('Starting Phantom connection process...');
        
        // Wait for provider with extended timeout
        const provider = await waitForPhantom(50); // 5 seconds
        
        if (!provider) {
            console.error('Phantom not detected after waiting');
            
            // Check what wallets ARE available
            const availableWallets = [];
            if (window.ethereum) availableWallets.push('Ethereum wallet (possibly MetaMask)');
            if (window.solflare) availableWallets.push('Solflare');
            if (window.backpack) availableWallets.push('Backpack');
            
            const message = availableWallets.length > 0 
                ? `Phantom not found. Detected: ${availableWallets.join(', ')}. Please make sure Phantom is installed and enabled.`
                : 'No wallet extensions detected. Please install Phantom from phantom.app';
            
            alert(message);
            
            if (confirm('Open Phantom website?')) {
                window.open('https://phantom.app/', '_blank');
            }
            return null;
        }
        
        console.log('Provider found, requesting connection...');
        
        // Request connection to Phantom
        const response = await provider.connect();
        phantomPublicKey = response.publicKey.toString();
        phantomProvider = provider;
        
        console.log('Connected:', phantomPublicKey);
        
        // Update button UI
        updateWalletButton(phantomPublicKey);
        
        // Show success notification
        if (window.showNotification) {
            window.showNotification('Wallet connected successfully!', 'success');
        }
        
        // Set up event listeners
        provider.on('disconnect', () => {
            console.log('Wallet disconnected');
            phantomPublicKey = null;
            phantomProvider = null;
            updateWalletButton(null);
        });
        
        provider.on('accountChanged', (publicKey) => {
            if (publicKey) {
                phantomPublicKey = publicKey.toString();
                updateWalletButton(phantomPublicKey);
            } else {
                phantomPublicKey = null;
                updateWalletButton(null);
            }
        });
        
        return phantomPublicKey;
        
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
            alert('Failed to connect: ' + error.message);
        }
        
        return null;
    }
}

// Disconnect wallet
async function disconnectWallet() {
    if (phantomProvider) {
        await phantomProvider.disconnect();
        phantomPublicKey = null;
        phantomProvider = null;
        updateWalletButton(null);
        if (window.showNotification) {
            window.showNotification('Wallet disconnected', 'info');
        }
    }
}

// Update wallet button UI
function updateWalletButton(address) {
    const btn = document.getElementById('wallet-connect-nav');
    if (!btn) return;
    
    if (address) {
        const short = address.slice(0, 4) + '...' + address.slice(-4);
        btn.innerHTML = `<span class="cart-text">${short}</span>`;
        btn.style.background = 'linear-gradient(135deg, #9945FF, #14F195)';
        btn.style.color = 'white';
    } else {
        btn.innerHTML = `<span class="cart-text">Connect Wallet</span>`;
        btn.style.background = '';
    }
}

// Initialize when DOM is ready
function initWalletButton() {
    console.log('Initializing wallet button...');
    
    const btn = document.getElementById('wallet-connect-nav');
    if (!btn) {
        console.error('Wallet button not found!');
        return;
    }
    
    // Remove existing listeners by cloning
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    
    // Add click handler
    newBtn.onclick = async function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('Wallet button clicked');
        
        if (phantomPublicKey) {
            if (confirm('Disconnect wallet?')) {
                await disconnectWallet();
            }
        } else {
            await connectWallet();
        }
    };
    
    console.log('Wallet button initialized');
    
    // Try auto-reconnect after a delay
    setTimeout(async () => {
        const provider = await waitForPhantom(10); // Wait 1 second
        if (provider && provider.isConnected) {
            try {
                const response = await provider.connect({ onlyIfTrusted: true });
                phantomPublicKey = response.publicKey.toString();
                phantomProvider = provider;
                updateWalletButton(phantomPublicKey);
                console.log('Auto-reconnected to wallet');
            } catch (err) {
                console.log('Auto-connect not available');
            }
        }
    }, 1000);
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWalletButton);
} else {
    initWalletButton();
}

// Also try on window load as backup
window.addEventListener('load', () => {
    setTimeout(() => {
        if (!document.getElementById('wallet-connect-nav').onclick) {
            console.log('Re-initializing wallet button on window load');
            initWalletButton();
        }
    }, 500);
});

// Expose functions globally
window.phantomPublicKey = () => phantomPublicKey;
window.connectPhantomWallet = connectWallet;
window.disconnectPhantomWallet = disconnectWallet;
window.getPhantomProvider = getPhantomProvider;

console.log('Phantom Multi-Wallet Script Loaded');