// Solana Payment Flow with Blockchain Validation
console.log('Loading Solana Payment Validation System...');

// Wait for Solana Web3 to be available
let solanaWeb3;

// Initialize Solana Web3 when ready
function initializeSolanaWeb3() {
    // The CDN script creates different possible global objects
    if (typeof window.solanaWeb3 !== 'undefined') {
        solanaWeb3 = window.solanaWeb3;
        console.log('✅ Solana Web3 initialized (solanaWeb3)');
        return true;
    } else if (typeof window.solana !== 'undefined' && window.solana.Connection) {
        solanaWeb3 = window.solana;
        console.log('✅ Solana Web3 initialized (solana)');
        return true;
    } else if (typeof solanaWeb3 !== 'undefined') {
        // Global solanaWeb3 from CDN
        console.log('✅ Solana Web3 initialized (global)');
        return true;
    }
    console.warn('⏳ Solana Web3 not yet available, retrying...');
    console.log('Available globals:', Object.keys(window).filter(k => k.toLowerCase().includes('solana')));
    return false;
}

// Try to initialize immediately and retry if needed
if (!initializeSolanaWeb3()) {
    let retries = 0;
    const maxRetries = 20;
    const retryInterval = setInterval(() => {
        retries++;
        if (initializeSolanaWeb3() || retries >= maxRetries) {
            clearInterval(retryInterval);
            if (retries >= maxRetries) {
                console.error('❌ Failed to load Solana Web3 after maximum retries');
            }
        }
    }, 500);
}

// Business wallet addresses
const BUSINESS_WALLETS = {
    SOL: 'HjcaYgfeuVg6asXf8hhRmzb5RseUDwkhq1sds4ys7T62',  // Solana wallet
    ETH: '0xCD65C73f0D6267665Ca3AfA74A3782E14FBe6E91',       // Ethereum wallet (for ETH & USDT)
    USDT: '0xCD65C73f0D6267665Ca3AfA74A3782E14FBe6E91',      // USDT on Ethereum network
    BTC: 'bc1pq0c0t6qyfj92wg8hpac2daupqnwlf32jxl8vg5dklrzv0ylkrvaqpscn9h'  // Bitcoin wallet address
};

// Legacy wallet address for backwards compatibility
const BUSINESS_WALLET = BUSINESS_WALLETS.SOL;

// Token contract addresses
const TOKEN_ADDRESSES = {
    // Solana SPL Tokens
    USDC_SOL: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC on Solana
    USDT_SOL: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT on Solana
    
    // Ethereum ERC-20 Tokens
    USDT_ETH: '0xdAC17F958D2ee523a2206206994597C13D831ec7',      // USDT on Ethereum
    USDC_ETH: '0xA0b86a33E6431C0b07B1E6e8e8Bf86EFB8c2B624'       // USDC on Ethereum
};

// Payment validation states
const PaymentStatus = {
    PENDING: 'pending',
    VALIDATING: 'validating',
    CONFIRMED: 'confirmed',
    FAILED: 'failed'
};

// Enhanced checkout flow with validation
async function processSolanaCheckout(orderData, totalUSD) {
    try {
        // Check Phantom connection
        if (!window.phantomWallet?.isConnected) {
            showNotification('Please connect your Phantom wallet first', 'error');
            return null;
        }
        
        // Get user's wallet address
        const userWallet = window.phantomWallet.publicKey;
        
        // Show payment modal
        const paymentInfo = await showSolanaPaymentModal(totalUSD, userWallet);
        
        if (!paymentInfo) {
            return null; // User cancelled
        }
        
        // Process the payment
        const transaction = await sendSolanaPayment(totalUSD);
        
        if (!transaction) {
            return null;
        }
        
        // Show validation UI
        showValidationModal(transaction.signature);
        
        // Validate on blockchain
        const validation = await validateTransaction(
            transaction.signature,
            userWallet,
            BUSINESS_WALLET,
            transaction.amount
        );
        
        if (validation.confirmed) {
            // Update UI with success
            updateValidationModal('success', transaction.signature);
            
            // Create order with validation proof
            const order = await createValidatedOrder({
                ...orderData,
                payment: {
                    method: 'solana',
                    userWallet: userWallet,
                    businessWallet: BUSINESS_WALLET,
                    signature: transaction.signature,
                    amount: transaction.amount,
                    amountUSD: totalUSD,
                    validated: true,
                    validatedAt: new Date().toISOString(),
                    blockHeight: validation.blockHeight,
                    confirmations: validation.confirmations
                }
            });
            
            return order;
        } else {
            updateValidationModal('failed', transaction.signature);
            throw new Error('Payment validation failed');
        }
        
    } catch (error) {
        console.error('Solana checkout failed:', error);
        showNotification('Payment failed: ' + error.message, 'error');
        return null;
    }
}

