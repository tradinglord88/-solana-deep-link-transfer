// HTTP Server - keeps backward compatibility
const app = require('./server-app');

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`
    🚀 Dark Pino Peptides Backend Server
    =====================================
    🌐 Server running on http://localhost:${PORT}
    📊 API Endpoints:
       - GET    /api/health          - Health check
       - GET    /api/products        - Get all products
       - POST   /api/orders          - Create new order
       - GET    /api/orders/:id      - Get order by ID
       - GET    /api/admin/orders    - Get all orders (admin)
       - POST   /api/admin/login     - Admin login
       - POST   /api/payments/stripe - Process Stripe payment
    =====================================
    `);
});