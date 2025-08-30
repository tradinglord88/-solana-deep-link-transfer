const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { authMiddleware } = require('../middleware/auth');

// Admin login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if admin credentials match (in production, store in database)
        if (email !== process.env.ADMIN_EMAIL) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // In production, hash the password and compare
        const isValidPassword = password === process.env.ADMIN_PASSWORD;

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { email, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token,
            admin: { email }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
});

// Get all orders (protected route)
router.get('/orders', authMiddleware, async (req, res) => {
    try {
        const { status, paymentStatus, dateFrom, dateTo, page = 1, limit = 20 } = req.query;
        
        let query = {};
        
        if (status) query.status = status;
        if (paymentStatus) query['payment.status'] = paymentStatus;
        if (dateFrom || dateTo) {
            query.createdAt = {};
            if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
            if (dateTo) query.createdAt.$lte = new Date(dateTo);
        }

        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Order.countDocuments(query);

        res.json({
            success: true,
            orders,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalOrders: count
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve orders',
            error: error.message
        });
    }
});

// Get dashboard statistics
router.get('/dashboard', authMiddleware, async (req, res) => {
    try {
        // Get order statistics
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ status: 'pending' });
        const completedOrders = await Order.countDocuments({ status: 'delivered' });
        
        // Get revenue statistics
        const orders = await Order.find({ 'payment.status': 'completed' });
        const totalRevenue = orders.reduce((sum, order) => sum + order.totals.total, 0);
        
        // Get today's orders
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayOrders = await Order.countDocuments({
            createdAt: { $gte: today }
        });

        // Get this month's revenue
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthOrders = await Order.find({
            createdAt: { $gte: firstDayOfMonth },
            'payment.status': 'completed'
        });
        const monthRevenue = monthOrders.reduce((sum, order) => sum + order.totals.total, 0);

        // Get product statistics
        const totalProducts = await Product.countDocuments();
        const outOfStock = await Product.countDocuments({ stock: 0 });

        // Get recent orders
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            success: true,
            stats: {
                orders: {
                    total: totalOrders,
                    pending: pendingOrders,
                    completed: completedOrders,
                    today: todayOrders
                },
                revenue: {
                    total: totalRevenue.toFixed(2),
                    thisMonth: monthRevenue.toFixed(2)
                },
                products: {
                    total: totalProducts,
                    outOfStock
                }
            },
            recentOrders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve dashboard data',
            error: error.message
        });
    }
});

// Update order (protected route)
router.put('/orders/:id', authMiddleware, async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            message: 'Order updated successfully',
            order
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Failed to update order',
            error: error.message
        });
    }
});

// Delete order (protected route)
router.delete('/orders/:id', authMiddleware, async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            message: 'Order deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete order',
            error: error.message
        });
    }
});

// Export orders as CSV
router.get('/orders/export', authMiddleware, async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        
        // Create CSV header
        let csv = 'Order Number,Date,Customer,Email,Total,Status,Payment Method,Payment Status\n';
        
        // Add order data
        orders.forEach(order => {
            csv += `${order.orderNumber},`;
            csv += `${order.createdAt.toLocaleDateString()},`;
            csv += `"${order.customer.firstName} ${order.customer.lastName}",`;
            csv += `${order.customer.email},`;
            csv += `$${order.totals.total.toFixed(2)},`;
            csv += `${order.status},`;
            csv += `${order.payment.method},`;
            csv += `${order.payment.status}\n`;
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=orders.csv');
        res.send(csv);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to export orders',
            error: error.message
        });
    }
});

module.exports = router;