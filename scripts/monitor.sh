#!/bin/bash

# Real-time monitoring dashboard for Serenity Plus
# This script provides continuous monitoring

echo "📊 Serenity Plus Monitoring Dashboard"
echo "======================================"
echo "Press Ctrl+C to stop monitoring"
echo ""

# Function to get server status
get_server_status() {
    if curl -s -f http://localhost:3000 > /dev/null 2>&1; then
        echo "🟢 ONLINE"
    else
        echo "🔴 OFFLINE"
    fi
}

# Function to get response time
get_response_time() {
    local start_time=$(date +%s%N)
    if curl -s -f http://localhost:3000 > /dev/null 2>&1; then
        local end_time=$(date +%s%N)
        local duration=$(( (end_time - start_time) / 1000000 ))
        echo "${duration}ms"
    else
        echo "N/A"
    fi
}

# Function to check memory usage
get_memory_usage() {
    ps aux | grep "next dev" | grep -v grep | awk '{sum+=$6} END {if(sum) print sum/1024 "MB"; else print "0MB"}'
}

# Function to check disk usage
get_disk_usage() {
    df -h . | tail -1 | awk '{print $5}'
}

# Main monitoring loop
while true; do
    clear
    echo "📊 Serenity Plus Monitoring Dashboard"
    echo "======================================"
    echo "Time: $(date)"
    echo ""
    
    echo "🖥️  Server Status: $(get_server_status)"
    echo "⏱️  Response Time: $(get_response_time)"
    echo "💾 Memory Usage: $(get_memory_usage)"
    echo "💿 Disk Usage: $(get_disk_usage)"
    echo ""
    
    echo "🔍 Quick Checks:"
    
    # Check critical pages
    pages=("/" "/welcome" "/invite")
    for page in "${pages[@]}"; do
        if curl -s -f "http://localhost:3000$page" > /dev/null 2>&1; then
            echo "  ✅ $page"
        else
            echo "  ❌ $page"
        fi
    done
    
    echo ""
    echo "🔄 Refreshing in 5 seconds... (Ctrl+C to stop)"
    sleep 5
done