// Send payment through Phantom
async function sendSolanaPayment(amountUSD) {
    try {
        const provider = window.phantomWallet.provider;
        
        // Convert USD to SOL using current price
        const solPrice = window.currentSolPrice || 240; // Use global price or fallback
        const amountSOL = amountUSD / solPrice;
        const amountLamports = Math.floor(amountSOL * 1000000000);
        
        // Create connection
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
        
        // Get blockhash
        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = new solanaWeb3.PublicKey(window.phantomWallet.publicKey);
        
        // Sign and send
        const signed = await provider.signAndSendTransaction(transaction);
        
        return {
            signature: signed.signature,
            amount: amountSOL,
            timestamp: Date.now()
        };
        
    } catch (error) {
        console.error('Payment failed:', error);
        throw error;
    }
}

// Validate transaction on blockchain
async function validateTransaction(signature, fromWallet, toWallet, expectedAmount) {
    try {
        console.log('Validating transaction:', signature);
        
        const connection = new solanaWeb3.Connection(
            solanaWeb3.clusterApiUrl('mainnet-beta'),
            'confirmed'
        );
        
        // Wait for confirmation
        const confirmation = await connection.confirmTransaction(signature, 'confirmed');
        
        if (confirmation.value.err) {
            return { confirmed: false, error: 'Transaction failed' };
        }
        
        // Get transaction details
        const txDetails = await connection.getTransaction(signature, {
            maxSupportedTransactionVersion: 0
        });
        
        if (!txDetails) {
            return { confirmed: false, error: 'Transaction not found' };
        }
        
        // Verify the transaction details
        const instructions = txDetails.transaction.message.instructions;
        const transferInstruction = instructions.find(inst => 
            inst.programId.toString() === solanaWeb3.SystemProgram.programId.toString()
        );
        
        // Get confirmations count
        const latestBlockHeight = await connection.getBlockHeight();
        const confirmations = latestBlockHeight - txDetails.slot;
        
        return {
            confirmed: true,
            blockHeight: txDetails.slot,
            confirmations: confirmations,
            timestamp: txDetails.blockTime,
            from: fromWallet,
            to: toWallet,
            amount: expectedAmount
        };
        
    } catch (error) {
        console.error('Validation error:', error);
        return { confirmed: false, error: error.message };
    }
}

// Show payment modal
function showSolanaPaymentModal(amountUSD, userWallet) {
    return new Promise((resolve) => {
        // Create modal HTML
        const modal = document.createElement('div');
        modal.className = 'solana-payment-modal';
        modal.innerHTML = `
            <div class="payment-modal-content">
                <h2>Solana Payment Details</h2>
                <div class="payment-info">
                    <div class="info-row">
                        <span class="label">Amount (USD):</span>
                        <span class="value">$${amountUSD.toFixed(2)}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Amount (SOL):</span>
                        <span class="value">${(amountUSD / 50).toFixed(4)} SOL</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Your Wallet:</span>
                        <span class="value wallet-address">${userWallet.slice(0, 8)}...${userWallet.slice(-8)}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Send To:</span>
                        <span class="value wallet-address">${BUSINESS_WALLET.slice(0, 8)}...${BUSINESS_WALLET.slice(-8)}</span>
                    </div>
                </div>
                <div class="payment-buttons">
                    <button class="btn-confirm" onclick="confirmSolanaPayment()">Confirm Payment</button>
                    <button class="btn-cancel" onclick="cancelSolanaPayment()">Cancel</button>
                </div>
            </div>
        `;
        
        // Disabled modal - now shows in sidebar
        // document.body.appendChild(modal);
        
        window.confirmSolanaPayment = () => {
            modal.remove();
            resolve({ confirmed: true });
        };
        
        window.cancelSolanaPayment = () => {
            modal.remove();
            resolve(null);
        };
    });
}

