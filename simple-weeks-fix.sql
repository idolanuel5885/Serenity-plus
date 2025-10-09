-- SIMPLE FIX: Just disable RLS on weeks table
-- This is the minimal fix for your specific error

ALTER TABLE weeks DISABLE ROW LEVEL SECURITY;

-- Verify it worked
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'weeks';

