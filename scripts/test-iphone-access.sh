#!/bin/bash

echo "📱 Testing iPhone Access"
echo "======================="

# Get IP address
IP=$(ip addr show | grep "inet " | grep -v "127.0.0.1" | awk '{print $2}' | cut -d'/' -f1)
echo "🌐 Your IP address: $IP"

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
fi

echo ""
echo "📱 iPhone Testing Instructions:"
echo "1. Make sure your iPhone is on the same WiFi network"
echo "2. Open Safari and go to: http://$IP:3000"
echo "3. If it loads, tap Share → Add to Home Screen"
echo "4. Test the PWA features"

echo ""
echo "🔧 If iPhone still can't connect:"
echo "1. Check if iPhone is on same WiFi network"
echo "2. Try restarting your iPhone's WiFi"
echo "3. Check if your router has client isolation enabled"
echo "4. Try using a different port (3001, 3002, etc.)"


