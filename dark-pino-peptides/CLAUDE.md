# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Dark Pino Peptides is a full-stack e-commerce application for premium research peptides with cryptocurrency payment integration. The application features a Node.js/Express backend with MongoDB, and a frontend that supports Solana wallet connections and payments.

## Development Commands

### Backend
```bash
# Start development server with auto-restart
cd backend && npm run dev

# Start production server
cd backend && npm start

# Start HTTPS development server (for wallet testing)
cd backend && npm run dev:https

# Install backend dependencies
cd backend && npm install
```

### Full Application
```bash
# Install all dependencies (root and backend)
npm run install-all

# Start the application
npm start

# Start development mode
npm run dev
```

## Architecture

### Backend Structure
- **Entry Point**: `backend/server.js` (HTTP) or `backend/server-https.js` (HTTPS)
- **Main App**: `backend/server-app.js` - Express configuration and middleware
- **Models**: MongoDB schemas in `backend/models/`
  - `Product.js` - Peptide products with auto-seeding
  - `Order.js` - Order management with payment tracking
- **Routes**: API endpoints in `backend/routes/`
  - `products.js` - Product CRUD operations
  - `orders.js` - Order management
  - `admin.js` - Admin authentication and order management
  - `payments.js` - Stripe and Solana payment processing

### Frontend Structure
- **Main Page**: `index.html` - E-commerce storefront
- **Admin Panel**: `admin.html` - Order management interface
- **Core Scripts**:
  - `script.js` - Main application logic with particles animation
  - `solana-payment-flow.js` - Solana wallet integration and payment processing
  - `admin.js` - Admin panel functionality
- **Wallet Integration**: Multiple Phantom wallet connection scripts for compatibility

### Payment Systems
- **Solana**: Phantom wallet integration with transaction validation
- **Stripe**: Credit card processing
- **E-transfer**: Manual payment method

### Database
MongoDB with two main collections:
- **products** - Auto-seeded with 12 research peptides
- **orders** - Complete order tracking with payment status

## Environment Configuration

The application uses environment variables for configuration:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `SOLANA_BUSINESS_WALLET` - Business wallet address for Solana payments

## Deployment

The application is configured for Vercel deployment with:
- Static frontend serving
- Serverless backend function
- MongoDB Atlas integration
- Environment variable management

See `DEPLOYMENT.md` for detailed deployment instructions.

## Phantom Wallet Integration

The application includes extensive Phantom wallet integration with multiple fallback scripts for cross-browser compatibility. If wallet connection issues occur, refer to `phantom-manual-fix.md` for troubleshooting steps.

## Key Features

- Responsive e-commerce interface with particle animations
- Multi-payment method support (Solana, Stripe, E-transfer)
- Real-time order management
- Admin dashboard with JWT authentication
- Automatic product seeding
- Cross-browser wallet compatibility