// Phantom Chrome Extension Fix
// This script provides Chrome-specific instructions for activating Phantom
console.log('Loading Phantom Chrome Fix...');

(function() {
    // Check if we're on Chrome
    const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    const isEdge = /Edg/.test(navigator.userAgent);
    const isBrave = navigator.brave && navigator.brave.isBrave;
    
    window.phantomChromeFix = function() {
        console.clear();
        console.log('%c🔧 PHANTOM CHROME FIX', 'color: #9945FF; font-size: 20px; font-weight: bold;');
        console.log('=====================================');
        
        // Browser detection
        console.log('\n📌 Browser Detection:');
        if (isChrome) {
            console.log('✅ You are using Chrome');
        } else if (isEdge) {
            console.log('✅ You are using Edge');
        } else if (isBrave) {
            console.log('✅ You are using Brave');
        } else {
            console.log('⚠️ Unknown browser - instructions may vary');
        }
        
        // Check current state
        console.log('\n📌 Current State:');
        console.log('- window.phantom:', window.phantom ? '✅ EXISTS' : '❌ NOT FOUND');
        console.log('- window.solana:', window.solana ? '✅ EXISTS' : '❌ NOT FOUND');
        
        if (!window.phantom && !window.solana) {
            console.log('\n%c❌ PHANTOM NOT DETECTED', 'color: red; font-weight: bold;');
            console.log('\n📋 STEP-BY-STEP FIX:');
            console.log('=====================================');
            
            if (isChrome || isEdge) {
                console.log('\n1️⃣ CHECK PHANTOM INSTALLATION:');
                console.log('   • Go to: chrome://extensions');
                console.log('   • Look for "Phantom" in the list');
                console.log('   • If not found, install from: https://phantom.app/');
                
                console.log('\n2️⃣ ACTIVATE PHANTOM:');
                console.log('   • Click the puzzle piece icon 🧩 (Extensions menu)');
                console.log('   • Find Phantom in the list');
                console.log('   • Click the pin icon 📌 to pin it to toolbar');
                console.log('   • Click the Phantom icon to open it');
                console.log('   • Create or unlock your wallet');
                
                console.log('\n3️⃣ CHECK FOR CONFLICTS:');
                console.log('   • Go to: chrome://extensions');
                console.log('   • DISABLE these if present:');
                console.log('     - MetaMask');
                console.log('     - Other Solana wallets');
                console.log('     - Brave Wallet (if using Brave)');
                
                console.log('\n4️⃣ REFRESH AND RETRY:');
                console.log('   • Press Ctrl+Shift+R (hard refresh)');
                console.log('   • Click "Connect Wallet" again');
            }
            
            console.log('\n💡 QUICK LINKS:');
            console.log('   • Extensions: chrome://extensions');
            console.log('   • Install Phantom: https://phantom.app/');
            console.log('   • Test page: phantom-activate.html');
            
            // Check for common issues
            console.log('\n🔍 CHECKING FOR COMMON ISSUES:');
            
            if (window.ethereum) {
                console.log('⚠️ MetaMask detected - This can block Phantom!');
                console.log('   Solution: Disable MetaMask temporarily');
            }
            
            // Check if extensions are allowed
            if (window.location.protocol === 'file:') {
                console.log('⚠️ Running from file:// protocol');
                console.log('   Some extensions may not work properly');
                console.log('   Try serving the site locally instead');
            }
            
            // Create clickable button in console
            console.log('\n📌 QUICK ACTIONS:');
            console.log('%c[Click to open Extensions page]', 'color: blue; text-decoration: underline; cursor: pointer;');
            console.log('   Run: window.open("chrome://extensions")');
            console.log('%c[Click to install Phantom]', 'color: blue; text-decoration: underline; cursor: pointer;');
            console.log('   Run: window.open("https://phantom.app/")');
            console.log('%c[Click to open activation helper]', 'color: blue; text-decoration: underline; cursor: pointer;');
            console.log('   Run: window.open("phantom-activate.html")');
            
        } else {
            console.log('\n%c✅ PHANTOM IS AVAILABLE!', 'color: green; font-weight: bold;');
            console.log('You can now connect your wallet.');
            
            // Try to connect
            console.log('\n📌 To connect manually, run:');
            console.log('   window.connectPhantom()');
        }
        
        console.log('\n=====================================');
        console.log('Need more help? Run: window.phantomDiagnostics()');
    };
    
    // Auto-run if Phantom not found after page load
    window.addEventListener('load', function() {
        setTimeout(function() {
            if (!window.phantom && !window.solana) {
                console.log('%c⚠️ Phantom not detected!', 'color: orange; font-size: 14px;');
                console.log('Run %cwindow.phantomChromeFix()%c for help', 'color: blue; font-weight: bold;', 'color: inherit;');
            }
        }, 2000);
    });
})();

// Export for manual use
console.log('Phantom Chrome Fix loaded. Run window.phantomChromeFix() for help.');