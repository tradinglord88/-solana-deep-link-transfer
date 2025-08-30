const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Import the existing server configuration
const app = require('./server-app');

// Check if SSL certificates exist, if not create self-signed ones
const sslPath = path.join(__dirname, 'ssl');
if (!fs.existsSync(sslPath)) {
    fs.mkdirSync(sslPath);
}

// Create self-signed certificate for localhost if it doesn't exist
const keyPath = path.join(sslPath, 'localhost-key.pem');
const certPath = path.join(sslPath, 'localhost.pem');

if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    console.log('⚠️  SSL certificates not found. Please create them first.');
    console.log('Run the following commands:');
    console.log(`
cd backend
mkdir -p ssl
# Generate a self-signed certificate for localhost
openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' \\
  -keyout ssl/localhost-key.pem -out ssl/localhost.pem -days 365
    `);
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
const PORT = process.env.PORT || 5001;
const httpsServer = https.createServer(credentials, app);

httpsServer.listen(PORT, () => {
    console.log(`
    🚀 Dark Pino Peptides Backend Server (HTTPS)
    =====================================
    🔒 Server running on https://localhost:${PORT}
    ✅ Credit card autofill enabled
    📊 API Endpoints available at https://localhost:${PORT}/api
    
    ⚠️  Note: Browser may warn about self-signed certificate.
       Click "Advanced" and "Proceed to localhost" to continue.
    `);
});