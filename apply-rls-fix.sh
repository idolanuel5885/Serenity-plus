#!/bin/bash

# Script to apply RLS policy fixes to Supabase database
# This will fix the weeks table RLS policy violations

echo "🔧 Applying RLS policy fixes to Supabase database..."

# Check if we have the necessary environment variables
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
    echo "❌ Error: SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required"
    echo "Please set these variables and try again"
    exit 1
fi

# Apply the simple weeks RLS fix first
echo "📝 Applying simple weeks RLS fix..."
psql "$SUPABASE_URL" -f fix-weeks-rls-simple.sql

if [ $? -eq 0 ]; then
    echo "✅ Simple weeks RLS fix applied successfully"
else
    echo "❌ Failed to apply simple weeks RLS fix"
    echo "Trying comprehensive fix..."
    
    # Try the comprehensive fix
    psql "$SUPABASE_URL" -f fix-supabase-rls-policies.sql
    
    if [ $? -eq 0 ]; then
        echo "✅ Comprehensive RLS fix applied successfully"
    else
        echo "❌ Failed to apply comprehensive RLS fix"
        echo "Please check your database connection and try running the SQL manually"
        exit 1
    fi
fi

echo "🎉 RLS policy fixes completed!"
echo "You can now test your application - the weeks table should accept inserts"

