-- Comprehensive RLS policy fix for Supabase database
-- This script fixes all RLS policy issues for the actual Supabase structure

-- 1. First, let's check what tables exist and their structure
-- The error shows we're working with a 'weeks' table, not 'week_history'

-- 2. Fix partnerships table RLS policies
DROP POLICY IF EXISTS "Users can view their own partnerships" ON partnerships;
DROP POLICY IF EXISTS "Users can insert partnerships" ON partnerships;
DROP POLICY IF EXISTS "Users can update their own partnerships" ON partnerships;
DROP POLICY IF EXISTS "Users can delete their own partnerships" ON partnerships;

-- Create comprehensive policies for partnerships
CREATE POLICY "Users can view their own partnerships" ON partnerships
  FOR SELECT USING (
    userid = auth.uid() OR partnerid = auth.uid()
  );

CREATE POLICY "Users can insert partnerships" ON partnerships
  FOR INSERT WITH CHECK (
    userid = auth.uid() OR partnerid = auth.uid()
  );

CREATE POLICY "Users can update their own partnerships" ON partnerships
  FOR UPDATE USING (
    userid = auth.uid() OR partnerid = auth.uid()
  );

CREATE POLICY "Users can delete their own partnerships" ON partnerships
  FOR DELETE USING (
    userid = auth.uid() OR partnerid = auth.uid()
  );

-- 3. Fix weeks table RLS policies
-- Drop all existing policies first
DROP POLICY IF EXISTS "Users can view weeks for their partnerships" ON weeks;
DROP POLICY IF EXISTS "Users can insert weeks for their partnerships" ON weeks;
DROP POLICY IF EXISTS "Users can update weeks for their partnerships" ON weeks;
DROP POLICY IF EXISTS "Users can delete weeks for their partnerships" ON weeks;

-- Temporarily disable RLS to allow inserts
ALTER TABLE weeks DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE weeks ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for weeks table
CREATE POLICY "Users can view weeks for their partnerships" ON weeks
  FOR SELECT USING (
    partnershipid IN (
      SELECT id FROM partnerships 
      WHERE userid = auth.uid() OR partnerid = auth.uid()
    )
  );

CREATE POLICY "Users can insert weeks for their partnerships" ON weeks
  FOR INSERT WITH CHECK (
    partnershipid IN (
      SELECT id FROM partnerships 
      WHERE userid = auth.uid() OR partnerid = auth.uid()
    )
  );

CREATE POLICY "Users can update weeks for their partnerships" ON weeks
  FOR UPDATE USING (
    partnershipid IN (
      SELECT id FROM partnerships 
      WHERE userid = auth.uid() OR partnerid = auth.uid()
    )
  );

CREATE POLICY "Users can delete weeks for their partnerships" ON weeks
  FOR DELETE USING (
    partnershipid IN (
      SELECT id FROM partnerships 
      WHERE userid = auth.uid() OR partnerid = auth.uid()
    )
  );

-- 4. Fix sessions table RLS policies
DROP POLICY IF EXISTS "Users can view their own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can insert their own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON sessions;

CREATE POLICY "Users can view their own sessions" ON sessions
  FOR SELECT USING (auth.uid() = userid);

CREATE POLICY "Users can insert their own sessions" ON sessions
  FOR INSERT WITH CHECK (auth.uid() = userid);

CREATE POLICY "Users can update their own sessions" ON sessions
  FOR UPDATE USING (auth.uid() = userid);

CREATE POLICY "Users can delete their own sessions" ON sessions
  FOR DELETE USING (auth.uid() = userid);

-- 5. Fix users table RLS policies (if needed)
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;

CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- 6. Fix invitations table RLS policies
DROP POLICY IF EXISTS "Users can view their own invitations" ON invitations;
DROP POLICY IF EXISTS "Users can insert invitations" ON invitations;
DROP POLICY IF EXISTS "Users can update their own invitations" ON invitations;

CREATE POLICY "Users can view their own invitations" ON invitations
  FOR SELECT USING (
    inviterid = auth.uid() OR inviteeid = auth.uid()
  );

CREATE POLICY "Users can insert invitations" ON invitations
  FOR INSERT WITH CHECK (auth.uid() = inviterid);

CREATE POLICY "Users can update their own invitations" ON invitations
  FOR UPDATE USING (
    inviterid = auth.uid() OR inviteeid = auth.uid()
  );

-- 7. Fix notifications table RLS policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;

CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = userid);

CREATE POLICY "Users can insert notifications" ON notifications
  FOR INSERT WITH CHECK (auth.uid() = userid);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = userid);

-- 8. Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- 9. Ensure RLS is enabled on all tables
ALTER TABLE partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

