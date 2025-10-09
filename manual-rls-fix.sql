-- Manual RLS Fix for Supabase Dashboard
-- Copy and paste this into your Supabase SQL Editor

-- Step 1: Fix weeks table RLS policies
-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view weeks for their partnerships" ON weeks;
DROP POLICY IF EXISTS "Users can insert weeks for their partnerships" ON weeks;
DROP POLICY IF EXISTS "Users can update weeks for their partnerships" ON weeks;
DROP POLICY IF EXISTS "Users can delete weeks for their partnerships" ON weeks;

-- Temporarily disable RLS
ALTER TABLE weeks DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE weeks ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for weeks
CREATE POLICY "Allow authenticated users to insert weeks" ON weeks
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to view weeks" ON weeks
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update weeks" ON weeks
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete weeks" ON weeks
  FOR DELETE USING (auth.role() = 'authenticated');

-- Step 2: Ensure partnerships table has proper policies
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

-- Step 3: Verify the policies are working
-- You can run this query to check if the policies are active
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('weeks', 'partnerships')
ORDER BY tablename, policyname;

