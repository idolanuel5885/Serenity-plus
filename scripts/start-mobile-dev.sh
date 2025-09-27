#!/bin/bash

echo "📱 Starting Serenity Plus for Mobile Testing"
echo "==========================================="

# Kill any existing dev servers
echo "🔄 Stopping existing servers..."
pkill -f "npm run dev" || pkill -f "next dev" || true
sleep 2

# Get IP address
IP=$(ip addr show | grep "inet " | grep -v "127.0.0.1" | awk '{print $2}' | cut -d'/' -f1)
echo "🌐 Your IP address: $IP"

# Start server with hostname binding
echo "🚀 Starting server with mobile access..."
echo "📱 Mobile URL: http://$IP:3002"
echo "💻 Desktop URL: http://localhost:3002"
echo ""
echo "📱 To test on iPhone:"
echo "1. Make sure iPhone is on same WiFi"
echo "2. Open Safari and go to: http://$IP:3002"
echo "3. Tap Share → Add to Home Screen"
echo ""

npx next dev --hostname 0.0.0.0 --port 3002

