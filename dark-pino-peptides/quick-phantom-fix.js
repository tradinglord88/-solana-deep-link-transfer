// Quick Phantom Fix - Paste this entire block into console

window.fixPhantom = async function() {
    console.clear();
    console.log('%c🔧 PHANTOM QUICK FIX', 'color: #9945FF; font-size: 20px; font-weight: bold;');
    console.log('=====================================\n');
    
    // Step 1: Check current state
    console.log('📌 Step 1: Checking current state...');
    const checks = {
        'window.phantom': window.phantom,
        'window.phantom?.solana': window.phantom?.solana,
        'window.solana': window.solana,
        'window.ethereum (MetaMask)': window.ethereum
    };
    
    for (const [key, value] of Object.entries(checks)) {
        console.log(`   ${value ? '✅' : '❌'} ${key}: ${value ? 'Found' : 'Not found'}`);
    }
    
    // Step 2: Try to find Phantom
    let provider = null;
    if (window.phantom?.solana?.isPhantom) {
        provider = window.phantom.solana;
        console.log('\n✅ Phantom detected at window.phantom.solana');
    } else if (window.solana?.isPhantom) {
        provider = window.solana;
        console.log('\n✅ Phantom detected at window.solana');
    }
    
    if (provider) {
        // Step 3: Try to connect
        console.log('\n📌 Step 2: Attempting connection...');
        try {
            const response = await provider.connect();
            console.log('%c✅ SUCCESS! Connected to Phantom', 'color: green; font-size: 16px;');
            console.log('Wallet address:', response.publicKey.toString());
            
            // Update the button
            const btn = document.getElementById('wallet-connect-nav');
            if (btn) {
                const addr = response.publicKey.toString();
                btn.innerHTML = `<span class="cart-text">${addr.slice(0,4)}...${addr.slice(-4)}</span>`;
                btn.style.background = 'linear-gradient(135deg, #9945FF, #14F195)';
            }
            
            return true;
        } catch (error) {
            console.log('❌ Connection failed:', error.message);
            if (error.code === 4001) {
                console.log('You cancelled the connection. Try again.');
            }
        }
    } else {
        // Phantom not found - provide instructions
        console.log('\n%c❌ PHANTOM NOT DETECTED', 'color: red; font-size: 16px;');
        console.log('\n📋 QUICK FIX STEPS:');
        console.log('=====================================');
        console.log('1️⃣  Click the puzzle piece icon 🧩 in Chrome toolbar');
        console.log('2️⃣  Look for Phantom in the list');
        console.log('3️⃣  If not there, install from: https://phantom.app/');
        console.log('4️⃣  Click the Phantom icon to open it');
        console.log('5️⃣  Unlock your wallet');
        console.log('6️⃣  Refresh this page (Ctrl+R)');
        console.log('7️⃣  Run this command again: window.fixPhantom()');
        
        if (window.ethereum) {
            console.log('\n⚠️  WARNING: MetaMask detected!');
            console.log('   MetaMask can block Phantom.');
            console.log('   Try disabling MetaMask temporarily.');
        }
        
        console.log('\n🔗 QUICK LINKS:');
        console.log('• Install Phantom:', 'https://phantom.app/');
        console.log('• Chrome Extensions:', 'chrome://extensions');
        console.log('• Test Page:', window.location.origin + '/phantom-activate.html');
        
        // Offer to open links
        console.log('\n💡 TIP: Run these commands:');
        console.log('• window.open("https://phantom.app/") - Install Phantom');
        console.log('• window.open("phantom-activate.html") - Open test page');
    }
    
    console.log('\n=====================================');
    return false;
};

// Auto-run the fix
console.log('%c👻 Phantom Fix Loaded!', 'color: #9945FF; font-size: 14px;');
console.log('Run: %cwindow.fixPhantom()%c to check and fix Phantom', 'color: blue; font-weight: bold;', 'color: inherit;');

// Try to run automatically
setTimeout(() => {
    if (!window.phantom && !window.solana) {
        console.log('\n⚠️ Phantom not detected. Running diagnostic...');
        window.fixPhantom();
    }
}, 2000);