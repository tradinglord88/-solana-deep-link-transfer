const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Initialize products in database
router.post('/seed', async (req, res) => {
    try {
        await Product.seedProducts();
        res.json({
            success: true,
            message: 'Products seeded successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to seed products',
            error: error.message
        });
    }
});

// Get all products
router.get('/', async (req, res) => {
    try {
        const { category, available } = req.query;
        
        let query = {};
        if (category) query.category = category;
        if (available !== undefined) query.isAvailable = available === 'true';

        const products = await Product.find(query);
        
        res.json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve products',
            error: error.message
        });
    }
});

// Get single product
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve product',
            error: error.message
        });
    }
});

// Create new product (admin only - add auth middleware later)
router.post('/', async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            product
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Failed to create product',
            error: error.message
        });
    }
});

// Update product (admin only - add auth middleware later)
router.put('/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            message: 'Product updated successfully',
            product
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Failed to update product',
            error: error.message
        });
    }
});

// Update product stock
router.patch('/:id/stock', async (req, res) => {
    try {
        const { stock } = req.body;
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        product.stock = stock;
        product.isAvailable = stock > 0;
        await product.save();

        res.json({
            success: true,
            message: 'Stock updated successfully',
            product
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Failed to update stock',
            error: error.message
        });
    }
});

// Delete product (admin only - add auth middleware later)
router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete product',
            error: error.message
        });
    }
});

module.exports = router;