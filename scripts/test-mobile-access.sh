#!/bin/bash

echo "📱 Testing Mobile Access for PWA"
echo "================================"

# Get the current IP
IP=$(ip addr show | grep "inet " | grep -v "127.0.0.1" | awk '{print $2}' | cut -d'/' -f1)
echo "Your IP address: $IP"

echo ""
echo "🔍 Testing server accessibility..."

# Test localhost
echo "Testing localhost:3000..."
if curl -s -f http://localhost:3000 > /dev/null; then
    echo "✅ localhost:3000 - OK"
else
    echo "❌ localhost:3000 - FAILED"
fi

# Test IP access
echo "Testing $IP:3000..."
if curl -s -f http://$IP:3000 > /dev/null; then
    echo "✅ $IP:3000 - OK"
else
    echo "❌ $IP:3000 - FAILED"
    echo "🔧 Server might not be bound to all interfaces"
fi

echo ""
echo "📱 Mobile Testing Instructions:"
echo "1. Connect your iPhone to the same WiFi network"
echo "2. Open Safari and go to: http://$IP:3000"
echo "3. If it loads, tap Share → Add to Home Screen"
echo "4. Test the PWA features"

echo ""
echo "🔧 If mobile access fails:"
echo "1. Check if your iPhone is on the same WiFi"
echo "2. Try restarting the server with: npm run dev"
echo "3. Check firewall settings"


