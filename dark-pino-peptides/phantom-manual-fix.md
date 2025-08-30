# Phantom Wallet Manual Fix

## Quick Console Commands

Copy and paste these commands one by one in your browser console:

### 1. Check Phantom Status
```javascript
// Check if Phantom is available
console.log('Phantom:', window.phantom);
console.log('Solana:', window.solana);
```

### 2. Manual Phantom Detection (Copy this entire block)
```javascript
// Manual Phantom activation check
(async function checkPhantom() {
    console.clear();
    console.log('🔍 CHECKING FOR PHANTOM...');
    
    // Method 1: Direct check
    if (window.phantom?.solana) {
        console.log('✅ Phantom found at window.phantom.solana!');
        try {
            const resp = await window.phantom.solana.connect();
            console.log('✅ Connected!', resp.publicKey.toString());
        } catch(e) {
            console.log('❌ Connection failed:', e.message);
        }
        return;
    }
    
    // Method 2: Solana check
    if (window.solana?.isPhantom) {
        console.log('✅ Phantom found at window.solana!');
        try {
            const resp = await window.solana.connect();
            console.log('✅ Connected!', resp.publicKey.toString());
        } catch(e) {
            console.log('❌ Connection failed:', e.message);
        }
        return;
    }
    
    console.log('❌ PHANTOM NOT FOUND!');
    console.log('\n📋 TO FIX:');
    console.log('1. Go to chrome://extensions');
    console.log('2. Make sure Phantom is installed and enabled');
    console.log('3. Click the puzzle piece icon in toolbar');
    console.log('4. Pin Phantom to toolbar');
    console.log('5. Click Phantom icon to open it');
    console.log('6. Unlock your wallet');
    console.log('7. Refresh this page');
})();
```

### 3. Force Phantom Injection (If Phantom is installed but not showing)
```javascript
// Try to wake up Phantom
setTimeout(() => {
    if (window.phantom?.solana) {
        console.log('✅ Phantom is now available!');
        window.location.reload();
    } else {
        console.log('Still not detecting Phantom...');
        console.log('Please click the Phantom extension icon manually');
    }
}, 1000);
```

## Step-by-Step Fix

### If Phantom is NOT installed:
1. Go to https://phantom.app/
2. Click "Add to Chrome"
3. Follow installation steps
4. Create or import wallet
5. Refresh the Dark Pino page

### If Phantom IS installed but not working:

1. **Open Extensions Page**
   - Type `chrome://extensions` in address bar
   - Press Enter

2. **Check Phantom Status**
   - Find "Phantom" in the list
   - Make sure it's enabled (toggle should be ON)
   - Click "Details"
   - Make sure "Site access" is set to "On all sites"

3. **Pin Phantom to Toolbar**
   - Click puzzle piece icon in Chrome toolbar
   - Find Phantom
   - Click the pin icon next to it

4. **Activate Phantom**
   - Click the Phantom icon in toolbar
   - Enter password to unlock
   - Make sure you're on the right network

5. **Check for Conflicts**
   - Disable MetaMask temporarily
   - Disable other Solana wallets
   - Disable Brave Wallet if using Brave

6. **Hard Refresh**
   - Press Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Try connecting again

## Browser-Specific Issues

### Chrome
- Make sure you're not in Incognito mode
- Extensions don't work in Incognito by default

### Brave
- Brave Wallet can conflict with Phantom
- Go to Settings > Web3 > Default Ethereum wallet
- Set to "None" or "Phantom"

### Firefox
- Phantom works differently in Firefox
- May need to allow pop-ups

## Still Not Working?

1. **Open the Activation Helper**
   ```javascript
   window.open('phantom-activate.html', '_blank');
   ```

2. **Check Browser Console for Errors**
   - Right-click page > Inspect
   - Go to Console tab
   - Look for red error messages

3. **Try in a New Profile**
   - Create a new Chrome profile
   - Install only Phantom
   - Test on the site

## Common Error Messages

- **"window.phantom is undefined"**: Phantom not injected yet
- **"User rejected request"**: You cancelled the connection
- **"Unauthorized"**: Wallet is locked, unlock it first
- **"RPC Error"**: Network issues, try again