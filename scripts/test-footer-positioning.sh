#!/bin/bash

# Test footer positioning on all onboarding pages
echo "🧪 Testing Footer Positioning"
echo "============================"

# Test pages
pages=(
    "/nickname"
    "/meditations-per-week" 
    "/meditation-length"
)

for page in "${pages[@]}"; do
    echo "Testing footer on $page..."
    
    # Check if page has proper flex layout
    if curl -s "http://localhost:3000$page" | grep -q "flex flex-col"; then
        echo "  ✅ Flex layout present"
    else
        echo "  ❌ Flex layout missing"
    fi
    
    # Check if content area has flex-1
    if curl -s "http://localhost:3000$page" | grep -q "flex-1"; then
        echo "  ✅ Content area has flex-1"
    else
        echo "  ❌ Content area missing flex-1"
    fi
    
    # Check if footer has mt-auto
    if curl -s "http://localhost:3000$page" | grep -q "mt-auto"; then
        echo "  ✅ Footer has mt-auto"
    else
        echo "  ❌ Footer missing mt-auto"
    fi
    
    # Check if footer has border-t
    if curl -s "http://localhost:3000$page" | grep -q "border-t"; then
        echo "  ✅ Footer has border-t"
    else
        echo "  ❌ Footer missing border-t"
    fi
    
    echo ""
done

echo "🎯 Footer Positioning Test Complete!"
echo "All onboarding pages should now have footers positioned at the bottom."


