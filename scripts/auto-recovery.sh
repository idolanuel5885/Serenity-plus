#!/bin/bash

# Auto-recovery script for Serenity Plus
# This script will automatically fix common issues

echo "🔧 Serenity Plus Auto-Recovery"
echo "=============================="

# Function to check if server is healthy
check_server() {
    curl -s -f http://localhost:3000 > /dev/null 2>&1
}

# Function to restart server
restart_server() {
    echo "🔄 Restarting server..."
    pkill -f "next dev" || true
    sleep 2
    rm -rf .next node_modules/.cache
    npm run dev &
    sleep 10
}

# Check server health
if ! check_server; then
    echo "❌ Server is unhealthy, attempting recovery..."
    restart_server
    
    # Wait and check again
    sleep 5
    if check_server; then
        echo "✅ Server recovered successfully"
    else
        echo "❌ Auto-recovery failed, manual intervention needed"
        exit 1
    fi
else
    echo "✅ Server is healthy"
fi

# Check for missing files and restore them
echo ""
echo "📁 Checking for missing files..."

# Critical files that should exist
critical_files=(
    "src/app/page.tsx"
    "src/app/welcome/page.tsx"
    "src/app/nickname/page.tsx"
    "src/app/meditations-per-week/page.tsx"
    "src/app/meditation-length/page.tsx"
    "src/app/invite/page.tsx"
    "public/logo.svg"
    "public/manifest.json"
    "public/sw.js"
)

missing_files=()

for file in "${critical_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
        echo "❌ Missing: $file"
    else
        echo "✅ Present: $file"
    fi
done

# If critical files are missing, restore from git
if [ ${#missing_files[@]} -gt 0 ]; then
    echo ""
    echo "🔧 Restoring missing files from git..."
    git checkout HEAD -- "${missing_files[@]}" 2>/dev/null || echo "⚠️  Some files couldn't be restored from git"
fi

# Check git status and auto-commit if needed
echo ""
echo "📊 Checking git status..."
if git status --porcelain | grep -q .; then
    echo "🔄 Auto-committing changes..."
    git add .
    git commit -m "Auto-recovery: $(date)" || echo "⚠️  Auto-commit failed"
else
    echo "✅ No uncommitted changes"
fi

# Final health check
echo ""
echo "🎯 Final health check..."
if check_server; then
    echo "✅ System is fully operational"
    exit 0
else
    echo "❌ System still has issues"
    exit 1
fi


