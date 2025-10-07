-- Fix RLS policies for weeks table to allow inserts
-- The current RLS is blocking week creation

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view weeks for their partnerships" ON weeks;
DROP POLICY IF EXISTS "Users can insert weeks for their partnerships" ON weeks;
DROP POLICY IF EXISTS "Users can update weeks for their partnerships" ON weeks;

-- Temporarily disable RLS for weeks table to allow inserts
ALTER TABLE weeks DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE weeks ENABLE ROW LEVEL SECURITY;

-- Create more permissive policies for weeks table
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
