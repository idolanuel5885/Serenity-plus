#!/bin/bash

# Bulletproof server manager for Serenity Plus
# This script ensures the server NEVER goes down

echo "🛡️  Bulletproof Server Manager"
echo "==============================="

# Function to check if server is healthy
is_server_healthy() {
    curl -s -f http://localhost:3000 > /dev/null 2>&1
}

# Function to kill all existing servers
kill_all_servers() {
    echo "🔄 Killing all existing servers..."
    pkill -f "next dev" || true
    pkill -f "npm run dev" || true
    sleep 3
}

# Function to clean everything
clean_everything() {
    echo "🧹 Deep cleaning..."
    kill_all_servers
    rm -rf .next
    rm -rf node_modules/.cache
    rm -rf .turbo
    echo "✅ Deep clean complete"
}

# Function to start server with retry logic
start_server_bulletproof() {
    echo "🚀 Starting bulletproof server..."
    
    local attempts=0
    local max_attempts=5
    
    while [ $attempts -lt $max_attempts ]; do
        echo "Attempt $((attempts + 1))/$max_attempts"
        
        # Start server in background
        npm run dev > /dev/null 2>&1 &
        local server_pid=$!
        
        # Wait for server to start
        local wait_time=0
        while [ $wait_time -lt 30 ]; do
            if is_server_healthy; then
                echo "✅ Server started successfully (PID: $server_pid)"
                echo "$server_pid" > .server.pid
                return 0
            fi
            sleep 1
            wait_time=$((wait_time + 1))
        done
        
        # If server didn't start, kill it and try again
        kill $server_pid 2>/dev/null || true
        attempts=$((attempts + 1))
        
        if [ $attempts -lt $max_attempts ]; then
            echo "❌ Server failed to start, retrying..."
            clean_everything
        fi
    done
    
    echo "💥 Failed to start server after $max_attempts attempts"
    return 1
}

# Function to monitor and restart if needed
monitor_server() {
    echo "👁️  Starting server monitoring..."
    
    while true; do
        if ! is_server_healthy; then
            echo "❌ Server is down! Restarting..."
            kill_all_servers
            start_server_bulletproof
        else
            echo "✅ Server is healthy"
        fi
        
        sleep 10  # Check every 10 seconds
    done
}

# Main execution
echo "🔍 Checking current server status..."

if is_server_healthy; then
    echo "✅ Server is already running and healthy"
else
    echo "❌ Server is not healthy, starting bulletproof mode..."
    clean_everything
    start_server_bulletproof
fi

# Start monitoring in background
echo "🔄 Starting background monitoring..."
monitor_server &
echo "✅ Bulletproof server manager is running"
echo "   Server will auto-restart if it goes down"
echo "   Press Ctrl+C to stop monitoring"
