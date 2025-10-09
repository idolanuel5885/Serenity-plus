-- RLS Fix for existing tables only
-- This script only touches tables that actually exist

-- First, let's check what tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Disable RLS on tables that exist and are causing issues
-- Only disable RLS on tables that actually exist

-- Disable RLS on weeks table (this is the main issue)
ALTER TABLE weeks DISABLE ROW LEVEL SECURITY;

-- Disable RLS on partnerships table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'partnerships') THEN
        ALTER TABLE partnerships DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Disabled RLS on partnerships table';
    ELSE
        RAISE NOTICE 'partnerships table does not exist';
    END IF;
END $$;

-- Disable RLS on users table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        ALTER TABLE users DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Disabled RLS on users table';
    ELSE
        RAISE NOTICE 'users table does not exist';
    END IF;
END $$;

-- Disable RLS on sessions table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sessions') THEN
        ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Disabled RLS on sessions table';
    ELSE
        RAISE NOTICE 'sessions table does not exist';
    END IF;
END $$;

-- Disable RLS on notifications table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
        ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Disabled RLS on notifications table';
    ELSE
        RAISE NOTICE 'notifications table does not exist';
    END IF;
END $$;

-- Grant permissions to both authenticated and anonymous users
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon;

-- Verify the changes
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

