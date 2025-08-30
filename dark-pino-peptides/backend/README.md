# Dark Pino Peptides Backend

## Setup Instructions

### 1. Install MongoDB
```bash
# On macOS
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# On Windows/Linux
# Download from https://www.mongodb.com/try/download/community
```

### 2. Install Dependencies
```bash
cd backend
npm install
```

### 3. Configure Environment Variables
Edit the `.env` file with your settings:
- MongoDB connection string
- Admin credentials
- Stripe API keys (optional)
- Email settings (optional)

### 4. Start the Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will run on http://localhost:5000

## API Endpoints

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order by ID or order number
- `PATCH /api/orders/:id/status` - Update order status
- `PATCH /api/orders/:id/payment` - Update payment status
- `GET /api/orders/customer/:email` - Get orders by customer email

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)
- `POST /api/products/seed` - Seed initial products

### Admin
- `POST /api/admin/login` - Admin login
- `GET /api/admin/orders` - Get all orders (protected)
- `GET /api/admin/dashboard` - Get dashboard stats (protected)
- `PUT /api/admin/orders/:id` - Update order (protected)
- `DELETE /api/admin/orders/:id` - Delete order (protected)
- `GET /api/admin/orders/export` - Export orders as CSV (protected)

### Payments
- `POST /api/payments/stripe` - Process Stripe payment
- `POST /api/payments/solana/verify` - Verify Solana payment
- `POST /api/payments/etransfer/notify` - e-Transfer notification
- `GET /api/payments/status/:orderId` - Get payment status

## Testing the API

### 1. Seed Products
```bash
curl -X POST http://localhost:5000/api/products/seed
```

### 2. Get All Products
```bash
curl http://localhost:5000/api/products
```

### 3. Create Test Order
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "555-1234"
    },
    "shipping": {
      "address": "123 Main St",
      "city": "Toronto",
      "state": "ON",
      "zipCode": "M1M 1M1",
      "country": "Canada"
    },
    "items": [{
      "productId": "1",
      "name": "BPC-157",
      "price": 89.99,
      "quantity": 1,
      "specs": "5mg"
    }],
    "paymentMethod": "card",
    "subtotal": 89.99,
    "tax": 11.70,
    "shippingCost": 9.99,
    "total": 111.68
  }'
```

### 4. Admin Login
```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@darkpinopeptides.com",
    "password": "DarkPino2024!"
  }'
```

## Admin Credentials
- Email: admin@darkpinopeptides.com
- Password: DarkPino2024!

## Frontend Integration

Update your frontend JavaScript to point to the backend API:

```javascript
const API_URL = 'http://localhost:5000/api';

// Example: Create order
async function createOrder(orderData) {
    const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
    });
    return response.json();
}
```

## Production Deployment

1. Set up MongoDB Atlas for cloud database
2. Configure environment variables for production
3. Deploy to Heroku, Railway, or your preferred hosting
4. Update CORS settings for your domain
5. Set up SSL certificates
6. Configure Stripe webhooks for production

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running: `brew services list`
- Check connection string in `.env`
- For MongoDB Atlas, whitelist your IP address

### Email Not Sending
- Configure Gmail app-specific password
- Enable "Less secure app access" (not recommended for production)
- Consider using SendGrid or another email service

### Stripe Payments Not Working
- Add your Stripe secret key to `.env`
- Test with Stripe test cards
- Check Stripe dashboard for logs