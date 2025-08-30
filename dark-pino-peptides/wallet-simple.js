// Simple Phantom Wallet Connection
console.log('Loading Simple Wallet Connection...');

// Global wallet state
window.phantomWallet = {
    provider: null,
    publicKey: null,
    isConnected: false
};

// Wait for page to load
window.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, setting up wallet button...');
    
    // Get the wallet button
    const walletBtn = document.getElementById('wallet-connect-nav');
    if (!walletBtn) {
        console.error('Wallet button not found!');
        return;
    }
    
    // Remove any existing event listeners by cloning
    const newBtn = walletBtn.cloneNode(true);
    walletBtn.parentNode.replaceChild(newBtn, walletBtn);
    
    // Add click handler
    newBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        console.log('Wallet button clicked!');
        
        // Check if Phantom exists
        const provider = window.phantom?.solana || window.solana;
        
        if (!provider) {
            alert('Phantom wallet not found!\n\n1. Install Phantom from phantom.app\n2. Click the Phantom icon in your browser\n3. Refresh this page');
            return;
        }
        
        try {
            // Request connection
            console.log('Connecting to Phantom...');
            const response = await provider.connect();
            const address = response.publicKey.toString();
            
            console.log('Connected:', address);
            
            // Save wallet state globally
            window.phantomWallet.provider = provider;
            window.phantomWallet.publicKey = address;
            window.phantomWallet.isConnected = true;
            
            // Update button text
            newBtn.innerHTML = `<span class="cart-text">${address.slice(0,4)}...${address.slice(-4)}</span>`;
            
            // Style the button
            newBtn.style.background = 'linear-gradient(135deg, #9945FF, #14F195)';
            newBtn.style.color = 'white';
            
            // Show success message
            if (window.showNotification) {
                window.showNotification('Wallet connected!', 'success');
            }
            
        } catch (error) {
            console.error('Connection failed:', error);
            if (error.code === 4001) {
                alert('Connection cancelled');
            } else {
                alert('Connection failed: ' + error.message);
            }
        }
    });
    
    console.log('Wallet button ready!');
    
    // Check if already connected
    setTimeout(async () => {
        const provider = window.phantom?.solana || window.solana;
        if (provider && provider.isConnected) {
            try {
                const response = await provider.connect({ onlyIfTrusted: true });
                const address = response.publicKey.toString();
                
                // Save state
                window.phantomWallet.provider = provider;
                window.phantomWallet.publicKey = address;
                window.phantomWallet.isConnected = true;
                
                // Update button
                const btn = document.getElementById('wallet-connect-nav');
                if (btn) {
                    btn.innerHTML = `<span class="cart-text">${address.slice(0,4)}...${address.slice(-4)}</span>`;
                    btn.style.background = 'linear-gradient(135deg, #9945FF, #14F195)';
                    btn.style.color = 'white';
                }
                
                console.log('Auto-reconnected to Phantom:', address);
            } catch (e) {
                // Silent fail - user needs to connect manually
            }
        }
    }, 1000);
});

// Debug function to check wallet state
window.checkWalletState = function() {
    console.log('=== WALLET STATE ===');
    console.log('phantomWallet:', window.phantomWallet);
    console.log('isConnected:', window.phantomWallet?.isConnected);
    console.log('publicKey:', window.phantomWallet?.publicKey);
    console.log('provider:', window.phantomWallet?.provider);
    console.log('===================');
    return window.phantomWallet;
};