#!/bin/bash

# Simple server startup script that actually works
echo "🚀 Starting Serenity Plus Server"
echo "================================"

# Kill any existing servers
pkill -f "next dev" || true
sleep 2

# Clean cache
rm -rf .next node_modules/.cache

# Start server
echo "🔄 Starting server..."
npm run dev &

# Wait for server to be ready
echo "⏳ Waiting for server to start..."
for i in {1..30}; do
    if curl -s -f http://localhost:3000 > /dev/null 2>&1; then
        echo "✅ Server is running at http://localhost:3000"
        echo "✅ Mobile access: http://100.115.92.195:3000"
        echo ""
        echo "🎯 Your app is ready!"
        echo "   - Homepage: http://localhost:3000"
        echo "   - Invite page: http://localhost:3000/invite"
        echo "   - Mobile: http://100.115.92.195:3000"
        echo ""
        echo "Press Ctrl+C to stop the server"
        exit 0
    fi
    sleep 1
done

echo "❌ Server failed to start after 30 seconds"
exit 1
