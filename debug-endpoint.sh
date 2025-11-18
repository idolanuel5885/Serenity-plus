#!/bin/bash
# Debug script for monitoring endpoint

echo "🔍 Debugging Monitoring Endpoint"
echo "=================================="
echo ""

# Test 1: Check homepage
echo "1. Testing homepage..."
HOME_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://serenity-plus-kohl.vercel.app/)
echo "   Homepage status: $HOME_STATUS"
echo ""

# Test 2: Check monitoring endpoint
echo "2. Testing monitoring endpoint..."
MONITOR_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://serenity-plus-kohl.vercel.app/api/monitor/week-creation)
echo "   Monitoring endpoint status: $MONITOR_STATUS"
echo ""

# Test 3: Get full response
echo "3. Full response from monitoring endpoint:"
curl -s https://serenity-plus-kohl.vercel.app/api/monitor/week-creation
echo ""
echo ""

# Test 4: Check another API route
echo "4. Testing another API route (user)..."
USER_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://serenity-plus-kohl.vercel.app/api/user)
echo "   User API status: $USER_STATUS"
echo ""

# Summary
echo "Summary:"
if [ "$HOME_STATUS" = "200" ]; then
  echo "✅ Homepage is accessible"
else
  echo "❌ Homepage is NOT accessible (status: $HOME_STATUS)"
fi

if [ "$MONITOR_STATUS" = "200" ]; then
  echo "✅ Monitoring endpoint is accessible"
elif [ "$MONITOR_STATUS" = "404" ]; then
  echo "❌ Monitoring endpoint returns 404 - route not found"
  echo "   This could mean:"
  echo "   - Deployment hasn't completed yet"
  echo "   - Route file wasn't included in build"
  echo "   - Build failed"
else
  echo "⚠️  Monitoring endpoint status: $MONITOR_STATUS"
fi

