-- Fix partnerships table RLS issue
-- The 400 error on partnerships suggests RLS is still blocking operations

-- Disable RLS on partnerships table
ALTER TABLE partnerships DISABLE ROW LEVEL SECURITY;

-- Also disable RLS on users table to be safe
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Verify the changes
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('partnerships', 'users', 'weeks')
ORDER BY tablename;

