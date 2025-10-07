-- Comprehensive fix for all RLS policies
-- This script fixes all the RLS policy issues

-- 1. Fix partnerships table RLS policies
DROP POLICY IF EXISTS "Users can view their own partnerships" ON partnerships;
DROP POLICY IF EXISTS "Users can insert partnerships" ON partnerships;
DROP POLICY IF EXISTS "Users can update their own partnerships" ON partnerships;

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

-- 2. Fix weeks table RLS policies
DROP POLICY IF EXISTS "Users can view weeks for their partnerships" ON weeks;
DROP POLICY IF EXISTS "Users can insert weeks for their partnerships" ON weeks;
DROP POLICY IF EXISTS "Users can update weeks for their partnerships" ON weeks;

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

-- 3. Fix sessions table RLS policies (if it exists)
DROP POLICY IF EXISTS "Users can view their own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can insert their own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON sessions;

CREATE POLICY "Users can view their own sessions" ON sessions
  FOR SELECT USING (auth.uid() = userid);

CREATE POLICY "Users can insert their own sessions" ON sessions
  FOR INSERT WITH CHECK (auth.uid() = userid);

CREATE POLICY "Users can update their own sessions" ON sessions
  FOR UPDATE USING (auth.uid() = userid);
