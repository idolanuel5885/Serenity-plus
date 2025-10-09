-- Check what columns exist in the sessions table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'sessions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if sessions table exists
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename = 'sessions';

-- If the table exists but has wrong structure, let's see what it has
-- Then we can either:
-- 1. Drop and recreate it, or
-- 2. Add missing columns

-- First, let's see what we have
SELECT * FROM sessions LIMIT 1;

