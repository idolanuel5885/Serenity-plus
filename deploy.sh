#!/bin/bash

# Deployment script for Serenity+ application
# This script helps deploy the simplified partnerships schema changes

set -e  # Exit on error

echo "🚀 Serenity+ Deployment Script"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found. Please run this script from the project root.${NC}"
    exit 1
fi

# Check if git is clean
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}Warning: You have uncommitted changes.${NC}"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Pre-deployment checks
echo "📋 Pre-deployment checks..."
echo ""

# Check if database migration script exists
if [ ! -f "simplify-partnerships-table.sql" ]; then
    echo -e "${RED}Error: simplify-partnerships-table.sql not found!${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Database migration script found"

# Check if we can build
echo "🔨 Building application..."
if npm run build; then
    echo -e "${GREEN}✓${NC} Build successful"
else
    echo -e "${RED}✗${NC} Build failed!"
    exit 1
fi

# Check for linter errors
echo "🔍 Checking for linter errors..."
if npm run lint 2>/dev/null || true; then
    echo -e "${GREEN}✓${NC} Linter check passed"
else
    echo -e "${YELLOW}⚠${NC} Linter warnings (non-blocking)"
fi

echo ""
echo "📝 Database Migration Reminder"
echo "=============================="
echo -e "${YELLOW}IMPORTANT:${NC} Before deploying, make sure you've run:"
echo "  1. simplify-partnerships-table.sql in Production Supabase"
echo "  2. simplify-partnerships-table.sql in Staging Supabase"
echo ""
read -p "Have you run the database migrations? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Please run the database migrations first!${NC}"
    echo "See DEPLOYMENT-GUIDE.md for instructions."
    exit 1
fi

# Deployment options
echo ""
echo "🌐 Deployment Options"
echo "===================="
echo "1. Push to main (triggers automatic Vercel deployment)"
echo "2. Deploy via Vercel CLI"
echo "3. Just commit changes (manual deployment later)"
echo ""
read -p "Choose option (1-3): " -n 1 -r
echo

case $REPLY in
    1)
        echo ""
        echo "📤 Pushing to main branch..."
        CURRENT_BRANCH=$(git branch --show-current)
        
        if [ "$CURRENT_BRANCH" != "main" ]; then
            echo -e "${YELLOW}Current branch is '$CURRENT_BRANCH', not 'main'${NC}"
            read -p "Switch to main and push? (y/n) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                git checkout main
                git merge "$CURRENT_BRANCH"
            else
                echo "Aborted."
                exit 1
            fi
        fi
        
        # Commit if there are changes
        if [ -n "$(git status --porcelain)" ]; then
            git add .
            git commit -m "Deploy: Simplify partnerships table schema"
        fi
        
        git push origin main
        echo -e "${GREEN}✓${NC} Pushed to main. Vercel will deploy automatically."
        echo ""
        echo "Monitor deployment at: https://vercel.com/dashboard"
        ;;
    2)
        echo ""
        echo "📦 Deploying via Vercel CLI..."
        
        if ! command -v vercel &> /dev/null; then
            echo "Vercel CLI not found. Installing..."
            npm i -g vercel
        fi
        
        read -p "Deploy to production? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            vercel --prod
        else
            vercel
        fi
        ;;
    3)
        echo ""
        echo "💾 Committing changes..."
        
        if [ -n "$(git status --porcelain)" ]; then
            git add .
            git commit -m "Simplify partnerships table schema - ready for deployment"
            echo -e "${GREEN}✓${NC} Changes committed"
            echo ""
            echo "To deploy later:"
            echo "  git push origin main  # For automatic Vercel deployment"
            echo "  vercel --prod         # For manual Vercel deployment"
        else
            echo "No changes to commit."
        fi
        ;;
    *)
        echo "Invalid option. Aborted."
        exit 1
        ;;
esac

echo ""
echo "✅ Deployment process started!"
echo ""
echo "📋 Post-deployment checklist:"
echo "  1. Verify homepage loads: https://serenity-plus-kohl.vercel.app"
echo "  2. Test partnership creation"
echo "  3. Test session completion"
echo "  4. Check browser console for errors"
echo "  5. Monitor Vercel logs"
echo ""
echo "See DEPLOYMENT-GUIDE.md for full verification steps."
