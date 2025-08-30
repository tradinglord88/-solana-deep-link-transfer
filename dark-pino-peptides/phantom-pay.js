// Phantom Payment Processor
console.log('💳 Phantom Payment Processor Loading...');

// Your business wallet (from your .env)
const BUSINESS_WALLET = 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH';

// Process payment with Phantom
async function processPhantomPayment(amountUSD) {
    try {
        // Check if Phantom is connected
        if (!window.phantomWallet?.isConnected) {
            throw new Error('Please connect your Phantom wallet first');
        }
        
        const provider = window.phantomWallet.provider;
        if (!provider) {
            throw new Error('Phantom provider not available');
        }
        
        console.log(`Processing payment of $${amountUSD}...`);
        
        // For demo: 1 SOL = $50 (you should fetch real price)
        const solPrice = 50;
        const amountSOL = amountUSD / solPrice;
        const amountLamports = Math.floor(amountSOL * 1000000000); // 1 SOL = 1e9 lamports
        
        console.log(`Amount: ${amountSOL.toFixed(4)} SOL`);
        
        // Create connection to Solana
        const connection = new solanaWeb3.Connection(
            solanaWeb3.clusterApiUrl('mainnet-beta'),
            'confirmed'
        );
        
        // Create transaction
        const transaction = new solanaWeb3.Transaction().add(
            solanaWeb3.SystemProgram.transfer({
                fromPubkey: new solanaWeb3.PublicKey(window.phantomWallet.publicKey),
                toPubkey: new solanaWeb3.PublicKey(BUSINESS_WALLET),
                lamports: amountLamports,
            })
        );
        
        // Get latest blockhash
        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = new solanaWeb3.PublicKey(window.phantomWallet.publicKey);
        
        // Request signature from Phantom
        console.log('Requesting transaction signature...');
        const signed = await provider.signAndSendTransaction(transaction);
        
        console.log('Transaction sent:', signed.signature);
        
        // Wait for confirmation
        console.log('Waiting for confirmation...');
        await connection.confirmTransaction(signed.signature);
        
        console.log('✅ Payment confirmed!');
        
        return {
            success: true,
            signature: signed.signature,
            amount: amountSOL,
            explorer: `https://explorer.solana.com/tx/${signed.signature}`
        };
        
    } catch (error) {
        console.error('Payment failed:', error);
        throw error;
    }
}

// Check SOL balance
async function checkPhantomBalance() {
    try {
        if (!window.phantomWallet?.isConnected) {
            return null;
        }
        
        const connection = new solanaWeb3.Connection(
            solanaWeb3.clusterApiUrl('mainnet-beta'),
            'confirmed'
        );
        
        const publicKey = new solanaWeb3.PublicKey(window.phantomWallet.publicKey);
        const balance = await connection.getBalance(publicKey);
        
        return balance / 1000000000; // Convert lamports to SOL
        
    } catch (error) {
        console.error('Balance check failed:', error);
        return null;
    }
}

// Update checkout to use Phantom
window.processPhantomCheckout = async function(orderData, totalUSD) {
    try {
        // Check connection
        if (!window.phantomWallet?.isConnected) {
            if (window.connectPhantom) {
                await window.connectPhantom();
            } else {
                throw new Error('Phantom not connected');
            }
        }
        
        // Process payment
        const payment = await processPhantomPayment(totalUSD);
        
        // Add payment info to order
        orderData.paymentSignature = payment.signature;
        orderData.paymentMethod = 'phantom';
        
        // Send order to backend
        const response = await fetch('http://localhost:5002/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            return {
                success: true,
                orderNumber: result.orderNumber,
                signature: payment.signature,
                explorer: payment.explorer
            };
        } else {
            throw new Error(result.message || 'Order creation failed');
        }
        
    } catch (error) {
        console.error('Checkout failed:', error);
        throw error;
    }
};

// Expose functions
window.processPhantomPayment = processPhantomPayment;
window.checkPhantomBalance = checkPhantomBalance;

console.log('✅ Phantom Payment Processor Ready');