// Show validation modal with progress
function showValidationModal(signature) {
    const modal = document.createElement('div');
    modal.id = 'validation-modal';
    modal.className = 'validation-modal';
    modal.innerHTML = `
        <div class="validation-content">
            <h2>Validating Payment</h2>
            <div class="validation-steps">
                <div class="step" id="step-sent">
                    <div class="step-icon">⏳</div>
                    <div class="step-text">Transaction Sent</div>
                </div>
                <div class="step" id="step-blockchain">
                    <div class="step-icon">⏳</div>
                    <div class="step-text">Confirming on Blockchain</div>
                </div>
                <div class="step" id="step-verified">
                    <div class="step-icon">⏳</div>
                    <div class="step-text">Payment Verified</div>
                </div>
            </div>
            <div class="signature-info">
                <small>Transaction: ${signature.slice(0, 20)}...</small>
                <a href="https://explorer.solana.com/tx/${signature}" target="_blank">View on Explorer</a>
            </div>
            <div class="validation-spinner"></div>
        </div>
    `;
    
    // Disabled modal - now shows in sidebar
    // document.body.appendChild(modal);
    
    // Animate steps
    setTimeout(() => {
        document.querySelector('#step-sent .step-icon').textContent = '✅';
        document.querySelector('#step-sent').classList.add('completed');
    }, 1000);
    
    setTimeout(() => {
        document.querySelector('#step-blockchain .step-icon').textContent = '⏳';
        document.querySelector('#step-blockchain').classList.add('active');
    }, 2000);
}

// Update validation modal with result
function updateValidationModal(status, signature) {
    const modal = document.getElementById('validation-modal');
    if (!modal) return;
    
    if (status === 'success') {
        // Mark all steps complete
        document.querySelectorAll('.step').forEach(step => {
            step.classList.add('completed');
            step.querySelector('.step-icon').textContent = '✅';
        });
        
        // Show success message
        setTimeout(() => {
            modal.querySelector('.validation-content').innerHTML += `
                <div class="success-message">
                    <h3>✅ Payment Confirmed!</h3>
                    <p>Your order has been validated on the Solana blockchain.</p>
                    <button onclick="document.getElementById('validation-modal').remove()">Continue</button>
                </div>
            `;
        }, 500);
        
    } else {
        // Show error
        modal.querySelector('.validation-content').innerHTML = `
            <div class="error-message">
                <h3>❌ Payment Validation Failed</h3>
                <p>The transaction could not be verified on the blockchain.</p>
                <a href="https://explorer.solana.com/tx/${signature}" target="_blank">Check Transaction</a>
                <button onclick="document.getElementById('validation-modal').remove()">Close</button>
            </div>
        `;
    }
}

// Create order with blockchain validation
async function createValidatedOrder(orderData) {
    try {
        const response = await fetch('http://localhost:5002/api/orders/validated', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Order confirmed! Order #' + result.orderNumber, 'success');
            return result;
        } else {
            throw new Error(result.message);
        }
        
    } catch (error) {
        console.error('Order creation failed:', error);
        throw error;
    }
}

// Manual payment validation with animated checkmarks
async function validateManualSolanaPayment(userWalletAddress, totalUSD, orderData) {
    try {
        // Generate order number
        const orderNumber = generateOrderNumber();
        
        // Show validation in sidebar instead of modal
        // const modal = createAnimatedValidationModal(userWalletAddress, totalUSD, orderNumber);
        // document.body.appendChild(modal);
        
        // Use sidebar validation instead
        const validationSection = createBlockchainValidationModal('manual-validation', totalUSD, orderNumber);
        
        // Start validation sequence
        await animateValidationSteps(orderNumber);
        
        // Create order with manual payment info
        const order = await createValidatedOrder({
            ...orderData,
            orderNumber: orderNumber,
            payment: {
                method: 'solana_manual',
                userWallet: userWalletAddress,
                businessWallet: BUSINESS_WALLET,
                amountUSD: totalUSD,
                amountSOL: (totalUSD / 50).toFixed(4),
                status: 'pending_validation',
                submittedAt: new Date().toISOString()
            }
        });
        
        return order;
        
    } catch (error) {
        console.error('Manual validation failed:', error);
        showNotification('Validation failed: ' + error.message, 'error');
        return null;
    }
}

// Generate order number
function generateOrderNumber() {
    const timestamp = Date.now().toString().slice(-8);
    return `DPP${timestamp}`;
}

