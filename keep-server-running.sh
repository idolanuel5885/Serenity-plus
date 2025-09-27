#!/bin/bash

# Simple script to keep the server running
echo "🚀 Starting Serenity Plus Server"
echo "================================"

# Kill any existing servers
pkill -f "next dev" || true
sleep 2

# Clean cache
rm -rf .next

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
        
        # Keep the script running to maintain the server
        while true; do
            sleep 10
            if ! curl -s -f http://localhost:3000 > /dev/null 2>&1; then
                echo "❌ Server went down, restarting..."
                pkill -f "next dev" || true
                sleep 2
                npm run dev &
                sleep 10
            fi
        done
    fi
    sleep 1
done

echo "❌ Server failed to start after 30 seconds"
exit 1


