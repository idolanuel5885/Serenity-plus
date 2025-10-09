-- Check if sessions table exists and its RLS status
SELECT table_name, rowsecurity 
FROM pg_tables 
WHERE table_schema = 'public'
AND table_name = 'sessions';

-- If it doesn't exist, create it
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userid UUID NOT NULL,
  partnershipid UUID,
  duration INTEGER NOT NULL,
  iscompleted BOOLEAN DEFAULT false,
  startedat TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completedat TIMESTAMP WITH TIME ZONE,
  createdat TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS on sessions table
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sessions_userid ON sessions(userid);
CREATE INDEX IF NOT EXISTS idx_sessions_partnershipid ON sessions(partnershipid);
CREATE INDEX IF NOT EXISTS idx_sessions_startedat ON sessions(startedat);

-- Verify the table exists and RLS is disabled
SELECT table_name, rowsecurity 
FROM pg_tables 
WHERE table_schema = 'public'
AND table_name = 'sessions';