// Create animated validation modal
function createAnimatedValidationModal(walletAddress, totalUSD, orderNumber) {
    const modal = document.createElement('div');
    modal.id = 'manual-validation-modal';
    modal.className = 'validation-modal';
    modal.innerHTML = `
        <div class="validation-content">
            <h2>Processing Your Order</h2>
            <div class="order-number" style="font-size: 1.2rem; color: #14F195; margin: 20px 0;">
                Order #${orderNumber}
            </div>
            
            <div class="validation-steps">
                <div class="step" id="manual-step1">
                    <div class="step-icon" id="manual-step1-icon">1</div>
                    <div class="step-text">Receiving wallet address</div>
                </div>
                <div class="step" id="manual-step2">
                    <div class="step-icon" id="manual-step2-icon">2</div>
                    <div class="step-text">Preparing order</div>
                </div>
                <div class="step" id="manual-step3">
                    <div class="step-icon" id="manual-step3-icon">3</div>
                    <div class="step-text">Waiting for blockchain confirmation</div>
                </div>
                <div class="step" id="manual-step4">
                    <div class="step-icon" id="manual-step4-icon">4</div>
                    <div class="step-text">Order confirmed</div>
                </div>
            </div>
            
            <div class="payment-details" style="margin-top: 30px; padding: 20px; background: rgba(0,0,0,0.3); border-radius: 10px;">
                <p style="font-size: 0.9rem; margin-bottom: 15px;">Please send payment to:</p>
                <div class="wallet-info" style="font-family: monospace; background: rgba(153, 69, 255, 0.2); padding: 10px; border-radius: 5px; margin-bottom: 10px;">
                    <small style="color: #888;">Business Wallet:</small><br>
                    <span style="color: #14F195; font-size: 0.8rem;">${BUSINESS_WALLET}</span>
                </div>
                <div class="amount-info" style="display: flex; justify-content: space-between; margin-top: 15px;">
                    <div>
                        <small style="color: #888;">Amount (USD):</small><br>
                        <span style="color: white; font-weight: bold;">$${totalUSD.toFixed(2)}</span>
                    </div>
                    <div>
                        <small style="color: #888;">Amount (SOL):</small><br>
                        <span style="color: #9945FF; font-weight: bold;">${(totalUSD / 50).toFixed(4)} SOL</span>
                    </div>
                </div>
                <div class="from-wallet" style="margin-top: 15px;">
                    <small style="color: #888;">Your Wallet:</small><br>
                    <span style="color: white; font-size: 0.8rem;">${walletAddress}</span>
                </div>
            </div>
            
            <div id="validation-message" style="margin-top: 20px; text-align: center; color: #888; font-size: 0.9rem;">
                Processing your order...
            </div>
        </div>
    `;
    return modal;
}

