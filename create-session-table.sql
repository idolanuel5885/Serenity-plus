-- Create the sessions table in Supabase
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  createdat TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration INTEGER NOT NULL, -- Duration in minutes
  iscompleted BOOLEAN DEFAULT FALSE,
  completedat TIMESTAMP WITH TIME ZONE,
  userid UUID NOT NULL REFERENCES users(id),
  partnershipid UUID REFERENCES partnerships(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sessions_userid ON sessions(userid);
CREATE INDEX IF NOT EXISTS idx_sessions_partnershipid ON sessions(partnershipid);
CREATE INDEX IF NOT EXISTS idx_sessions_completedat ON sessions(completedat);

-- Add RLS (Row Level Security) policies
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to see their own sessions
CREATE POLICY "Users can view their own sessions" ON sessions
  FOR SELECT USING (auth.uid() = userid);

-- Policy to allow users to insert their own sessions
CREATE POLICY "Users can insert their own sessions" ON sessions
  FOR INSERT WITH CHECK (auth.uid() = userid);

-- Policy to allow users to update their own sessions
CREATE POLICY "Users can update their own sessions" ON sessions
  FOR UPDATE USING (auth.uid() = userid);
