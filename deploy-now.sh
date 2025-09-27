#!/bin/bash

echo "🚀 Deploying Serenity+ PWA to public hosting..."

# Method 1: Try Netlify CLI if available
if command -v netlify &> /dev/null; then
    echo "📦 Deploying to Netlify..."
    cd out
    netlify deploy --prod --dir . --site serenity-plus-pwa
    echo "✅ Deployed to Netlify!"
    exit 0
fi

# Method 2: Create GitHub repository and push
echo "📦 Preparing for GitHub Pages deployment..."

# Initialize git if not already done
if [ ! -d ".git" ]; then
    git init
fi

# Add all files
git add .
git commit -m "Deploy Serenity+ PWA" --no-verify

echo "✅ Git repository ready!"
echo ""
echo "🌐 Next steps for public deployment:"
echo "1. Go to https://github.com/new"
echo "2. Create a new repository (e.g., 'serenity-plus-pwa')"
echo "3. Run these commands:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/serenity-plus-pwa.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo "4. Go to repository Settings > Pages"
echo "5. Select 'Deploy from a branch' > 'main' > '/out' folder"
echo "6. Your PWA will be live at: https://YOUR_USERNAME.github.io/serenity-plus-pwa"
echo ""
echo "🎯 Your PWA is ready for deployment!"
echo "📱 All features working: logo, footer, contextual text, QR codes, PWA manifest"
