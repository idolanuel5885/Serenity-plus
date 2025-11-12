-- Setup script for staging Supabase database
-- This creates all required tables for the Serenity+ app

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  image TEXT,
  createdat TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updatedat TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  weeklytarget INTEGER NOT NULL DEFAULT 5,
  primarywindow TEXT DEFAULT 'morning',
  timezone TEXT DEFAULT 'UTC',
  usualsitlength INTEGER NOT NULL DEFAULT 30,
  whypractice TEXT,
  supportneeds TEXT,
  invitecode TEXT
);

-- Create partnerships table
CREATE TABLE IF NOT EXISTS partnerships (
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
CREATE TABLE IF NOT EXISTS weeks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partnershipid UUID NOT NULL REFERENCES partnerships(id),
  weeknumber INTEGER NOT NULL,
  weekstart TIMESTAMP WITH TIME ZONE NOT NULL,
  weekend TIMESTAMP WITH TIME ZONE NOT NULL,
  user1sits INTEGER DEFAULT 0,
  user2sits INTEGER DEFAULT 0,
  weeklygoal INTEGER NOT NULL,
  goalmet BOOLEAN DEFAULT FALSE,
  createdat TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  createdat TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sitlength INTEGER NOT NULL,
  iscompleted BOOLEAN DEFAULT FALSE,
  completedat TIMESTAMP WITH TIME ZONE, -- Nullable - set when session completes
  startedat TIMESTAMP WITH TIME ZONE,
  userid UUID NOT NULL REFERENCES users(id),
  partnershipid UUID REFERENCES partnerships(id),
  weekid UUID REFERENCES weeks(id) -- Link session to week
);

-- Create invitations table
CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  createdat TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expiresat TIMESTAMP WITH TIME ZONE NOT NULL,
  isused BOOLEAN DEFAULT FALSE,
  usedat TIMESTAMP WITH TIME ZONE,
  inviterid UUID NOT NULL REFERENCES users(id),
  inviteeid UUID REFERENCES users(id),
  invitecode TEXT UNIQUE NOT NULL
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  createdat TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  isread BOOLEAN DEFAULT FALSE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  data TEXT,
  userid UUID NOT NULL REFERENCES users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_invitecode ON users(invitecode);
CREATE INDEX IF NOT EXISTS idx_partnerships_userid ON partnerships(userid);
CREATE INDEX IF NOT EXISTS idx_partnerships_partnerid ON partnerships(partnerid);
CREATE INDEX IF NOT EXISTS idx_weeks_partnershipid ON weeks(partnershipid);
CREATE INDEX IF NOT EXISTS idx_weeks_weeknumber ON weeks(partnershipid, weeknumber);
CREATE INDEX IF NOT EXISTS idx_weeks_weekstart ON weeks(weekstart);
CREATE INDEX IF NOT EXISTS idx_sessions_userid ON sessions(userid);
CREATE INDEX IF NOT EXISTS idx_sessions_partnershipid ON sessions(partnershipid);
CREATE INDEX IF NOT EXISTS idx_sessions_completedat ON sessions(completedat);
CREATE INDEX IF NOT EXISTS idx_invitations_invitecode ON invitations(invitecode);
CREATE INDEX IF NOT EXISTS idx_notifications_userid ON notifications(userid);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT WITH CHECK (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

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
CREATE POLICY "Users can view their own sessions" ON sessions
  FOR SELECT USING (userid::text = auth.uid()::text);

CREATE POLICY "Users can insert their own sessions" ON sessions
  FOR INSERT WITH CHECK (userid::text = auth.uid()::text);

CREATE POLICY "Users can update their own sessions" ON sessions
  FOR UPDATE USING (userid::text = auth.uid()::text);

-- Create RLS policies for invitations table
CREATE POLICY "Users can view their invitations" ON invitations
  FOR SELECT USING (
    inviterid::text = auth.uid()::text OR inviteeid::text = auth.uid()::text
  );

CREATE POLICY "Users can insert invitations" ON invitations
  FOR INSERT WITH CHECK (inviterid::text = auth.uid()::text);

CREATE POLICY "Users can update their invitations" ON invitations
  FOR UPDATE USING (
    inviterid::text = auth.uid()::text OR inviteeid::text = auth.uid()::text
  );

-- Create RLS policies for notifications table
CREATE POLICY "Users can view their notifications" ON notifications
  FOR SELECT USING (userid::text = auth.uid()::text);

CREATE POLICY "Users can insert notifications" ON notifications
  FOR INSERT WITH CHECK (userid::text = auth.uid()::text);

CREATE POLICY "Users can update their notifications" ON notifications
  FOR UPDATE USING (userid::text = auth.uid()::text);

-- For testing purposes, allow anonymous access to users table (needed for E2E tests)
CREATE POLICY "Allow anonymous access for testing" ON users
  FOR ALL USING (true);

-- Allow anonymous access to partnerships for testing
CREATE POLICY "Allow anonymous access to partnerships for testing" ON partnerships
  FOR ALL USING (true);

-- Allow anonymous access to weeks for testing
CREATE POLICY "Allow anonymous access to weeks for testing" ON weeks
  FOR ALL USING (true);

-- Allow anonymous access to sessions for testing
CREATE POLICY "Allow anonymous access to sessions for testing" ON sessions
  FOR ALL USING (true);

-- Allow anonymous access to invitations for testing
CREATE POLICY "Allow anonymous access to invitations for testing" ON invitations
  FOR ALL USING (true);

-- Allow anonymous access to notifications for testing
CREATE POLICY "Allow anonymous access to notifications for testing" ON notifications
  FOR ALL USING (true);