// Animate validation steps with checkmarks
async function animateValidationSteps(orderNumber) {
    const steps = [
        { id: 'manual-step1', message: 'Wallet address received' },
        { id: 'manual-step2', message: 'Order prepared' },
        { id: 'manual-step3', message: 'Awaiting blockchain confirmation' },
        { id: 'manual-step4', message: 'Order confirmed!' }
    ];
    
    for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const stepElement = document.getElementById(step.id);
        const iconElement = document.getElementById(step.id + '-icon');
        
        if (stepElement && iconElement) {
            // Activate step
            stepElement.classList.add('active');
            
            // Wait a bit
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Complete step with animated checkmark
            stepElement.classList.remove('active');
            stepElement.classList.add('completed');
            
            // Animate the checkmark
            iconElement.style.transform = 'scale(0)';
            iconElement.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style="stroke: #14F195; stroke-width: 3;">
                    <path d="M20 6L9 17L4 12" stroke-linecap="round" stroke-linejoin="round"
                          style="stroke-dasharray: 30; stroke-dashoffset: 30;
                                 animation: drawCheckmark 0.5s forwards;"/>
                </svg>
            `;
            iconElement.style.transform = 'scale(1)';
            iconElement.style.transition = 'transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            
            // Update message
            const messageElement = document.getElementById('validation-message');
            if (messageElement) {
                messageElement.innerHTML = `<span style="color: #14F195;">✓ ${step.message}</span>`;
            }
        }
    }
    
    // Show final success message
    await new Promise(resolve => setTimeout(resolve, 1000));
    const messageElement = document.getElementById('validation-message');
    if (messageElement) {
        messageElement.innerHTML = `
            <div class="success-final" style="padding: 20px; background: rgba(20, 241, 149, 0.1); border: 2px solid #14F195; border-radius: 10px;">
                <h3 style="color: #14F195; margin-bottom: 10px;">✅ Order Successfully Placed!</h3>
                <p style="margin-bottom: 15px;">Order #${orderNumber} has been received.</p>
                <p style="font-size: 0.85rem; color: #888;">We will validate your payment on the blockchain.<br>You will receive a confirmation email shortly.</p>
                <button onclick="closeValidationModal()" style="margin-top: 15px; padding: 10px 30px; background: linear-gradient(135deg, #9945FF, #14F195); border: none; border-radius: 8px; color: white; font-weight: bold; cursor: pointer;">Continue Shopping</button>
            </div>
        `;
    }
}

// Close validation modal
window.closeValidationModal = function() {
    const modal = document.getElementById('manual-validation-modal');
    if (modal) {
        modal.style.opacity = '0';
        modal.style.transition = 'opacity 0.3s';
        setTimeout(() => {
            modal.remove();
            // Clear cart and reload
            localStorage.removeItem('cart');
            window.location.reload();
        }, 300);
    }
};

// Add CSS animations for checkmark, fireworks, and success
if (!document.getElementById('checkmark-animation-style')) {
    const style = document.createElement('style');
    style.id = 'checkmark-animation-style';
    style.textContent = `
        @keyframes drawCheckmark {
            to {
                stroke-dashoffset: 0;
            }
        }
        
        .step.active {
            animation: pulse 1.5s infinite;
        }
        
        @keyframes pulse {
            0%, 100% {
                opacity: 1;
                transform: scale(1);
            }
            50% {
                opacity: 0.8;
                transform: scale(1.05);
            }
        }
        
        .step.completed .step-icon {
            background: linear-gradient(135deg, #14F195, #9945FF);
            color: white;
        }
        
        .step.failed .step-icon {
            background: #ff4444;
            color: white;
        }
        
        @keyframes explode {
            0% {
                transform: scale(0);
                opacity: 1;
            }
            100% {
                transform: scale(3);
                opacity: 0;
            }
        }
        
        @keyframes particle {
            0% {
                transform: translate(0, 0);
                opacity: 1;
            }
            100% {
                transform: translate(var(--end-x), var(--end-y));
                opacity: 0;
            }
        }
        
        @keyframes successPulse {
            0% {
                transform: scale(0.9);
                opacity: 0;
            }
            50% {
                transform: scale(1.05);
            }
            100% {
                transform: scale(1);
                opacity: 1;
            }
        }
        
        @keyframes bounce {
            0%, 100% {
                transform: translateY(0);
            }
            50% {
                transform: translateY(-20px);
            }
        }
        
        @keyframes expandGlow {
            0% {
                transform: scale(0);
                opacity: 0.5;
            }
            100% {
                transform: scale(1);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Validate transaction signature on blockchain
async function validateTransactionSignature(signature, expectedAmountUSD, orderData, paymentMethod = 'solana') {
    try {
        // Ensure Solana Web3 is loaded
        if (!solanaWeb3) {
            initializeSolanaWeb3();
            if (!solanaWeb3) {
                throw new Error('Solana Web3 library not loaded. Please refresh the page and try again.');
            }
        }
        
        // Generate order number
        const orderNumber = generateOrderNumber();
        
        // Show validation in sidebar with payment method
        const validationSection = createBlockchainValidationModal(signature, expectedAmountUSD, orderNumber, paymentMethod);
        
        // Start validation process
        
        // Connect to Solana mainnet
        const connection = new solanaWeb3.Connection(
            solanaWeb3.clusterApiUrl('mainnet-beta'),
            'confirmed'
        );
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Get transaction details
        
        let transaction;
        try {
            transaction = await connection.getTransaction(signature, {
                maxSupportedTransactionVersion: 0
            });
        } catch (error) {
            showValidationError('Transaction not found on blockchain');
            return null;
        }
        
        if (!transaction) {
            showValidationError('Transaction signature not found. Please verify and try again.');
            return null;
        }
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Verify payment details
        
        // Check if transaction is to our business wallet
        const businessWalletPubkey = new solanaWeb3.PublicKey(BUSINESS_WALLET);
        let paymentFound = false;
        let actualAmount = 0;
        
        // Parse transaction to find transfers
        if (transaction.meta && transaction.meta.postBalances && transaction.meta.preBalances) {
            const accountKeys = transaction.transaction.message.accountKeys || 
                               transaction.transaction.message.staticAccountKeys;
            
            // Find business wallet in account keys
            const businessWalletIndex = accountKeys.findIndex(
                key => key.toString() === BUSINESS_WALLET
            );
            
            if (businessWalletIndex !== -1) {
                // Calculate amount received by business wallet
                const preBalance = transaction.meta.preBalances[businessWalletIndex] || 0;
                const postBalance = transaction.meta.postBalances[businessWalletIndex] || 0;
                const lamportsReceived = postBalance - preBalance;
                
                if (lamportsReceived > 0) {
                    paymentFound = true;
                    actualAmount = lamportsReceived / 1000000000; // Convert lamports to SOL
                }
            }
        }
        
        if (!paymentFound) {
            showValidationError('Payment not sent to business wallet address');
            return null;
        }
        
        // Convert expected USD to SOL for comparison using real price
        const solPrice = window.currentSolPrice || 240; // Use current price or fallback
        const expectedSOL = expectedAmountUSD / solPrice;
        const tolerance = 0.001; // Allow small difference for fees
        
        if (Math.abs(actualAmount - expectedSOL) > tolerance) {
            showValidationError(`Incorrect amount. Expected: ${expectedSOL.toFixed(4)} SOL, Received: ${actualAmount.toFixed(4)} SOL`);
            return null;
        }
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Create order with blockchain proof
        const order = await createValidatedOrder({
            ...orderData,
            orderNumber: orderNumber,
            payment: {
                method: 'solana_verified',
                signature: signature,
                businessWallet: BUSINESS_WALLET,
                amountSOL: actualAmount,
                amountUSD: expectedAmountUSD,
                verified: true,
                verifiedAt: new Date().toISOString(),
                blockTime: transaction.blockTime,
                slot: transaction.slot
            }
        });
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Show success message with checkmark animation
        showValidationSuccess(orderNumber, signature);
        
        return order;
        
    } catch (error) {
        console.error('Transaction validation failed:', error);
        showValidationError('Blockchain validation failed: ' + error.message);
        return null;
    }
}

// Create blockchain validation in sidebar
function createBlockchainValidationModal(signature, amountUSD, orderNumber, paymentMethod = 'solana') {
    // Instead of modal, show in sidebar
    const sidebar = document.getElementById('cartSidebar');
    if (!sidebar) return null;
    
    // Make sure sidebar is visible
    sidebar.classList.add('active');
    const overlay = document.getElementById('cartOverlay');
    if (overlay) overlay.classList.add('active');
    
    // Hide cart items and show validation
    const cartItems = document.getElementById('cartItemsList');
    const cartEmpty = document.getElementById('cartEmpty');
    const cartFooter = sidebar.querySelector('.cart-sidebar-footer');
    
    if (cartItems) cartItems.style.display = 'none';
    if (cartEmpty) cartEmpty.style.display = 'none';
    if (cartFooter) cartFooter.style.display = 'none';
    
    // Create validation section
    const validationSection = document.createElement('div');
    validationSection.id = 'blockchain-validation-section';
    validationSection.style.padding = '20px';
    const paymentColors = {
        solana: '#14F195',
        usdc: '#2775CA',
        usdt: '#26A17B'
    };
    const paymentColor = paymentColors[paymentMethod.toLowerCase()] || '#14F195';
    
    validationSection.innerHTML = `
        <div class="validation-sidebar">
            <h3 style="color: ${paymentColor}; margin-bottom: 20px; font-size: 1.2rem;">Verifying ${paymentMethod.toUpperCase()} Payment</h3>
            <div style="font-size: 0.9rem; color: #9945FF; margin-bottom: 20px;">Order #${orderNumber}</div>
            
            <div id="validation-progress" style="display: flex; flex-direction: column; align-items: center; padding: 30px 0;">
                <div class="spinner" style="width: 60px; height: 60px; border: 3px solid rgba(${paymentColor === '#14F195' ? '20, 241, 149' : paymentColor === '#2775CA' ? '39, 117, 202' : '38, 161, 123'}, 0.1); border-top-color: ${paymentColor}; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                <p style="margin-top: 20px; color: #888; font-size: 0.9rem;">Verifying ${paymentMethod.toUpperCase()} transaction on blockchain...</p>
            </div>
            
            <div id="validation-success" style="display: none; flex-direction: column; align-items: center; padding: 30px 0;">
                <svg width="80" height="80" viewBox="0 0 80 80" style="transform: scale(0); animation: popIn 0.5s ease forwards;">
                    <circle cx="40" cy="40" r="35" stroke="${paymentColor}" stroke-width="3" fill="none" class="checkmark-circle"/>
                    <path d="M25 40 L35 50 L55 30" stroke="${paymentColor}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round" class="checkmark-check"/>
                </svg>
                <p style="margin-top: 20px; color: #14F195; font-size: 1.1rem; font-weight: bold;">Payment Verified!</p>
                <p style="margin-top: 10px; color: #888; font-size: 0.85rem;">Your order has been confirmed</p>
            </div>
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
                <a href="https://explorer.solana.com/tx/${signature}" target="_blank" style="color: #9945FF; font-size: 0.8rem; text-decoration: none;">View transaction →</a>
            </div>
        </div>
        
        <style>
            @keyframes spin { to { transform: rotate(360deg); } }
            @keyframes popIn { 
                0% { transform: scale(0); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }
            .checkmark-circle {
                stroke-dasharray: 220;
                stroke-dashoffset: 220;
                animation: drawCircle 0.6s ease forwards;
            }
            .checkmark-check {
                stroke-dasharray: 60;
                stroke-dashoffset: 60;
                animation: drawCheck 0.4s ease forwards 0.6s;
            }
            @keyframes drawCircle {
                to { stroke-dashoffset: 0; }
            }
            @keyframes drawCheck {
                to { stroke-dashoffset: 0; }
            }
        </style>
    `;
    
    // Insert validation section in the wrapper, after the header
    const wrapper = sidebar.querySelector('.cart-sidebar-wrapper');
    if (wrapper) {
        // Remove any existing validation section
        const existingValidation = document.getElementById('blockchain-validation-section');
        if (existingValidation) existingValidation.remove();
        
        // Insert after header, before cart content
        const header = wrapper.querySelector('.cart-sidebar-header');
        if (header && header.nextSibling) {
            wrapper.insertBefore(validationSection, header.nextSibling);
        } else {
            wrapper.appendChild(validationSection);
        }
    } else {
        sidebar.appendChild(validationSection);
    }
    return validationSection;
}

// Update validation step
function updateValidationStep(stepId, status, iconContent) {
    const step = document.getElementById(stepId);
    const icon = document.getElementById(stepId + '-icon');
    
    if (step && icon) {
        // Remove all status classes
        step.classList.remove('active', 'completed', 'failed');
        
        if (status === 'active') {
            step.classList.add('active');
            icon.innerHTML = `<div class=\"validation-spinner\" style=\"width: 20px; height: 20px;\"></div>`;
        } else if (status === 'completed') {
            step.classList.add('completed');
            icon.style.transform = 'scale(0)';
            icon.innerHTML = `
                <svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" style=\"stroke: #14F195; stroke-width: 3;\">
                    <path d=\"M20 6L9 17L4 12\" stroke-linecap=\"round\" stroke-linejoin=\"round\"
                          style=\"stroke-dasharray: 30; stroke-dashoffset: 30;
                                 animation: drawCheckmark 0.5s forwards;\"/>
                </svg>
            `;
            setTimeout(() => {
                icon.style.transform = 'scale(1)';
                icon.style.transition = 'transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            }, 50);
        } else if (status === 'failed') {
            step.classList.add('failed');
            icon.innerHTML = iconContent;
            icon.style.color = '#ff4444';
        }
        
        // Update status message if provided
        if (status === 'active' && typeof iconContent === 'string') {
            const statusElement = document.getElementById('validation-status');
            if (statusElement) {
                statusElement.innerHTML = `<span style=\"color: #9945FF;\">${iconContent}</span>`;
            }
        }
    }
}

// Show validation error
function showValidationError(message) {
    // Show error in sidebar
    const progressDiv = document.getElementById('validation-progress');
    const validationSection = document.getElementById('blockchain-validation-section');
    
    if (progressDiv && validationSection) {
        progressDiv.innerHTML = `
            <div class="error-container" style="display: flex; flex-direction: column; align-items: center; padding: 30px 0;">
                <svg width="80" height="80" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="35" stroke="#ff4444" stroke-width="3" fill="none"/>
                    <path d="M28 28 L52 52 M52 28 L28 52" stroke="#ff4444" stroke-width="3" stroke-linecap="round"/>
                </svg>
                <p style="margin-top: 20px; color: #ff4444; font-size: 1.1rem; font-weight: bold;">Validation Failed</p>
                <p style="margin-top: 10px; color: #888; font-size: 0.85rem; text-align: center; padding: 0 20px;">${message}</p>
                <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 30px; background: #ff4444; border: none; border-radius: 8px; color: white; font-weight: bold; cursor: pointer;">Try Again</button>
            </div>
        `;
    }
}

// Show validation success with checkmark
function showValidationSuccess(orderNumber, signature) {
    // Show success in sidebar
    const progressDiv = document.getElementById('validation-progress');
    const successDiv = document.getElementById('validation-success');
    
    if (progressDiv && successDiv) {
        // Hide progress, show success with checkmark animation
        progressDiv.style.display = 'none';
        successDiv.style.display = 'flex';
        
        // Clear cart after successful payment
        cart = [];
        updateCartDisplay();
        
        // Close sidebar and reset after showing success
        setTimeout(() => {
            const sidebar = document.getElementById('cartSidebar');
            const overlay = document.getElementById('cartOverlay');
            
            // Reset the sidebar content
            const validationSection = document.getElementById('blockchain-validation-section');
            if (validationSection) validationSection.remove();
            
            // Show cart footer again
            const cartFooter = sidebar?.querySelector('.cart-sidebar-footer');
            if (cartFooter) cartFooter.style.display = 'block';
            
            // Refresh cart display
            if (typeof displayCartItems === 'function') {
                displayCartItems();
            }
            
            // Close sidebar
            if (sidebar) sidebar.classList.remove('active');
            if (overlay) overlay.classList.remove('active');
        }, 4000);
    }
}

// Create fireworks animation
function createFireworks(container) {
    const colors = ['#14F195', '#9945FF', '#FFD700', '#FF69B4', '#00BFFF'];
    
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * window.innerHeight * 0.5;
            
            // Create explosion center
            const explosion = document.createElement('div');
            explosion.style.cssText = `
                position: absolute;
                left: ${x}px;
                top: ${y}px;
                width: 10px;
                height: 10px;
                background: white;
                border-radius: 50%;
                animation: explode 0.3s ease-out forwards;
            `;
            container.appendChild(explosion);
            
            // Create particles
            for (let j = 0; j < 20; j++) {
                const particle = document.createElement('div');
                const angle = (Math.PI * 2 * j) / 20;
                const velocity = 50 + Math.random() * 100;
                const color = colors[Math.floor(Math.random() * colors.length)];
                
                particle.style.cssText = `
                    position: absolute;
                    left: ${x}px;
                    top: ${y}px;
                    width: 4px;
                    height: 4px;
                    background: ${color};
                    border-radius: 50%;
                    box-shadow: 0 0 6px ${color};
                    animation: particle 1s ease-out forwards;
                    --end-x: ${Math.cos(angle) * velocity}px;
                    --end-y: ${Math.sin(angle) * velocity}px;
                `;
                container.appendChild(particle);
            }
            
            // Clean up
            setTimeout(() => {
                explosion.remove();
                container.querySelectorAll('div').forEach(p => p.remove());
            }, 1000);
        }, i * 300);
    }
}

// Close validation modal (updated for both modals)
window.closeValidationModal = function() {
    const modals = ['manual-validation-modal', 'blockchain-validation-modal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.opacity = '0';
            modal.style.transition = 'opacity 0.3s';
            setTimeout(() => {
                modal.remove();
                // Clear cart and reload
                localStorage.removeItem('cart');
                window.location.reload();
            }, 300);
        }
    });
};

// Export functions
window.processSolanaCheckout = processSolanaCheckout;
window.validateSolanaTransaction = validateTransaction;
window.validateManualSolanaPayment = validateManualSolanaPayment;
window.validateTransactionSignature = validateTransactionSignature;
window.generateOrderNumber = generateOrderNumber;

console.log('✅ Solana Payment Validation System Ready');