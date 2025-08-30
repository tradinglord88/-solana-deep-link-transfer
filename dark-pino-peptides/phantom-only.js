// Phantom-Only Wallet Connection
console.log('🟣 Phantom-Only Wallet Script Loading...');

// Global Phantom state
window.phantomWallet = {
    provider: null,
    publicKey: null,
    isConnected: false
};

// Detect Phantom with multiple retries
async function detectPhantom(maxRetries = 50) {
    console.log('Detecting Phantom wallet...');
    
    for (let i = 0; i < maxRetries; i++) {
        // Check primary location
        if (window.phantom?.solana?.isPhantom) {
            console.log('✅ Phantom found at window.phantom.solana');
            return window.phantom.solana;
        }
        
        // Check secondary location
        if (window.solana?.isPhantom) {
            console.log('✅ Phantom found at window.solana');
            return window.solana;
        }
        
        // Wait 100ms before next attempt
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('❌ Phantom not detected after', maxRetries, 'attempts');
    return null;
}

// Connect to Phantom
async function connectPhantom() {
    try {
        console.log('Starting Phantom connection...');
        
        // Update button to show loading
        updateButton('Detecting...', false);
        
        // Detect Phantom
        const provider = await detectPhantom();
        
        if (!provider) {
            alert(`Phantom wallet not detected!

Please make sure:
1. Phantom extension is installed
2. Click the Phantom extension icon to activate it
3. Refresh this page

If you have other wallet extensions, they may be blocking Phantom.
Try disabling them temporarily.`);
            
            updateButton('Connect Wallet', false);
            return null;
        }
        
        // Request connection
        console.log('Requesting connection to Phantom...');
        const response = await provider.connect();
        
        // Save state
        window.phantomWallet.provider = provider;
        window.phantomWallet.publicKey = response.publicKey.toString();
        window.phantomWallet.isConnected = true;
        
        console.log('✅ Connected to Phantom:', window.phantomWallet.publicKey);
        
        // Update button
        const short = window.phantomWallet.publicKey.slice(0, 4) + '...' + 
                     window.phantomWallet.publicKey.slice(-4);
        updateButton(short, true);
        
        // Show success notification
        if (window.showNotification) {
            window.showNotification('Phantom wallet connected!', 'success');
        }
        
        // Listen for disconnect
        provider.on('disconnect', () => {
            console.log('Phantom disconnected');
            disconnectPhantom();
        });
        
        // Listen for account change
        provider.on('accountChanged', (publicKey) => {
            if (publicKey) {
                console.log('Account changed:', publicKey.toString());
                window.phantomWallet.publicKey = publicKey.toString();
                const short = publicKey.toString().slice(0, 4) + '...' + 
                             publicKey.toString().slice(-4);
                updateButton(short, true);
            } else {
                disconnectPhantom();
            }
        });
        
        return window.phantomWallet.publicKey;
        
    } catch (error) {
        console.error('Phantom connection error:', error);
        
        if (error.code === 4001) {
            // User rejected
            console.log('User cancelled connection');
            if (window.showNotification) {
                window.showNotification('Connection cancelled', 'error');
            }
        } else if (error.code === -32002) {
            alert('Please unlock your Phantom wallet and try again');
        } else {
            alert('Failed to connect: ' + error.message);
        }
        
        updateButton('Connect Wallet', false);
        return null;
    }
}

// Disconnect from Phantom
function disconnectPhantom() {
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
    
    updateButton('Connect Wallet', false);
    
    if (window.showNotification) {
        window.showNotification('Wallet disconnected', 'info');
    }
}

// Update button UI
function updateButton(text, isConnected) {
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

// Initialize wallet button
function initPhantomButton() {
    console.log('Initializing Phantom button...');
    
    const btn = document.getElementById('wallet-connect-nav');
    if (!btn) {
        console.log('Button not found, retrying...');
        setTimeout(initPhantomButton, 500);
        return;
    }
    
    // Remove ALL existing event listeners by cloning
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    
    // Add single click handler for Phantom
    newBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('Phantom button clicked');
        
        if (window.phantomWallet.isConnected) {
            // Already connected, offer disconnect
            if (confirm('Disconnect from Phantom?')) {
                disconnectPhantom();
            }
        } else {
            // Connect to Phantom
            await connectPhantom();
        }
    });
    
    console.log('✅ Phantom button ready');
    
    // Try auto-reconnect if previously connected
    setTimeout(async () => {
        const provider = await detectPhantom(10); // Quick check
        if (provider && provider.isConnected) {
            try {
                const response = await provider.connect({ onlyIfTrusted: true });
                window.phantomWallet.provider = provider;
                window.phantomWallet.publicKey = response.publicKey.toString();
                window.phantomWallet.isConnected = true;
                
                const short = response.publicKey.toString().slice(0, 4) + '...' + 
                             response.publicKey.toString().slice(-4);
                updateButton(short, true);
                
                console.log('Auto-reconnected to Phantom');
            } catch (e) {
                // Auto-connect not available, that's ok
            }
        }
    }, 1000);
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPhantomButton);
} else {
    initPhantomButton();
}

// Backup initialization
window.addEventListener('load', () => {
    setTimeout(initPhantomButton, 100);
});

// Expose global functions
window.connectPhantom = connectPhantom;
window.disconnectPhantom = disconnectPhantom;
window.getPhantomWallet = () => window.phantomWallet;

// Manual test function
window.testPhantom = async function() {
    console.log('=== PHANTOM TEST ===');
    const provider = await detectPhantom(20);
    if (provider) {
        console.log('✅ Phantom detected!');
        console.log('Provider:', provider);
        console.log('Is connected:', provider.isConnected);
        return provider;
    } else {
        console.log('❌ Phantom not found');
        console.log('Checked locations:');
        console.log('- window.phantom:', window.phantom);
        console.log('- window.solana:', window.solana);
        return null;
    }
};

console.log('✅ Phantom-Only Script Ready');
console.log('Type window.testPhantom() to debug');