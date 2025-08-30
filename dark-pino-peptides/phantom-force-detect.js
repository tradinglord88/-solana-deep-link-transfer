// Force Phantom Detection - For when Phantom is installed but not showing
console.log('🔍 Force Phantom Detection Script Loading...');

// Global flag to prevent multiple detection attempts
let phantomDetectionInProgress = false;
let phantomDetectionAttempts = 0;

// Force detect with extended wait time
window.forceDetectPhantom = async function() {
    if (phantomDetectionInProgress) {
        console.log('Detection already in progress...');
        return;
    }
    
    phantomDetectionInProgress = true;
    phantomDetectionAttempts++;
    
    console.clear();
    console.log('%c🔍 FORCE PHANTOM DETECTION - ATTEMPT #' + phantomDetectionAttempts, 'color: #9945FF; font-size: 18px; font-weight: bold;');
    console.log('=====================================\n');
    
    console.log('📌 Starting aggressive detection (10 second timeout)...\n');
    
    // Check every 200ms for 10 seconds
    const maxChecks = 50;
    let found = false;
    
    for (let i = 0; i < maxChecks; i++) {
        console.log(`Check ${i + 1}/${maxChecks} (${(i * 0.2).toFixed(1)}s elapsed)`);
        
        // Method 1: Check window.phantom.solana
        if (window.phantom?.solana?.isPhantom) {
            console.log('%c✅ FOUND! Phantom detected at window.phantom.solana', 'color: green; font-size: 14px;');
            found = true;
            await attemptConnection(window.phantom.solana);
            break;
        }
        
        // Method 2: Check window.solana
        if (window.solana?.isPhantom) {
            console.log('%c✅ FOUND! Phantom detected at window.solana', 'color: green; font-size: 14px;');
            found = true;
            await attemptConnection(window.solana);
            break;
        }
        
        // Method 3: Check for solana without isPhantom flag
        if (window.solana && !window.ethereum) {
            console.log('⚠️ Found window.solana without isPhantom flag, attempting anyway...');
            found = true;
            await attemptConnection(window.solana);
            break;
        }
        
        // Wait 200ms before next check
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    if (!found) {
        console.log('\n%c❌ PHANTOM NOT DETECTED AFTER 10 SECONDS', 'color: red; font-size: 14px;');
        console.log('\n📋 TROUBLESHOOTING STEPS:');
        console.log('=====================================');
        
        // Check for common issues
        console.log('\n🔍 Checking for common issues...\n');
        
        if (window.ethereum) {
            console.log('⚠️ MetaMask detected - This is likely blocking Phantom!');
            console.log('   SOLUTION: Disable MetaMask extension temporarily');
            console.log('   1. Go to chrome://extensions');
            console.log('   2. Find MetaMask');
            console.log('   3. Toggle it OFF');
            console.log('   4. Refresh this page\n');
        }
        
        if (window.location.protocol === 'file:') {
            console.log('⚠️ Running from file:// protocol');
            console.log('   Some extensions may not inject properly with file://');
            console.log('   Try serving the site locally with:');
            console.log('   python3 -m http.server 8000');
            console.log('   Then visit: http://localhost:8000\n');
        }
        
        console.log('📌 MANUAL ACTIVATION STEPS:');
        console.log('1. Click the Phantom extension icon in your browser');
        console.log('2. Make sure it shows as "Connected" to this site');
        console.log('3. If it says "Not connected", click to connect');
        console.log('4. After connecting in Phantom, run: window.forceDetectPhantom()');
        
        console.log('\n📌 EXTENSION SETTINGS CHECK:');
        console.log('1. Go to: chrome://extensions');
        console.log('2. Find Phantom');
        console.log('3. Click "Details"');
        console.log('4. Make sure "Site access" is set to "On all sites"');
        console.log('5. Or click "On specific sites" and add this site');
        
        console.log('\n📌 LAST RESORT:');
        console.log('1. Restart Chrome completely');
        console.log('2. Make sure only Phantom is enabled (disable all other wallets)');
        console.log('3. Try in an incognito window (make sure Phantom is allowed in incognito)');
    }
    
    phantomDetectionInProgress = false;
    console.log('\n=====================================');
};

// Attempt connection
async function attemptConnection(provider) {
    console.log('\n📌 Attempting to connect...');
    try {
        const response = await provider.connect();
        console.log('%c✅ CONNECTED SUCCESSFULLY!', 'color: green; font-size: 16px; font-weight: bold;');
        console.log('Wallet Address:', response.publicKey.toString());
        
        // Update global state
        window.phantomWallet = {
            provider: provider,
            publicKey: response.publicKey.toString(),
            isConnected: true
        };
        
        // Update button
        const btn = document.getElementById('wallet-connect-nav');
        if (btn) {
            const addr = response.publicKey.toString();
            btn.innerHTML = `<span class="cart-text">${addr.slice(0,4)}...${addr.slice(-4)}</span>`;
            btn.style.background = 'linear-gradient(135deg, #9945FF, #14F195)';
            btn.style.color = 'white';
        }
        
        console.log('\n✅ Phantom is now connected and ready to use!');
        return true;
    } catch (error) {
        console.log('❌ Connection failed:', error.message);
        if (error.code === 4001) {
            console.log('You rejected the connection. Try again.');
        } else if (error.code === -32002) {
            console.log('Phantom is locked. Unlock it and try again.');
        }
        return false;
    }
}

// Check if running in incognito
function checkIncognito() {
    const fs = window.RequestFileSystem || window.webkitRequestFileSystem;
    if (!fs) {
        console.log("Could not detect incognito mode");
    } else {
        fs(window.TEMPORARY, 100, () => {
            console.log("Not in incognito mode");
        }, () => {
            console.log("⚠️ Running in incognito mode - make sure Phantom is allowed in incognito");
        });
    }
}

// Listen for Phantom to appear
let phantomCheckInterval = setInterval(() => {
    if (window.phantom?.solana?.isPhantom || window.solana?.isPhantom) {
        clearInterval(phantomCheckInterval);
        console.log('%c🎉 Phantom just became available!', 'color: green; font-size: 14px;');
        console.log('Run: window.forceDetectPhantom() to connect');
        
        // Show notification if function exists
        if (window.showNotification) {
            window.showNotification('Phantom wallet detected! Click Connect Wallet to continue.', 'success');
        }
    }
}, 1000);

// Clear interval after 30 seconds to prevent memory leak
setTimeout(() => clearInterval(phantomCheckInterval), 30000);

// Auto-run detection after 3 seconds
setTimeout(() => {
    if (!window.phantom && !window.solana) {
        console.log('%c⚠️ Phantom not detected after 3 seconds', 'color: orange; font-size: 14px;');
        console.log('Since you have Phantom installed, this usually means:');
        console.log('1. Another wallet extension is blocking it (like MetaMask)');
        console.log('2. Phantom needs to be manually activated for this site');
        console.log('3. Site access permissions need to be updated');
        console.log('\nRun: %cwindow.forceDetectPhantom()%c to try aggressive detection', 'color: blue; font-weight: bold;', 'color: inherit;');
    }
}, 3000);

console.log('✅ Force Detection Script Ready');
console.log('Commands available:');
console.log('• window.forceDetectPhantom() - Run aggressive 10-second detection');