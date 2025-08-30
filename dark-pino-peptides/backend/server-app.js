const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like file:// or Postman)
        if (!origin) return callback(null, true);
        
        // Allow all origins in development
        return callback(null, true);
    },
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/darkpino_peptides', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected Successfully'))
.catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    console.log('💡 Make sure MongoDB is installed and running');
    console.log('   Run: brew services start mongodb-community');
});

// Import Routes
const orderRoutes = require('./routes/orders');
const productRoutes = require('./routes/products');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payments');

// API Routes
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Dark Pino Peptides Backend is running',
        timestamp: new Date(),
        environment: process.env.NODE_ENV
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

module.exports = app;