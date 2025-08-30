// Simplified Phantom Wallet Connection - Based on Working Example
console.log('Phantom Simple Script Loading...');

// Global state
let phantomPublicKey = null;

// Connect to Phantom Wallet
async function connectWallet() {
    try {
        const { solana } = window;
        
        if (!solana || !solana.isPhantom) {
            console.error('Phantom wallet not detected');
            alert('Phantom wallet extension not detected. Please install it from phantom.app');
            window.open('https://phantom.app/', '_blank');
            return null;
        }

        console.log('Phantom detected, requesting connection...');
        
        // Request connection to Phantom - This should trigger the popup
        const response = await solana.connect();
        phantomPublicKey = response.publicKey.toString();
        
        console.log('Connected:', phantomPublicKey);
        
        // Update button UI
        updateWalletButton(phantomPublicKey);
        
        // Show success notification
        if (window.showNotification) {
            window.showNotification('Wallet connected successfully!', 'success');
        }
        
        // Listen for disconnect
        solana.on('disconnect', () => {
            console.log('Wallet disconnected');
            phantomPublicKey = null;
            updateWalletButton(null);
        });
        
        // Listen for account change
        solana.on('accountChanged', (publicKey) => {
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
        } else {
            alert('Failed to connect wallet: ' + error.message);
        }
        
        return null;
    }
}

// Disconnect wallet
async function disconnectWallet() {
    const { solana } = window;
    if (solana) {
        await solana.disconnect();
        phantomPublicKey = null;
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
        // Show connected state with shortened address
        const short = address.slice(0, 4) + '...' + address.slice(-4);
        btn.innerHTML = `<span class="cart-text">${short}</span>`;
        btn.style.background = 'linear-gradient(135deg, #9945FF, #14F195)';
        btn.style.color = 'white';
    } else {
        // Show disconnected state
        btn.innerHTML = `<span class="cart-text">Connect Wallet</span>`;
        btn.style.background = '';
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, setting up wallet button...');
    
    const btn = document.getElementById('wallet-connect-nav');
    if (!btn) {
        console.error('Wallet button not found!');
        return;
    }
    
    // Remove any existing event listeners by cloning
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    
    // Add click handler
    newBtn.onclick = async function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('Wallet button clicked');
        
        if (phantomPublicKey) {
            // Already connected, offer to disconnect
            if (confirm('Disconnect wallet?')) {
                await disconnectWallet();
            }
        } else {
            // Connect wallet
            await connectWallet();
        }
    };
    
    console.log('Wallet button initialized');
    
    // Check if already connected (auto-reconnect)
    setTimeout(async () => {
        const { solana } = window;
        if (solana && solana.isConnected) {
            try {
                const response = await solana.connect({ onlyIfTrusted: true });
                phantomPublicKey = response.publicKey.toString();
                updateWalletButton(phantomPublicKey);
                console.log('Auto-reconnected to wallet');
            } catch (err) {
                console.log('Auto-connect not available');
            }
        }
    }, 100);
});

// Expose globally for checkout integration
window.phantomPublicKey = () => phantomPublicKey;
window.connectPhantomWallet = connectWallet;
window.disconnectPhantomWallet = disconnectWallet;

console.log('Phantom Simple Script Loaded');