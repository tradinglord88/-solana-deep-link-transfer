// Simple Phantom Wallet Connection Script
console.log('Wallet Connect Script Loaded');

// Global wallet state
window.walletState = {
    isConnected: false,
    address: null,
    provider: null
};

// Check if Phantom is installed
function isPhantomInstalled() {
    const { solana } = window;
    return solana?.isPhantom;
}

// Get provider
function getProvider() {
    if ('phantom' in window) {
        const provider = window.phantom?.solana;
        if (provider?.isPhantom) {
            return provider;
        }
    }
    
    const { solana } = window;
    if (solana?.isPhantom) {
        return solana;
    }
    
    return null;
}

// Connect wallet function
async function connectWallet() {
    try {
        const provider = getProvider();
        
        if (!provider) {
            console.log('Phantom wallet not found!');
            alert('Please install Phantom wallet extension from phantom.app');
            window.open('https://phantom.app/', '_blank');
            return;
        }
        
        // Request connection
        console.log('Requesting wallet connection...');
        const response = await provider.connect();
        
        // Store wallet info
        window.walletState.isConnected = true;
        window.walletState.address = response.publicKey.toString();
        window.walletState.provider = provider;
        
        // Update UI
        updateWalletButton();
        
        // Show success
        if (window.showNotification) {
            window.showNotification('Wallet connected!', 'success');
        } else {
            alert('Wallet connected: ' + window.walletState.address);
        }
        
        // Listen for disconnect
        provider.on('disconnect', () => {
            console.log('Wallet disconnected');
            disconnectWallet();
        });
        
        // Listen for account change
        provider.on('accountChanged', (publicKey) => {
            if (publicKey) {
                window.walletState.address = publicKey.toString();
                updateWalletButton();
            } else {
                disconnectWallet();
            }
        });
        
        return response.publicKey.toString();
        
    } catch (error) {
        console.error('Connection failed:', error);
        
        if (error.code === 4001) {
            console.log('User rejected connection');
        } else if (error.code === -32002) {
            alert('Please unlock your Phantom wallet first');
        } else {
            alert('Failed to connect wallet. Check console for details.');
        }
    }
}

// Disconnect wallet
function disconnectWallet() {
    if (window.walletState.provider) {
        window.walletState.provider.disconnect();
    }
    
    window.walletState.isConnected = false;
    window.walletState.address = null;
    window.walletState.provider = null;
    
    updateWalletButton();
    
    if (window.showNotification) {
        window.showNotification('Wallet disconnected', 'info');
    }
}

// Update wallet button UI
function updateWalletButton() {
    const button = document.getElementById('wallet-connect-nav');
    if (!button) return;
    
    if (window.walletState.isConnected && window.walletState.address) {
        // Show connected state
        const shortAddress = window.walletState.address.slice(0, 6) + '...' + window.walletState.address.slice(-4);
        button.innerHTML = `<span class="cart-text">${shortAddress}</span>`;
        button.classList.add('connected');
    } else {
        // Show disconnected state
        button.innerHTML = `<span class="cart-text">Connect Wallet</span>`;
        button.classList.remove('connected');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing wallet button...');
    
    const walletButton = document.getElementById('wallet-connect-nav');
    if (walletButton) {
        console.log('Wallet button found, adding click handler');
        
        // Remove any existing onclick
        walletButton.onclick = null;
        
        // Add new click handler
        walletButton.addEventListener('click', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Wallet button clicked');
            
            if (window.walletState.isConnected) {
                // If connected, ask to disconnect
                if (confirm('Disconnect wallet?')) {
                    disconnectWallet();
                }
            } else {
                // Connect wallet
                await connectWallet();
            }
        });
    } else {
        console.error('Wallet button not found!');
    }
    
    // Check if Phantom is pre-connected (auto-connect)
    setTimeout(async () => {
        const provider = getProvider();
        if (provider?.isConnected) {
            try {
                const response = await provider.connect({ onlyIfTrusted: true });
                window.walletState.isConnected = true;
                window.walletState.address = response.publicKey.toString();
                window.walletState.provider = provider;
                updateWalletButton();
                console.log('Auto-connected to wallet:', window.walletState.address);
            } catch (error) {
                console.log('Auto-connect not available');
            }
        }
    }, 100);
});

// Also try to initialize on window load (backup)
window.addEventListener('load', function() {
    console.log('Window loaded');
    
    // Check Phantom availability
    if (isPhantomInstalled()) {
        console.log('✅ Phantom is installed');
    } else {
        console.log('❌ Phantom not detected');
        console.log('Available window properties:', Object.keys(window).filter(k => 
            k.toLowerCase().includes('phantom') || k.toLowerCase().includes('solana')
        ));
    }
});

// Export functions globally
window.connectWallet = connectWallet;
window.disconnectWallet = disconnectWallet;
window.getProvider = getProvider;