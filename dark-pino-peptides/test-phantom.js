// Quick Phantom Test Script
// Copy and paste this into the browser console to test

(async function testPhantom() {
    console.clear();
    console.log('🔍 PHANTOM WALLET TEST');
    console.log('====================');
    
    // Step 1: Check if Phantom exists
    console.log('\n📌 Step 1: Checking for Phantom...');
    
    const checks = {
        'window.phantom exists': !!window.phantom,
        'window.phantom.solana exists': !!window.phantom?.solana,
        'window.phantom.solana.isPhantom': window.phantom?.solana?.isPhantom,
        'window.solana exists': !!window.solana,
        'window.solana.isPhantom': window.solana?.isPhantom
    };
    
    let phantomFound = false;
    for (const [check, result] of Object.entries(checks)) {
        console.log(`  ${result ? '✅' : '❌'} ${check}: ${result}`);
        if (result === true && check.includes('isPhantom')) {
            phantomFound = true;
        }
    }
    
    if (!phantomFound) {
        console.log('\n❌ PHANTOM NOT FOUND!');
        console.log('\n📋 Troubleshooting steps:');
        console.log('1. Install Phantom from: https://phantom.app/');
        console.log('2. Click the Phantom extension icon to activate it');
        console.log('3. Refresh this page');
        console.log('4. Disable other wallet extensions (especially MetaMask)');
        return;
    }
    
    // Step 2: Get the provider
    console.log('\n📌 Step 2: Getting provider...');
    const provider = window.phantom?.solana || window.solana;
    console.log('  ✅ Provider obtained:', provider);
    
    // Step 3: Check connection status
    console.log('\n📌 Step 3: Checking connection status...');
    console.log(`  ${provider.isConnected ? '✅' : '⚠️'} Is connected: ${provider.isConnected}`);
    
    if (provider.publicKey) {
        console.log(`  ✅ Public key: ${provider.publicKey.toString()}`);
    }
    
    // Step 4: Try to connect
    console.log('\n📌 Step 4: Testing connection...');
    console.log('  🔄 Attempting to connect...');
    
    try {
        const response = await provider.connect();
        console.log(`  ✅ CONNECTION SUCCESSFUL!`);
        console.log(`  ✅ Wallet address: ${response.publicKey.toString()}`);
        
        // Step 5: Test the button
        console.log('\n📌 Step 5: Testing wallet button...');
        const btn = document.getElementById('wallet-connect-nav');
        if (btn) {
            console.log('  ✅ Wallet button found');
            console.log('  📝 Button text:', btn.textContent);
            console.log('  🎨 Button styles applied');
        } else {
            console.log('  ⚠️ Wallet button not found');
        }
        
        console.log('\n✅ ALL TESTS PASSED!');
        console.log('Phantom is working correctly.');
        
    } catch (error) {
        if (error.code === 4001) {
            console.log('  ⚠️ User cancelled the connection');
        } else {
            console.log(`  ❌ Connection failed: ${error.message}`);
            console.error(error);
        }
    }
    
    console.log('\n📊 Test complete');
    console.log('====================');
})();