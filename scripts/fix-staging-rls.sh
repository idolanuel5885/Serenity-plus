#!/bin/bash

# Script to fix RLS policies in staging Supabase database
# This script updates anonymous access policies to include WITH CHECK (true)
# which is required for INSERT operations

set -e

echo "🔧 Fixing RLS policies in staging database..."
echo ""

# Check if environment variables are set
if [ -z "$STAGING_SUPABASE_URL" ] || [ -z "$STAGING_SUPABASE_ANON_KEY" ]; then
  echo "❌ Error: STAGING_SUPABASE_URL and STAGING_SUPABASE_ANON_KEY must be set"
  echo ""
  echo "You can set them like this:"
  echo "  export STAGING_SUPABASE_URL='https://your-staging-project.supabase.co'"
  echo "  export STAGING_SUPABASE_ANON_KEY='your-anon-key'"
  echo ""
  echo "Or run this script with:"
  echo "  STAGING_SUPABASE_URL='...' STAGING_SUPABASE_ANON_KEY='...' ./scripts/fix-staging-rls.sh"
  exit 1
fi

# Extract project reference from URL
PROJECT_REF=$(echo $STAGING_SUPABASE_URL | sed 's|https://||' | sed 's|\.supabase\.co||')

echo "📋 Project: $PROJECT_REF"
echo "📋 Database URL: $STAGING_SUPABASE_URL"
echo ""

# Check if psql is available
if ! command -v psql &> /dev/null; then
  echo "❌ Error: psql is not installed"
  echo "   Install PostgreSQL client tools to use this script"
  echo "   Or run the SQL file directly in Supabase SQL Editor"
  echo ""
  echo "📝 To run manually:"
  echo "   1. Go to your Supabase project dashboard"
  echo "   2. Navigate to SQL Editor"
  echo "   3. Copy and paste the contents of fix-staging-rls-complete.sql"
  echo "   4. Run the query"
  exit 1
fi

# Construct database connection string
# Note: You'll need the database password for direct psql connection
# For now, we'll just show instructions
echo "⚠️  Direct psql connection requires database password"
echo ""
echo "📝 Recommended: Run the SQL file in Supabase SQL Editor"
echo ""
echo "   1. Go to: https://supabase.com/dashboard/project/$PROJECT_REF/sql/new"
echo "   2. Copy the contents of: fix-staging-rls-complete.sql"
echo "   3. Paste and run in the SQL Editor"
echo ""
echo "📄 SQL file location: $(pwd)/fix-staging-rls-complete.sql"
echo ""

# Alternative: Use Supabase CLI if available
if command -v supabase &> /dev/null; then
  echo "✅ Supabase CLI detected"
  echo "   You can also use: supabase db execute --file fix-staging-rls-complete.sql"
  echo ""
fi

echo "✨ Script complete!"
echo ""
echo "After running the SQL, verify the policies were created:"
echo "   SELECT tablename, policyname FROM pg_policies WHERE tablename IN ('users', 'partnerships', 'weeks', 'sessions', 'invitations', 'notifications');"

