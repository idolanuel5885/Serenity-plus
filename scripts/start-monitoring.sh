#!/bin/bash

# Start monitoring for Serenity Plus
echo "🚀 Starting Serenity Plus Monitoring"
echo "===================================="

# Create logs directory
mkdir -p /home/idolanuel/logs/serenity-plus

# Start the monitoring dashboard
echo "📊 Starting monitoring dashboard..."
echo "   Run this in a separate terminal: npm run monitor"
echo ""

# Start health checks in background
echo "🔍 Starting background health checks..."
while true; do
    ./scripts/health-check.sh >> /home/idolanuel/logs/serenity-plus/health.log 2>&1
    
    # Check if server is down and attempt recovery
    if ! curl -s -f http://localhost:3000 > /dev/null 2>&1; then
        echo "$(date): Server down, attempting recovery..." >> /home/idolanuel/logs/serenity-plus/recovery.log
        ./scripts/auto-recovery.sh >> /home/idolanuel/logs/serenity-plus/recovery.log 2>&1
    fi
    
    sleep 300  # Check every 5 minutes
done
