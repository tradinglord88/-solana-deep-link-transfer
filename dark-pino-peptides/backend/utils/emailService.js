const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
    // If email is not configured, return null
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('Email service not configured');
        return null;
    }

    return nodemailer.createTransporter({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

// Send order confirmation email
const sendOrderConfirmation = async (order) => {
    const transporter = createTransporter();
    
    if (!transporter) {
        console.log('Email not sent - service not configured');
        return;
    }

    const itemsList = order.items.map(item => 
        `• ${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');

    const mailOptions = {
        from: process.env.EMAIL_FROM || 'Dark Pino Peptides <noreply@darkpinopeptides.com>',
        to: order.customer.email,
        subject: `Order Confirmation - ${order.orderNumber}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #8b5cf6, #ec4899); padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0;">DARK PINO PEPTIDES</h1>
                    <p style="color: white; margin: 5px 0;">Show Me The Light</p>
                </div>
                
                <div style="padding: 30px; background: #f5f5f5;">
                    <h2 style="color: #333;">Order Confirmation</h2>
                    <p>Thank you for your order, ${order.customer.firstName}!</p>
                    
                    <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <h3 style="color: #8b5cf6;">Order Details</h3>
                        <p><strong>Order Number:</strong> ${order.orderNumber}</p>
                        <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                        <p><strong>Status:</strong> ${order.status}</p>
                    </div>
                    
                    <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <h3 style="color: #8b5cf6;">Items Ordered</h3>
                        <pre style="font-family: Arial, sans-serif;">${itemsList}</pre>
                        <hr style="border: 1px solid #eee; margin: 15px 0;">
                        <p><strong>Subtotal:</strong> $${order.totals.subtotal.toFixed(2)}</p>
                        <p><strong>Tax:</strong> $${order.totals.tax.toFixed(2)}</p>
                        <p><strong>Shipping:</strong> $${order.totals.shipping.toFixed(2)}</p>
                        <h3 style="color: #8b5cf6;">Total: $${order.totals.total.toFixed(2)}</h3>
                    </div>
                    
                    <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <h3 style="color: #8b5cf6;">Shipping Address</h3>
                        <p>
                            ${order.customer.firstName} ${order.customer.lastName}<br>
                            ${order.shipping.address}<br>
                            ${order.shipping.city}, ${order.shipping.state} ${order.shipping.zipCode}<br>
                            ${order.shipping.country}
                        </p>
                    </div>
                    
                    <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <h3 style="color: #8b5cf6;">Payment Information</h3>
                        <p><strong>Method:</strong> ${order.payment.method}</p>
                        <p><strong>Status:</strong> ${order.payment.status}</p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <p style="color: #666;">
                            If you have any questions about your order, please contact us at<br>
                            <a href="mailto:support@darkpinopeptides.com" style="color: #8b5cf6;">support@darkpinopeptides.com</a>
                        </p>
                    </div>
                </div>
                
                <div style="background: #333; color: white; padding: 20px; text-align: center;">
                    <p style="margin: 0;">© 2024 Dark Pino Peptides. All rights reserved.</p>
                </div>
            </div>
        `,
        text: `
            Order Confirmation - ${order.orderNumber}
            
            Thank you for your order, ${order.customer.firstName}!
            
            Order Details:
            - Order Number: ${order.orderNumber}
            - Date: ${new Date(order.createdAt).toLocaleDateString()}
            - Status: ${order.status}
            
            Items:
            ${itemsList}
            
            Total: $${order.totals.total.toFixed(2)}
            
            Shipping to:
            ${order.customer.firstName} ${order.customer.lastName}
            ${order.shipping.address}
            ${order.shipping.city}, ${order.shipping.state} ${order.shipping.zipCode}
            ${order.shipping.country}
            
            Questions? Contact us at support@darkpinopeptides.com
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Order confirmation email sent to:', order.customer.email);
    } catch (error) {
        console.error('Failed to send email:', error);
        throw error;
    }
};

// Send order status update email
const sendOrderStatusUpdate = async (order, newStatus) => {
    const transporter = createTransporter();
    
    if (!transporter) {
        return;
    }

    const statusMessages = {
        'confirmed': 'Your order has been confirmed and is being processed.',
        'processing': 'Your order is being prepared for shipment.',
        'shipped': `Your order has been shipped! Tracking: ${order.trackingNumber || 'N/A'}`,
        'delivered': 'Your order has been delivered. Enjoy your peptides!',
        'cancelled': 'Your order has been cancelled. A refund will be processed if applicable.'
    };

    const mailOptions = {
        from: process.env.EMAIL_FROM || 'Dark Pino Peptides <noreply@darkpinopeptides.com>',
        to: order.customer.email,
        subject: `Order ${order.orderNumber} - Status Update`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #8b5cf6, #ec4899); padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0;">DARK PINO PEPTIDES</h1>
                </div>
                
                <div style="padding: 30px; background: #f5f5f5;">
                    <h2 style="color: #333;">Order Status Update</h2>
                    <p>Hello ${order.customer.firstName},</p>
                    
                    <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <h3 style="color: #8b5cf6;">Status: ${newStatus.toUpperCase()}</h3>
                        <p>${statusMessages[newStatus] || 'Your order status has been updated.'}</p>
                        <p><strong>Order Number:</strong> ${order.orderNumber}</p>
                    </div>
                    
                    ${order.trackingNumber ? `
                    <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <h3 style="color: #8b5cf6;">Tracking Information</h3>
                        <p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>
                    </div>
                    ` : ''}
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Status update email sent to:', order.customer.email);
    } catch (error) {
        console.error('Failed to send status update email:', error);
    }
};

module.exports = {
    sendOrderConfirmation,
    sendOrderStatusUpdate
};