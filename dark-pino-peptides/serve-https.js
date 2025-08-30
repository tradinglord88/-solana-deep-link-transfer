const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');

const app = express();

// Serve static files from current directory
app.use(express.static('.'));

// Default to index.html for root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Check if SSL certificates exist
const keyPath = path.join(__dirname, 'backend', 'ssl', 'localhost-key.pem');
const certPath = path.join(__dirname, 'backend', 'ssl', 'localhost.pem');

if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    console.log('⚠️  SSL certificates not found in backend/ssl/');
    console.log('Please run the backend server first to generate certificates.');
    process.exit(1);
}

// Read SSL certificates
const privateKey = fs.readFileSync(keyPath, 'utf8');
const certificate = fs.readFileSync(certPath, 'utf8');

const credentials = {
    key: privateKey,
    cert: certificate
};

// Create HTTPS server
const PORT = 8443; // Standard HTTPS port for development
const httpsServer = https.createServer(credentials, app);

httpsServer.listen(PORT, () => {
    console.log(`
    🔒 Dark Pino Peptides - HTTPS Server
    =====================================
    🌐 Website: https://localhost:${PORT}
    ✅ Credit card autofill enabled
    🔐 Secure connection established
    
    ⚠️  First time setup:
    1. Browser will show security warning
    2. Click "Advanced" or "Show Details"
    3. Click "Proceed to localhost" or "Visit this website"
    4. This is normal for self-signed certificates
    
    📝 Payment testing:
    - Use test card: 4242 4242 4242 4242
    - Any future expiry date
    - Any 3-digit CVC
    `);
});