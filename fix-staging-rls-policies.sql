-- Fix RLS policies for anonymous access in staging
-- The existing policies only have USING (true) which works for SELECT/UPDATE/DELETE
-- But INSERT operations require WITH CHECK (true)

-- Drop existing anonymous access policy for partnerships
DROP POLICY IF EXISTS "Allow anonymous access to partnerships for testing" ON partnerships;

-- Recreate with both USING and WITH CHECK
CREATE POLICY "Allow anonymous access to partnerships for testing" ON partnerships
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Also fix the other tables to be safe (they might have the same issue)
DROP POLICY IF EXISTS "Allow anonymous access for testing" ON users;
CREATE POLICY "Allow anonymous access for testing" ON users
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anonymous access to weeks for testing" ON weeks;
CREATE POLICY "Allow anonymous access to weeks for testing" ON weeks
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anonymous access to sessions for testing" ON sessions;
CREATE POLICY "Allow anonymous access to sessions for testing" ON sessions
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anonymous access to invitations for testing" ON invitations;
CREATE POLICY "Allow anonymous access to invitations for testing" ON invitations
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anonymous access to notifications for testing" ON notifications;
CREATE POLICY "Allow anonymous access to notifications for testing" ON notifications
  FOR ALL 
  USING (true) 
  WITH CHECK (true);


