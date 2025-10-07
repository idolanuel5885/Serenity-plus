-- Fix RLS policies for partnerships table
-- The policies are referencing wrong column names

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own partnerships" ON partnerships;
DROP POLICY IF EXISTS "Users can insert partnerships" ON partnerships;
DROP POLICY IF EXISTS "Users can update their own partnerships" ON partnerships;

-- Create correct policies for partnerships table (using actual column names: userid, partnerid)
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

-- Fix RLS policies for weeks table
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view weeks for their partnerships" ON weeks;
DROP POLICY IF EXISTS "Users can insert weeks for their partnerships" ON weeks;
DROP POLICY IF EXISTS "Users can update weeks for their partnerships" ON weeks;

-- Create correct policies for weeks table (using actual column names: userid, partnerid)
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
