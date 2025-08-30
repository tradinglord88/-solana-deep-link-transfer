const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['growth', 'research', 'metabolic'],
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    specs: {
        dosage: { type: String },
        purity: { type: String },
        vialSize: { type: String }
    },
    benefits: [{
        type: String
    }],
    stock: {
        type: Number,
        default: 100
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    badge: {
        type: String,
        enum: ['Best Seller', 'New', 'Premium', 'Trending', null],
        default: null
    },
    image: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Seed initial products if database is empty
productSchema.statics.seedProducts = async function() {
    const count = await this.countDocuments();
    if (count === 0) {
        const products = [
            {
                name: 'BPC-157',
                description: 'Body Protection Compound - Promotes healing of muscles, tendons, and ligaments. Supports gut health and reduces inflammation.',
                category: 'growth',
                price: 89.99,
                specs: { dosage: '5mg', purity: '99.9%', vialSize: '5mg' },
                benefits: ['Tissue Repair', 'Gut Health'],
                badge: 'Best Seller'
            },
            {
                name: 'TB-500',
                description: 'Thymosin Beta-4 - Accelerates wound healing, reduces inflammation, and improves flexibility. Supports cardiovascular health.',
                category: 'growth',
                price: 94.99,
                specs: { dosage: '5mg', purity: '99.5%', vialSize: '5mg' },
                benefits: ['Recovery', 'Flexibility']
            },
            {
                name: 'GHK-Cu',
                description: 'Copper Peptide - Powerful anti-aging properties, stimulates collagen production, improves skin elasticity and hair growth.',
                category: 'research',
                price: 129.99,
                specs: { dosage: '50mg', purity: '99.1%', vialSize: '50mg' },
                benefits: ['Anti-Aging', 'Skin Health'],
                badge: 'Premium'
            },
            {
                name: 'Semaglutide',
                description: 'GLP-1 Agonist - Supports weight management, improves blood sugar control, reduces appetite and cardiovascular risk.',
                category: 'metabolic',
                price: 299.99,
                specs: { dosage: '3mg', purity: '99.8%', vialSize: '3mg' },
                benefits: ['Weight Loss', 'Metabolic'],
                badge: 'Trending'
            },
            {
                name: 'Tirzepatide',
                description: 'Dual GIP/GLP-1 Agonist - Advanced metabolic support, significant weight reduction, improved insulin sensitivity.',
                category: 'metabolic',
                price: 349.99,
                specs: { dosage: '5mg', purity: '99.7%', vialSize: '5mg' },
                benefits: ['Weight Loss', 'Diabetes'],
                badge: 'New'
            },
            {
                name: 'CJC-1295',
                description: 'Growth Hormone Releasing Hormone - Increases growth hormone production, improves sleep quality, enhances fat loss.',
                category: 'growth',
                price: 69.99,
                specs: { dosage: '2mg', purity: '99.6%', vialSize: '2mg' },
                benefits: ['GH Release', 'Sleep']
            },
            {
                name: 'Ipamorelin',
                description: 'Selective GH Secretagogue - Stimulates natural growth hormone release, improves bone density, enhances recovery.',
                category: 'growth',
                price: 59.99,
                specs: { dosage: '5mg', purity: '99.5%', vialSize: '5mg' },
                benefits: ['GH Release', 'Recovery']
            },
            {
                name: 'Melanotan II',
                description: 'Melanocortin Agonist - Promotes skin tanning, may support libido, potential appetite suppression.',
                category: 'research',
                price: 49.99,
                specs: { dosage: '10mg', purity: '99.3%', vialSize: '10mg' },
                benefits: ['Tanning', 'Libido']
            },
            {
                name: 'PT-141',
                description: 'Bremelanotide - Enhances libido and sexual function, works through nervous system rather than vascular system.',
                category: 'research',
                price: 69.99,
                specs: { dosage: '10mg', purity: '99.4%', vialSize: '10mg' },
                benefits: ['Libido', 'Sexual Health']
            },
            {
                name: 'Selank',
                description: 'Anxiolytic Peptide - Reduces anxiety and stress, improves cognitive function, enhances immune system.',
                category: 'research',
                price: 84.99,
                specs: { dosage: '10mg', purity: '99.4%', vialSize: '10mg' },
                benefits: ['Anti-Anxiety', 'Cognitive']
            },
            {
                name: 'Semax',
                description: 'Nootropic Peptide - Enhances cognitive performance, improves memory and focus, neuroprotective properties.',
                category: 'research',
                price: 99.99,
                specs: { dosage: '30mg', purity: '99.5%', vialSize: '30mg' },
                benefits: ['Nootropic', 'Focus']
            },
            {
                name: 'DSIP',
                description: 'Delta Sleep-Inducing Peptide - Promotes deep restorative sleep, reduces stress, normalizes blood pressure.',
                category: 'research',
                price: 54.99,
                specs: { dosage: '5mg', purity: '99.2%', vialSize: '5mg' },
                benefits: ['Sleep', 'Stress Relief']
            }
        ];

        await this.insertMany(products);
        console.log('✅ Products seeded successfully');
    }
};

module.exports = mongoose.model('Product', productSchema);