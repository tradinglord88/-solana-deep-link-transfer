// Solana Payment Processing
console.log('Solana Payment Script Loading...');

// Your business wallet address (replace with your actual Solana wallet)
const BUSINESS_WALLET = 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH'; // From your .env file

// Process Solana payment
async function processSolanaPayment(amountInUSD) {
    try {
        const { solana } = window;
        
        if (!solana || !solana.isPhantom) {
            throw new Error('Phantom wallet not connected');
        }
        
        const publicKey = window.phantomPublicKey ? window.phantomPublicKey() : null;
        if (!publicKey) {
            throw new Error('Wallet not connected');
        }
        
        // Convert USD to SOL (you'd normally fetch the current SOL/USD rate)
        // For demo, assuming 1 SOL = $50 USD
        const solPrice = 50; // This should be fetched from an API
        const amountInSOL = amountInUSD / solPrice;
        const amountInLamports = Math.floor(amountInSOL * solanaWeb3.LAMPORTS_PER_SOL);
        
        console.log(`Processing payment of ${amountInSOL.toFixed(4)} SOL ($${amountInUSD})`);
        
        // Create connection to Solana mainnet
        // Use 'mainnet-beta' for production, 'devnet' for testing
        const connection = new solanaWeb3.Connection(
            solanaWeb3.clusterApiUrl('mainnet-beta'), 
            'confirmed'
        );
        
        // Create transaction
        const transaction = new solanaWeb3.Transaction().add(
            solanaWeb3.SystemProgram.transfer({
                fromPubkey: new solanaWeb3.PublicKey(publicKey),
                toPubkey: new solanaWeb3.PublicKey(BUSINESS_WALLET),
                lamports: amountInLamports,
            })
        );
        
        // Get recent blockhash
        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = new solanaWeb3.PublicKey(publicKey);
        
        // Show payment confirmation dialog
        if (window.showNotification) {
            window.showNotification('Approve transaction in Phantom...', 'info');
        }
        
        // Sign and send transaction via Phantom
        const { signature } = await solana.signAndSendTransaction(transaction);
        
        console.log('Transaction sent, signature:', signature);
        
        // Wait for confirmation
        if (window.showNotification) {
            window.showNotification('Transaction sent, waiting for confirmation...', 'info');
        }
        
        await connection.confirmTransaction(signature, 'confirmed');
        
        console.log('Transaction confirmed!');
        
        return {
            success: true,
            signature: signature,
            amount: amountInSOL,
            explorer: `https://explorer.solana.com/tx/${signature}`
        };
        
    } catch (error) {
        console.error('Payment error:', error);
        
        if (error.code === 4001) {
            throw new Error('Transaction cancelled by user');
        } else if (error.message.includes('insufficient')) {
            throw new Error('Insufficient SOL balance');
        } else {
            throw error;
        }
    }
}

// Check SOL balance
async function checkSolanaBalance() {
    try {
        const publicKey = window.phantomPublicKey ? window.phantomPublicKey() : null;
        if (!publicKey) {
            return null;
        }
        
        const connection = new solanaWeb3.Connection(
            solanaWeb3.clusterApiUrl('mainnet-beta'),
            'confirmed'
        );
        
        const balance = await connection.getBalance(new solanaWeb3.PublicKey(publicKey));
        const solBalance = balance / solanaWeb3.LAMPORTS_PER_SOL;
        
        return solBalance;
    } catch (error) {
        console.error('Balance check error:', error);
        return null;
    }
}

// Get current SOL price (mock function - replace with real API)
async function getSolanaPrice() {
    // In production, fetch from CoinGecko or similar API
    // For demo, returning fixed price
    return 50; // $50 per SOL
}

// Expose functions globally
window.processSolanaPayment = processSolanaPayment;
window.checkSolanaBalance = checkSolanaBalance;
window.getSolanaPrice = getSolanaPrice;

console.log('Solana Payment Script Loaded');