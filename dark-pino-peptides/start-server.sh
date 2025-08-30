#!/bin/bash

# Simple server starter for Dark Pino Peptides
echo "🚀 Starting Dark Pino Peptides Server..."
echo "=====================================\n"

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
    echo "✅ Python 3 found"
    echo "📌 Starting server on http://localhost:8000"
    echo "📌 Press Ctrl+C to stop the server\n"
    echo "🌐 Opening browser..."
    
    # Open browser after a short delay
    (sleep 2 && open http://localhost:8000) &
    
    # Start Python server
    python3 -m http.server 8000
    
elif command -v python &> /dev/null; then
    echo "✅ Python 2 found"
    echo "📌 Starting server on http://localhost:8000"
    echo "📌 Press Ctrl+C to stop the server\n"
    echo "🌐 Opening browser..."
    
    # Open browser after a short delay
    (sleep 2 && open http://localhost:8000) &
    
    # Start Python server
    python -m SimpleHTTPServer 8000
    
else
    echo "❌ Python not found!"
    echo "Please install Python or use another method to serve the files."
    echo "\nAlternatives:"
    echo "1. Use VS Code Live Server extension"
    echo "2. Use Node.js: npx http-server"
    echo "3. Use PHP: php -S localhost:8000"
fi