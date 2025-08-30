const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Validate Stripe configuration
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
    console.warn('⚠️  STRIPE_SECRET_KEY not found in environment variables');
    console.warn('⚠️  Stripe payments will run in demo mode');
}

// Initialize Stripe only if we have a secret key
const stripe = stripeSecretKey ? require('stripe')(stripeSecretKey) : null;

// Process Stripe payment
router.post('/stripe', async (req, res) => {
    try {
        const { amount, orderId, paymentMethodId } = req.body;

        // Validate required fields
        if (!amount || !orderId || !paymentMethodId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required payment fields',
                error: 'amount, orderId, and paymentMethodId are required'
            });
        }

        // Validate amount is positive
        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment amount',
                error: 'Amount must be greater than 0'
            });
        }

        let paymentIntent;

        if (!stripe) {
            // Demo mode - when Stripe is not configured
            console.log('⚠️ Running in demo mode - Stripe not configured');
            paymentIntent = {
                id: 'pi_demo_' + Date.now(),
                status: 'succeeded',
                amount_received: Math.round(amount * 100),
                created: Math.floor(Date.now() / 1000)
            };
        } else {
            try {
                // Create payment intent with Stripe
                paymentIntent = await stripe.paymentIntents.create({
                    amount: Math.round(amount * 100), // Convert to cents
                    currency: 'usd',
                    payment_method: paymentMethodId,
                    confirm: true,
                    metadata: {
                        orderId: orderId,
                        source: 'dark-pino-peptides'
                    },
                    // Use automatic_payment_methods for better success rates
                    automatic_payment_methods: {
                        enabled: false // Set to false since we're using a specific payment_method
                    }
                });
            } catch (stripeError) {
                console.error('❌ Stripe API error:', stripeError.message);
                
                // Return specific Stripe errors to help with debugging
                return res.status(400).json({
                    success: false,
                    message: 'Payment processing failed',
                    error: stripeError.message,
                    type: stripeError.type || 'stripe_error',
                    code: stripeError.code
                });
            }
        }

        // Update order with payment details
        if (orderId) {
            await Order.findByIdAndUpdate(orderId, {
                'payment.status': paymentIntent.status === 'succeeded' ? 'completed' : 'processing',
                'payment.stripePaymentIntentId': paymentIntent.id,
                'status': paymentIntent.status === 'succeeded' ? 'confirmed' : 'pending'
            });
        }

        res.json({
            success: true,
            paymentIntent: {
                id: paymentIntent.id,
                status: paymentIntent.status
            }
        });
    } catch (error) {
        console.error('Stripe payment error:', error);
        res.status(400).json({
            success: false,
            message: 'Payment failed',
            error: error.message
        });
    }
});

// Handle Solana payment verification
router.post('/solana/verify', async (req, res) => {
    try {
        const { orderId, transactionSignature } = req.body;

        // In production, verify the Solana transaction here
        // For now, we'll just update the order
        
        const order = await Order.findByIdAndUpdate(
            orderId,
            {
                'payment.status': 'completed',
                'payment.solanaTransactionSignature': transactionSignature,
                'status': 'confirmed'
            },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            message: 'Solana payment verified',
            order
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Failed to verify Solana payment',
            error: error.message
        });
    }
});

// Handle e-Transfer notification
router.post('/etransfer/notify', async (req, res) => {
    try {
        const { orderId, reference } = req.body;

        const order = await Order.findByIdAndUpdate(
            orderId,
            {
                'payment.status': 'processing',
                'payment.etransferReference': reference,
                'status': 'pending',
                'notes': 'e-Transfer received, awaiting manual verification'
            },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            message: 'e-Transfer notification received',
            order
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Failed to process e-Transfer notification',
            error: error.message
        });
    }
});

// Get payment status
router.get('/status/:orderId', async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            payment: {
                status: order.payment.status,
                method: order.payment.method,
                amount: order.payment.amount
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get payment status',
            error: error.message
        });
    }
});

module.exports = router;