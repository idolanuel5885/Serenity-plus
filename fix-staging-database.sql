-- Fix staging database schema to match production
-- This will drop and recreate tables with the correct schema

-- Drop existing tables (in correct order due to foreign key constraints)
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS weeks CASCADE;
DROP TABLE IF EXISTS partnerships CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  weeklytarget INTEGER NOT NULL DEFAULT 5,
  usualsitlength INTEGER NOT NULL DEFAULT 30,
  image TEXT NOT NULL DEFAULT '/icons/meditation-1.svg',
  invitecode TEXT UNIQUE NOT NULL,
  createdat TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create partnerships table (with correct schema matching production)
CREATE TABLE partnerships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  createdat TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updatedat TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  userid UUID NOT NULL REFERENCES users(id),
  partnerid UUID NOT NULL REFERENCES users(id),
  isactive BOOLEAN DEFAULT TRUE,
  score INTEGER DEFAULT 0,
  weeklygoal INTEGER NOT NULL DEFAULT 5,
  currentweeknumber INTEGER DEFAULT 1,
  currentweekstart TIMESTAMP WITH TIME ZONE NOT NULL,
  usersits INTEGER DEFAULT 0,
  partnersits INTEGER DEFAULT 0,
  currentstreak INTEGER DEFAULT 0,
  longeststreak INTEGER DEFAULT 0,
  totalweeks INTEGER DEFAULT 0,
  UNIQUE(userid, partnerid)
);

-- Create weeks table
CREATE TABLE weeks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partnershipid UUID NOT NULL REFERENCES partnerships(id),
  weeknumber INTEGER NOT NULL,
  weekstart TIMESTAMP WITH TIME ZONE NOT NULL,
  weekend TIMESTAMP WITH TIME ZONE NOT NULL,
  inviteesits INTEGER DEFAULT 0, -- The user who used the invite code
  invitersits INTEGER DEFAULT 0, -- The user who created account and shared invite code
  weeklygoal INTEGER NOT NULL,
  goalmet BOOLEAN DEFAULT FALSE,
  createdat TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sessions table
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  userid UUID NOT NULL REFERENCES users(id),
  partnershipid UUID REFERENCES partnerships(id),
  weekid UUID REFERENCES weeks(id), -- Link session to week
  sitlength INTEGER NOT NULL,
  completedat TIMESTAMP WITH TIME ZONE, -- Nullable - set when session completes
  createdat TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_invitecode ON users(invitecode);
CREATE INDEX idx_partnerships_userid ON partnerships(userid);
CREATE INDEX idx_partnerships_partnerid ON partnerships(partnerid);
CREATE INDEX idx_weeks_partnershipid ON weeks(partnershipid);
CREATE INDEX idx_sessions_userid ON sessions(userid);
CREATE INDEX idx_sessions_partnershipid ON sessions(partnershipid);
CREATE INDEX idx_sessions_weekid ON sessions(weekid);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view all users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can insert themselves" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update themselves" ON users
  FOR UPDATE USING (true);

-- Create RLS policies for partnerships table
CREATE POLICY "Users can view their partnerships" ON partnerships
  FOR SELECT USING (
    userid::text = auth.uid()::text OR partnerid::text = auth.uid()::text
  );

CREATE POLICY "Users can insert partnerships" ON partnerships
  FOR INSERT WITH CHECK (
    userid::text = auth.uid()::text OR partnerid::text = auth.uid()::text
  );

CREATE POLICY "Users can update their partnerships" ON partnerships
  FOR UPDATE USING (
    userid::text = auth.uid()::text OR partnerid::text = auth.uid()::text
  );

-- Create RLS policies for weeks table
CREATE POLICY "Users can view weeks for their partnerships" ON weeks
  FOR SELECT USING (
    partnershipid IN (
      SELECT id FROM partnerships 
      WHERE userid::text = auth.uid()::text OR partnerid::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert weeks for their partnerships" ON weeks
  FOR INSERT WITH CHECK (
    partnershipid IN (
      SELECT id FROM partnerships 
      WHERE userid::text = auth.uid()::text OR partnerid::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can update weeks for their partnerships" ON weeks
  FOR UPDATE USING (
    partnershipid IN (
      SELECT id FROM partnerships 
      WHERE userid::text = auth.uid()::text OR partnerid::text = auth.uid()::text
    )
  );

-- Create RLS policies for sessions table
CREATE POLICY "Users can view their sessions" ON sessions
  FOR SELECT USING (userid::text = auth.uid()::text);

CREATE POLICY "Users can insert their sessions" ON sessions
  FOR INSERT WITH CHECK (userid::text = auth.uid()::text);

CREATE POLICY "Users can update their sessions" ON sessions
  FOR UPDATE USING (userid::text = auth.uid()::text);

-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
