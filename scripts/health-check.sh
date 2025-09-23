#!/bin/bash

# Comprehensive health check script for Serenity Plus
# This script will detect issues before you do

echo "🔍 Serenity Plus Health Check"
echo "============================="

# Check if server is running
echo "📡 Checking server status..."
if curl -s -f http://localhost:3000 > /dev/null; then
    echo "✅ Server is running (HTTP 200)"
else
    echo "❌ Server is down or returning errors"
    echo "🔧 Attempting to restart server..."
    
    # Kill any existing processes
    pkill -f "next dev" || true
    sleep 2
    
    # Clear corrupted cache
    rm -rf .next node_modules/.cache
    
    # Restart server
    npm run dev &
    sleep 10
    
    # Check again
    if curl -s -f http://localhost:3000 > /dev/null; then
        echo "✅ Server restarted successfully"
    else
        echo "❌ Server restart failed"
        exit 1
    fi
fi

# Check critical pages
echo ""
echo "📄 Checking critical pages..."

pages=("/" "/welcome" "/nickname" "/meditations-per-week" "/meditation-length" "/invite")

for page in "${pages[@]}"; do
    if curl -s -f "http://localhost:3000$page" > /dev/null; then
        echo "✅ $page - OK"
    else
        echo "❌ $page - FAILED"
    fi
done

# Check QR code functionality
echo ""
echo "🔲 Checking QR code generation..."
if curl -s "http://localhost:3000/invite" | grep -q "QR Code"; then
    echo "✅ QR code section present"
else
    echo "❌ QR code section missing"
fi

# Check logo visibility
echo ""
echo "🎨 Checking logo visibility..."
if curl -s "http://localhost:3000" | grep -q "logo.svg"; then
    echo "✅ Logo is present"
else
    echo "❌ Logo is missing"
fi

# Check PWA files
echo ""
echo "📱 Checking PWA files..."
if [ -f "public/manifest.json" ] && [ -f "public/sw.js" ]; then
    echo "✅ PWA files present"
else
    echo "❌ PWA files missing"
fi

# Check git status
echo ""
echo "📊 Checking git status..."
if git status --porcelain | grep -q .; then
    echo "⚠️  Uncommitted changes detected"
    echo "   Run: git add . && git commit -m 'Auto-commit: $(date)'"
else
    echo "✅ All changes committed"
fi

# Check disk space
echo ""
echo "💾 Checking disk space..."
df -h . | tail -1 | awk '{if ($5+0 > 90) print "❌ Disk space low: " $5; else print "✅ Disk space OK: " $5}'

echo ""
echo "🎯 Health check complete!"
