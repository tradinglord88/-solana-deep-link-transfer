// Force Phantom Detection Script
console.log('Phantom Force Inject Script Starting...');

// Global state
let phantomWallet = {
    provider: null,
    publicKey: null,
    isConnected: false
};

// Force wait for Phantom with aggressive checking
function forceDetectPhantom() {
    console.log('Force detecting Phantom...');
    
    // Method 1: Check all possible locations
    const possibleLocations = [
        () => window.phantom?.solana,
        () => window.solana,
        () => window.solanaWallet,
        () => window.phantomSolana,
        () => {
            // Check if any property contains phantom
            for (let key in window) {
                if (key.toLowerCase().includes('phantom') && window[key]?.isPhantom) {
                    console.log(`Found Phantom at window.${key}`);
                    return window[key];
                }
            }
            return null;
        },
        () => {
            // Check ethereum providers array
            if (window.ethereum?.providers) {
                return window.ethereum.providers.find(p => p.isPhantom);
            }
            return null;
        }
    ];
    
    for (const getProvider of possibleLocations) {
        try {
            const provider = getProvider();
            if (provider) {
                console.log('✅ Found Phantom provider!');
                return provider;
            }
        } catch (e) {
            // Continue checking
        }
    }
    
    return null;
}

// Aggressive wait function
async function aggressiveWaitForPhantom() {
    return new Promise((resolve) => {
        let checkCount = 0;
        const maxChecks = 100; // 10 seconds total
        
        const checkInterval = setInterval(() => {
            checkCount++;
            
            // Log every 10 checks
            if (checkCount % 10 === 0) {
                console.log(`Still checking for Phantom... (${checkCount}/${maxChecks})`);
                
                // Log what IS available
                console.log('Available window properties:', {
                    phantom: !!window.phantom,
                    solana: !!window.solana,
                    ethereum: !!window.ethereum,
                    'ethereum.providers': window.ethereum?.providers?.length
                });
            }
            
            const provider = forceDetectPhantom();
            
            if (provider) {
                clearInterval(checkInterval);
                console.log(`✅ Phantom found after ${checkCount} checks!`);
                resolve(provider);
            } else if (checkCount >= maxChecks) {
                clearInterval(checkInterval);
                console.log(`❌ Phantom not found after ${checkCount} checks`);
                resolve(null);
            }
        }, 100);
    });
}

// Connect with extended waiting
async function connectPhantomForce() {
    try {
        console.log('=== PHANTOM FORCE CONNECT ===');
        
        // Show loading message
        const btn = document.getElementById('wallet-connect-nav');
        if (btn) {
            btn.innerHTML = '<span class="cart-text">Detecting...</span>';
        }
        
        // Try aggressive detection
        let provider = await aggressiveWaitForPhantom();
        
        if (!provider) {
            console.log('❌ Phantom not found after aggressive wait');
            
            // Final attempt - prompt user
            alert(`Phantom wallet not detected!

This is likely due to wallet conflicts. Please try:

1. Disable ALL other wallet extensions (MetaMask, etc.)
2. Refresh this page (Ctrl+R or Cmd+R)
3. Click Connect Wallet again

Or:

1. Open a new Incognito/Private window
2. Enable ONLY Phantom extension
3. Try connecting again`);
            
            if (btn) {
                btn.innerHTML = '<span class="cart-text">Connect Wallet</span>';
            }
            
            return null;
        }
        
        // Try to connect
        console.log('📡 Requesting connection...');
        const response = await provider.connect();
        
        phantomWallet.provider = provider;
        phantomWallet.publicKey = response.publicKey.toString();
        phantomWallet.isConnected = true;
        
        console.log('✅ Connected:', phantomWallet.publicKey);
        
        // Update UI
        if (btn) {
            const short = phantomWallet.publicKey.slice(0, 4) + '...' + phantomWallet.publicKey.slice(-4);
            btn.innerHTML = `<span class="cart-text">${short}</span>`;
            btn.style.background = 'linear-gradient(135deg, #9945FF, #14F195)';
        }
        
        // Success notification
        if (window.showNotification) {
            window.showNotification('Wallet connected!', 'success');
        }
        
        return phantomWallet.publicKey;
        
    } catch (error) {
        console.error('Connection error:', error);
        
        const btn = document.getElementById('wallet-connect-nav');
        if (btn) {
            btn.innerHTML = '<span class="cart-text">Connect Wallet</span>';
        }
        
        if (error.code === 4001) {
            if (window.showNotification) {
                window.showNotification('Connection cancelled', 'error');
            }
        } else {
            alert('Connection failed: ' + error.message);
        }
        
        return null;
    }
}

// Disconnect
async function disconnectPhantomForce() {
    if (phantomWallet.provider) {
        try {
            await phantomWallet.provider.disconnect();
        } catch (e) {
            console.log('Disconnect error:', e);
        }
    }
    
    phantomWallet.provider = null;
    phantomWallet.publicKey = null;
    phantomWallet.isConnected = false;
    
    const btn = document.getElementById('wallet-connect-nav');
    if (btn) {
        btn.innerHTML = '<span class="cart-text">Connect Wallet</span>';
        btn.style.background = '';
    }
    
    if (window.showNotification) {
        window.showNotification('Disconnected', 'info');
    }
}

// Initialize button
function initForceButton() {
    console.log('Initializing force connect button...');
    
    const btn = document.getElementById('wallet-connect-nav');
    if (!btn) {
        console.error('Button not found');
        setTimeout(initForceButton, 1000);
        return;
    }
    
    // Clone to remove old handlers
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    
    newBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('Button clicked - force mode');
        
        if (phantomWallet.isConnected) {
            if (confirm('Disconnect wallet?')) {
                await disconnectPhantomForce();
            }
        } else {
            await connectPhantomForce();
        }
    });
    
    console.log('Force button ready');
}

// Try multiple init strategies
document.addEventListener('DOMContentLoaded', initForceButton);
window.addEventListener('load', () => setTimeout(initForceButton, 500));
setTimeout(initForceButton, 2000);

// Expose globally
window.phantomWallet = phantomWallet;
window.connectPhantomForce = connectPhantomForce;
window.forceDetectPhantom = forceDetectPhantom;

// Manual trigger helper
window.testPhantom = async function() {
    console.log('=== MANUAL PHANTOM TEST ===');
    const provider = forceDetectPhantom();
    if (provider) {
        console.log('✅ Provider found:', provider);
        try {
            const resp = await provider.connect();
            console.log('✅ Connected:', resp.publicKey.toString());
        } catch (e) {
            console.error('❌ Connect failed:', e);
        }
    } else {
        console.log('❌ No provider found');
    }
};

console.log('Phantom Force Inject Script Ready');
console.log('Use window.testPhantom() to manually test');