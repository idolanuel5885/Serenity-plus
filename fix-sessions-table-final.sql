-- Fix sessions table structure to match what the API expects
-- The API expects: userid, partnershipid, sitlength, iscompleted, startedat, completedat

-- First, check what we have
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'sessions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Disable RLS on sessions table
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;

-- Add missing columns if they don't exist
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS userid UUID;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS partnershipid UUID;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS sitlength INTEGER;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS iscompleted BOOLEAN DEFAULT false;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS startedat TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS completedat TIMESTAMP WITH TIME ZONE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sessions_userid ON sessions(userid);
CREATE INDEX IF NOT EXISTS idx_sessions_partnershipid ON sessions(partnershipid);
CREATE INDEX IF NOT EXISTS idx_sessions_startedat ON sessions(startedat);

-- Verify the table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'sessions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verify RLS is disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename = 'sessions';

