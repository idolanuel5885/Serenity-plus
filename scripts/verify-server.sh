#!/bin/bash

echo "🔍 Verifying Server Status"
echo "========================="

# Get IP address
IP=$(ip addr show | grep "inet " | grep -v "127.0.0.1" | awk '{print $2}' | cut -d'/' -f1)
echo "🌐 IP Address: $IP"

# Check if server is running
echo ""
echo "🔍 Checking server processes..."
if pgrep -f "next dev" > /dev/null; then
    echo "✅ Next.js server process is running"
else
    echo "❌ Next.js server process is NOT running"
    exit 1
fi

# Test localhost access
echo ""
echo "🔍 Testing localhost:3002..."
if curl -s -f http://localhost:3002 > /dev/null; then
    echo "✅ localhost:3002 - OK"
else
    echo "❌ localhost:3002 - FAILED"
    exit 1
fi

# Test network IP access
echo ""
echo "🔍 Testing $IP:3002..."
if curl -s -f http://$IP:3002 > /dev/null; then
    echo "✅ $IP:3002 - OK"
    echo ""
    echo "🎉 Server is fully accessible!"
    echo "📱 iPhone URL: http://$IP:3002"
    echo "💻 Local URL: http://localhost:3002"
else
    echo "❌ $IP:3002 - FAILED"
    echo ""
    echo "🚨 Server is NOT accessible from network!"
    echo "This means iPhone won't be able to connect."
    exit 1
fi

echo ""
echo "✅ All tests passed - server is ready for iPhone testing!"
