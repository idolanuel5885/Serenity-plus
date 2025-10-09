-- FINAL FIX: Disable RLS on weeks table only
-- This is the simplest and most direct solution

-- Disable RLS on weeks table completely
ALTER TABLE weeks DISABLE ROW LEVEL SECURITY;

-- Verify the change
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'weeks';

-- This should show rowsecurity = false for the weeks table

