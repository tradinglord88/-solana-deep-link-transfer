// Solana Payment Validation Routes
const express = require('express');
const router = express.Router();
const { Connection, PublicKey, clusterApiUrl } = require('@solana/web3.js');

// Business wallet address
const BUSINESS_WALLET = 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH';

// Validate transaction on blockchain
router.post('/validate-payment', async (req, res) => {
    try {
        const { 
            signature, 
            fromWallet, 
            expectedAmount,
            orderId 
        } = req.body;

        // Connect to Solana
        const connection = new Connection(
            clusterApiUrl('mainnet-beta'),
            'confirmed'
        );

        // Get transaction details
        const transaction = await connection.getTransaction(signature, {
            maxSupportedTransactionVersion: 0
        });

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found on blockchain'
            });
        }

        // Verify transaction details
        const validation = {
            signature,
            confirmed: true,
            blockTime: transaction.blockTime,
            slot: transaction.slot,
            fromWallet,
            toWallet: BUSINESS_WALLET
        };

        // Get confirmations
        const latestBlockHeight = await connection.getBlockHeight();
        validation.confirmations = latestBlockHeight - transaction.slot;

        // Verify it's confirmed (at least 1 confirmation)
        if (validation.confirmations < 1) {
            return res.status(400).json({
                success: false,
                message: 'Transaction not yet confirmed',
                confirmations: validation.confirmations
            });
        }

        // Log validation for audit
        console.log('Payment validated:', {
            signature,
            confirmations: validation.confirmations,
            amount: expectedAmount,
            from: fromWallet,
            orderId
        });

        res.json({
            success: true,
            validation,
            message: 'Payment validated successfully'
        });

    } catch (error) {
        console.error('Validation error:', error);
        res.status(500).json({
            success: false,
            message: 'Validation failed',
            error: error.message
        });
    }
});

// Check transaction status
router.get('/transaction-status/:signature', async (req, res) => {
    try {
        const { signature } = req.params;

        const connection = new Connection(
            clusterApiUrl('mainnet-beta'),
            'confirmed'
        );

        // Get signature status
        const status = await connection.getSignatureStatus(signature);

        if (!status || !status.value) {
            return res.json({
                success: false,
                status: 'not_found',
                message: 'Transaction not found'
            });
        }

        const latestBlockHeight = await connection.getBlockHeight();
        const confirmations = status.value.confirmations || 
                            (status.value.confirmationStatus === 'finalized' ? 'finalized' :
                             latestBlockHeight - status.value.slot);

        res.json({
            success: true,
            status: status.value.confirmationStatus,
            confirmations,
            error: status.value.err
        });

    } catch (error) {
        console.error('Status check error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check status',
            error: error.message
        });
    }
});

// Get wallet balance
router.get('/wallet-balance/:address', async (req, res) => {
    try {
        const { address } = req.params;

        const connection = new Connection(
            clusterApiUrl('mainnet-beta'),
            'confirmed'
        );

        const publicKey = new PublicKey(address);
        const balance = await connection.getBalance(publicKey);

        res.json({
            success: true,
            address,
            balance: balance / 1000000000, // Convert lamports to SOL
            lamports: balance
        });

    } catch (error) {
        console.error('Balance check error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get balance',
            error: error.message
        });
    }
});

module.exports = router;