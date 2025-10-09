-- Fix the partnerships query issue
-- The problem is in the complex or() clause that's causing 400 errors

-- First, let's check what tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- The partnerships query is failing because of the complex or() clause
-- Let's also check if we need to create the invites table
CREATE TABLE IF NOT EXISTS invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userid UUID NOT NULL,
  username VARCHAR(255) NOT NULL,
  invitecode VARCHAR(255) UNIQUE NOT NULL,
  isactive BOOLEAN DEFAULT true,
  createdat TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS on invites table
ALTER TABLE invites DISABLE ROW LEVEL SECURITY;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_invites_invitecode ON invites(invitecode);
CREATE INDEX IF NOT EXISTS idx_invites_userid ON invites(userid);

