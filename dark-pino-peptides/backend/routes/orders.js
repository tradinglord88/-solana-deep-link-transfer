const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { sendOrderConfirmation } = require('../utils/emailService');

// Create validated order with blockchain confirmation
router.post('/validated', async (req, res) => {
    try {
        const orderData = req.body;
        
        // Generate order number if not provided
        const orderNumber = orderData.orderNumber || `DPP${Date.now().toString().slice(-8)}`;
        
        // Create new order with blockchain validation info
        const order = new Order({
            orderNumber: orderNumber,
            customer: orderData.customer,
            shipping: orderData.shipping || orderData.customer, // Use customer info for shipping if not provided
            items: orderData.items,
            payment: {
                ...orderData.payment,
                validated: true,
                validatedAt: new Date()
            },
            totals: {
                subtotal: orderData.subtotal,
                tax: orderData.tax || 0,
                shipping: orderData.shipping || 9.99,
                total: orderData.total
            },
            status: orderData.payment.method === 'solana_manual' ? 'pending_payment' : 'confirmed'
        });

        // Save order
        const savedOrder = await order.save();

        // Send confirmation email (if email service is configured)
        try {
            await sendOrderConfirmation(savedOrder);
        } catch (emailError) {
            console.log('Email not sent:', emailError.message);
        }

        res.status(201).json({
            success: true,
            message: 'Order validated and created successfully',
            order: savedOrder,
            orderNumber: savedOrder.orderNumber
        });
    } catch (error) {
        console.error('Validated order creation error:', error);
        res.status(400).json({
            success: false,
            message: 'Failed to create validated order',
            error: error.message
        });
    }
});

// Create new order
router.post('/', async (req, res) => {
    try {
        const orderData = req.body;
        
        // Create new order
        const order = new Order({
            customer: orderData.customer,
            shipping: orderData.shipping,
            items: orderData.items,
            payment: {
                method: orderData.paymentMethod,
                amount: orderData.total,
                status: 'pending'
            },
            totals: {
                subtotal: orderData.subtotal,
                tax: orderData.tax || 0,
                shipping: orderData.shippingCost || 9.99,
                total: orderData.total
            }
        });

        // Calculate total
        order.calculateTotal();

        // Save order
        const savedOrder = await order.save();

        // Send confirmation email (if email service is configured)
        try {
            await sendOrderConfirmation(savedOrder);
        } catch (emailError) {
            console.log('Email not sent:', emailError.message);
        }

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            order: savedOrder,
            orderNumber: savedOrder.orderNumber
        });
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(400).json({
            success: false,
            message: 'Failed to create order',
            error: error.message
        });
    }
});

// Get order by ID or order number
router.get('/:identifier', async (req, res) => {
    try {
        const { identifier } = req.params;
        
        // Try to find by ID first, then by order number
        let order = await Order.findById(identifier).catch(() => null);
        
        if (!order) {
            order = await Order.findOne({ orderNumber: identifier });
        }

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve order',
            error: error.message
        });
    }
});

// Update order status
router.patch('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, trackingNumber } = req.body;

        const order = await Order.findById(id);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        if (status) order.status = status;
        if (trackingNumber) order.trackingNumber = trackingNumber;
        
        await order.save();

        res.json({
            success: true,
            message: 'Order updated successfully',
            order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update order',
            error: error.message
        });
    }
});

// Get orders by email
router.get('/customer/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const orders = await Order.find({ 'customer.email': email })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve orders',
            error: error.message
        });
    }
});

// Update payment status
router.patch('/:id/payment', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, transactionId } = req.body;

        const order = await Order.findById(id);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        if (status) order.payment.status = status;
        if (transactionId) order.payment.transactionId = transactionId;
        
        // Update order status based on payment
        if (status === 'completed') {
            order.status = 'confirmed';
        } else if (status === 'failed') {
            order.status = 'cancelled';
        }

        await order.save();

        res.json({
            success: true,
            message: 'Payment status updated',
            order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update payment',
            error: error.message
        });
    }
});

module.exports = router;