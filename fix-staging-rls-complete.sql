-- Fix RLS policies for staging database
-- This script fixes anonymous access policies to allow INSERT operations
-- The existing policies only have USING (true) which works for SELECT/UPDATE/DELETE
-- But INSERT operations require WITH CHECK (true)

-- ============================================
-- USERS TABLE
-- ============================================
DROP POLICY IF EXISTS "Allow anonymous access for testing" ON users;
CREATE POLICY "Allow anonymous access for testing" ON users
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- ============================================
-- PARTNERSHIPS TABLE
-- ============================================
DROP POLICY IF EXISTS "Allow anonymous access to partnerships for testing" ON partnerships;
CREATE POLICY "Allow anonymous access to partnerships for testing" ON partnerships
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- ============================================
-- WEEKS TABLE
-- ============================================
DROP POLICY IF EXISTS "Allow anonymous access to weeks for testing" ON weeks;
CREATE POLICY "Allow anonymous access to weeks for testing" ON weeks
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- ============================================
-- SESSIONS TABLE
-- ============================================
DROP POLICY IF EXISTS "Allow anonymous access to sessions for testing" ON sessions;
CREATE POLICY "Allow anonymous access to sessions for testing" ON sessions
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- ============================================
-- INVITATIONS TABLE
-- ============================================
DROP POLICY IF EXISTS "Allow anonymous access to invitations for testing" ON invitations;
CREATE POLICY "Allow anonymous access to invitations for testing" ON invitations
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
DROP POLICY IF EXISTS "Allow anonymous access to notifications for testing" ON notifications;
CREATE POLICY "Allow anonymous access to notifications for testing" ON notifications
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- ============================================
-- VERIFICATION
-- ============================================
-- Check that all policies were created successfully
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('users', 'partnerships', 'weeks', 'sessions', 'invitations', 'notifications')
  AND policyname LIKE '%anonymous%' OR policyname LIKE '%testing%'
ORDER BY tablename, policyname;

-- Verify RLS is enabled on all tables
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('users', 'partnerships', 'weeks', 'sessions', 'invitations', 'notifications')
ORDER BY tablename;

