#!/bin/bash

# Recovery script for Serenity Plus
# Use this if files go missing again

echo "🔍 Serenity Plus Recovery Script"
echo "================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Not in Serenity Plus directory"
    exit 1
fi

# Check git status
echo "📊 Checking git status..."
git status --porcelain

# Show recent commits
echo ""
echo "📝 Recent commits:"
git log --oneline -5

# Show available branches
echo ""
echo "🌿 Available branches:"
git branch -a

# Offer recovery options
echo ""
echo "🛠️  Recovery Options:"
echo "1. Reset to last commit (git reset --hard HEAD)"
echo "2. Show what files changed (git diff)"
echo "3. Restore specific file (git checkout HEAD -- <file>)"
echo "4. Create new branch from current state"
echo "5. Exit"

read -p "Choose option (1-5): " choice

case $choice in
    1)
        echo "🔄 Resetting to last commit..."
        git reset --hard HEAD
        echo "✅ Reset complete"
        ;;
    2)
        echo "📋 Showing changes..."
        git diff
        ;;
    3)
        read -p "Enter file path to restore: " filepath
        git checkout HEAD -- "$filepath"
        echo "✅ File restored: $filepath"
        ;;
    4)
        read -p "Enter branch name: " branchname
        git checkout -b "$branchname"
        echo "✅ New branch created: $branchname"
        ;;
    5)
        echo "👋 Exiting..."
        exit 0
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac
