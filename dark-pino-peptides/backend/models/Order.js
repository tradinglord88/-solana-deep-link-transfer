const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true,
        default: function() {
            return 'ORD-' + Date.now().toString().slice(-8);
        }
    },
    customer: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true }
    },
    shipping: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true },
        country: { type: String, required: true },
        notes: { type: String }
    },
    items: [{
        productId: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        specs: { type: String }
    }],
    payment: {
        method: {
            type: String,
            enum: ['card', 'solana', 'etransfer'],
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
            default: 'pending'
        },
        transactionId: { type: String },
        amount: { type: Number, required: true },
        currency: {
            type: String,
            default: 'USD'
        },
        stripePaymentIntentId: { type: String },
        solanaTransactionSignature: { type: String },
        etransferReference: { type: String }
    },
    totals: {
        subtotal: { type: Number, required: true },
        tax: { type: Number, default: 0 },
        shipping: { type: Number, default: 9.99 },
        total: { type: Number, required: true }
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    trackingNumber: { type: String },
    notes: { type: String },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp on save
orderSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Virtual for formatted date
orderSchema.virtual('formattedDate').get(function() {
    return this.createdAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
});

// Method to calculate total
orderSchema.methods.calculateTotal = function() {
    this.totals.subtotal = this.items.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
    }, 0);
    this.totals.tax = this.totals.subtotal * 0.13; // 13% tax
    this.totals.total = this.totals.subtotal + this.totals.tax + this.totals.shipping;
    return this.totals.total;
};

module.exports = mongoose.model('Order', orderSchema);