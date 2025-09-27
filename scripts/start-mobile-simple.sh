#!/bin/bash

echo "📱 Starting Serenity Plus for Mobile Testing (Simple Method)"
echo "=========================================================="

# Kill any existing servers
pkill -f "npm run dev" || pkill -f "next dev" || true
sleep 2

# Get IP address
IP=$(ip addr show | grep "inet " | grep -v "127.0.0.1" | awk '{print $2}' | cut -d'/' -f1)
echo "🌐 Your IP address: $IP"

echo ""
echo "🚀 Starting server..."
echo "📱 Mobile URL: http://$IP:3000"
echo "💻 Desktop URL: http://localhost:3000"
echo ""

# Start server with explicit hostname
echo "Starting Next.js with hostname binding..."
HOSTNAME=0.0.0.0 PORT=3000 npm run dev


