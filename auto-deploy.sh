#!/bin/bash

echo "🚀 Auto-deploying Serenity+ PWA..."

# Create a simple public hosting solution
cd out

# Start a simple HTTP server
echo "📦 Starting public server..."
python3 -m http.server 9000 --bind 0.0.0.0 &
SERVER_PID=$!

# Wait for server to start
sleep 2

# Get the public IP
PUBLIC_IP=$(hostname -I | awk '{print $1}')
echo "🌐 Your PWA is now live at: http://$PUBLIC_IP:9000"
echo "📱 Test it on your phone: http://$PUBLIC_IP:9000"
echo "🔗 Share this URL with anyone!"

# Keep the server running
echo "⏳ Server running... Press Ctrl+C to stop"
wait $SERVER_PID
