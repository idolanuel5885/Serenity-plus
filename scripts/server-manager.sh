#!/bin/bash

# Robust server management for Serenity Plus
# This script ensures the server is always running properly

echo "🖥️  Serenity Plus Server Manager"
echo "================================"

# Function to check if server is healthy
is_server_healthy() {
    curl -s -f http://localhost:3000 > /dev/null 2>&1
}

# Function to clean build cache
clean_cache() {
    echo "🧹 Cleaning build cache..."
    pkill -f "next dev" || true
    sleep 2
    rm -rf .next node_modules/.cache
    echo "✅ Cache cleaned"
}

# Function to start server
start_server() {
    echo "🚀 Starting server..."
    npm run dev &
    sleep 10
    
    # Wait for server to be ready
    local attempts=0
    while [ $attempts -lt 30 ]; do
        if is_server_healthy; then
            echo "✅ Server started successfully"
            return 0
        fi
        sleep 2
        attempts=$((attempts + 1))
    done
    
    echo "❌ Server failed to start after 60 seconds"
    return 1
}

# Function to restart server
restart_server() {
    echo "🔄 Restarting server..."
    clean_cache
    start_server
}

# Main logic
if is_server_healthy; then
    echo "✅ Server is already running and healthy"
else
    echo "❌ Server is not healthy, attempting to fix..."
    restart_server
fi

# Final check
if is_server_healthy; then
    echo "🎯 Server is operational at http://localhost:3000"
    exit 0
else
    echo "💥 Server is still not working, manual intervention needed"
    exit 1
fi


