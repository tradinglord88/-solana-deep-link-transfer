// Phantom Direct Injector - Forces Phantom to Load
console.log('🔧 Phantom Injector Starting...');

// First, we need to prevent other wallets from blocking the injection
(function() {
    'use strict';
    
    // Store original defineProperty
    const originalDefineProperty = Object.defineProperty;
    
    // Temporarily override defineProperty to prevent conflicts
    let phantomInjected = false;
    
    // Create a proxy for window to intercept property access
    const checkPhantomInterval = setInterval(() => {
        // Check if Phantom exists in any form
        const phantomChecks = [
            () => window.phantom?.solana,
            () => window.solana?.isPhantom && window.solana,
            () => {
                // Check for Phantom in iframes
                try {
                    const iframes = document.querySelectorAll('iframe');
                    for (const iframe of iframes) {
                        if (iframe.contentWindow?.phantom?.solana) {
                            return iframe.contentWindow.phantom.solana;
                        }
                    }
                } catch (e) {}
                return null;
            },
            () => {
                // Check for Phantom in global scope
                try {
                    if (globalThis.phantom?.solana) {
                        return globalThis.phantom.solana;
                    }
                } catch (e) {}
                return null;
            }
        ];
        
        for (const check of phantomChecks) {
            const provider = check();
            if (provider) {
                console.log('✅ Phantom found and captured!');
                window._phantomProvider = provider;
                phantomInjected = true;
                clearInterval(checkPhantomInterval);
                
                // Dispatch custom event
                window.dispatchEvent(new CustomEvent('phantomFound', { 
                    detail: { provider } 
                }));
                break;
            }
        }
    }, 50);
    
    // Stop checking after 10 seconds
    setTimeout(() => {
        clearInterval(checkPhantomInterval);
        if (!phantomInjected) {
            console.log('❌ Phantom not found after 10 seconds');
        }
    }, 10000);
})();

// Alternative approach: Message-based communication
window.addEventListener('message', (event) => {
    if (event.data?.type === 'PHANTOM_PROVIDER') {
        console.log('📨 Phantom provider received via message');
        window._phantomProvider = event.data.provider;
        window.dispatchEvent(new CustomEvent('phantomFound', { 
            detail: { provider: event.data.provider } 
        }));
    }
});

// Force request Phantom through all possible channels
function forceRequestPhantom() {
    console.log('🔄 Force requesting Phantom...');
    
    // Method 1: Standard EIP-6963
    window.dispatchEvent(new Event('eip6963:requestProvider'));
    
    // Method 2: Custom event for Phantom
    window.dispatchEvent(new CustomEvent('phantom:requestProvider'));
    
    // Method 3: PostMessage to extension
    window.postMessage({ 
        type: 'PHANTOM_REQUEST',
        target: 'phantom-contentscript'
    }, '*');
    
    // Method 4: Direct extension communication attempt
    try {
        if (chrome?.runtime) {
            chrome.runtime.sendMessage('bfnaelmomeimhlpmgjnjophhpkkoljpa', {
                type: 'phantom-request'
            }, (response) => {
                if (response) {
                    console.log('Extension response:', response);
                }
            });
        }
    } catch (e) {
        // Extension API not available
    }
}

// Enhanced Phantom connection
window.connectPhantomDirect = async function() {
    console.log('=== PHANTOM DIRECT CONNECTION ===');
    
    // First, force request
    forceRequestPhantom();
    
    // Wait for provider
    return new Promise((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 100; // 10 seconds
        
        const checkInterval = setInterval(() => {
            attempts++;
            
            // Check our captured provider
            if (window._phantomProvider) {
                clearInterval(checkInterval);
                console.log('✅ Using captured Phantom provider');
                
                // Connect
                window._phantomProvider.connect()
                    .then(response => {
                        console.log('✅ Connected:', response.publicKey.toString());
                        
                        // Update UI
                        const btn = document.getElementById('wallet-connect-nav');
                        if (btn) {
                            const addr = response.publicKey.toString();
                            const short = addr.slice(0, 4) + '...' + addr.slice(-4);
                            btn.innerHTML = `<span class="cart-text">${short}</span>`;
                            btn.style.background = 'linear-gradient(135deg, #9945FF, #14F195)';
                        }
                        
                        resolve(response.publicKey.toString());
                    })
                    .catch(reject);
                return;
            }
            
            // Also check standard locations
            const provider = window.phantom?.solana || window.solana;
            if (provider?.isPhantom || (provider && !provider.isMetaMask)) {
                clearInterval(checkInterval);
                window._phantomProvider = provider;
                console.log('✅ Found Phantom at standard location');
                
                provider.connect()
                    .then(response => {
                        console.log('✅ Connected:', response.publicKey.toString());
                        
                        // Update UI
                        const btn = document.getElementById('wallet-connect-nav');
                        if (btn) {
                            const addr = response.publicKey.toString();
                            const short = addr.slice(0, 4) + '...' + addr.slice(-4);
                            btn.innerHTML = `<span class="cart-text">${short}</span>`;
                            btn.style.background = 'linear-gradient(135deg, #9945FF, #14F195)';
                        }
                        
                        resolve(response.publicKey.toString());
                    })
                    .catch(reject);
                return;
            }
            
            if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                console.log('❌ Phantom not found after maximum attempts');
                
                // Last resort - prompt user
                const message = `
Phantom wallet cannot be detected due to extension conflicts.

SOLUTION:
1. Open a new browser window (not just a tab)
2. Go to chrome://extensions/
3. Disable ALL wallet extensions except Phantom
4. Refresh this page
5. Try connecting again

Or use Phantom in a different browser where it's the only wallet installed.

Would you like to copy these instructions?`;
                
                if (confirm(message)) {
                    navigator.clipboard.writeText(
                        'Fix Phantom:\n' +
                        '1. New browser window\n' +
                        '2. chrome://extensions/\n' +
                        '3. Disable all wallets except Phantom\n' +
                        '4. Refresh page\n' +
                        '5. Connect wallet'
                    );
                    alert('Instructions copied to clipboard!');
                }
                
                reject(new Error('Phantom not detected'));
            }
        }, 100);
    });
};

// Initialize button with new connection
function initDirectButton() {
    const btn = document.getElementById('wallet-connect-nav');
    if (!btn) {
        setTimeout(initDirectButton, 500);
        return;
    }
    
    // Clone to remove old handlers
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    
    newBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        console.log('Direct connection button clicked');
        
        try {
            await window.connectPhantomDirect();
        } catch (error) {
            console.error('Connection failed:', error);
            
            const btn = document.getElementById('wallet-connect-nav');
            if (btn) {
                btn.innerHTML = '<span class="cart-text">Connect Wallet</span>';
            }
        }
    });
    
    console.log('✅ Direct button initialized');
}

// Try multiple initialization strategies
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDirectButton);
} else {
    initDirectButton();
}

// Also listen for phantom found event
window.addEventListener('phantomFound', (event) => {
    console.log('🎉 Phantom found via custom event!', event.detail);
});

// Start force requesting immediately
setTimeout(forceRequestPhantom, 100);
setTimeout(forceRequestPhantom, 1000);
setTimeout(forceRequestPhantom, 2000);

console.log('✅ Phantom Injector Ready');
console.log('Use window.connectPhantomDirect() to connect');