-- Comprehensive fix for all database issues
-- This addresses both the RLS issues and missing tables

-- 1. Check what tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. Create invites table if it doesn't exist
CREATE TABLE IF NOT EXISTS invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userid UUID NOT NULL,
  username VARCHAR(255) NOT NULL,
  invitecode VARCHAR(255) UNIQUE NOT NULL,
  isactive BOOLEAN DEFAULT true,
  createdat TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Disable RLS on all tables
ALTER TABLE weeks DISABLE ROW LEVEL SECURITY;
ALTER TABLE partnerships DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE invites DISABLE ROW LEVEL SECURITY;

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invites_invitecode ON invites(invitecode);
CREATE INDEX IF NOT EXISTS idx_invites_userid ON invites(userid);
CREATE INDEX IF NOT EXISTS idx_partnerships_userid ON partnerships(userid);
CREATE INDEX IF NOT EXISTS idx_partnerships_partnerid ON partnerships(partnerid);

-- 5. Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon;

-- 6. Verify the changes
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

