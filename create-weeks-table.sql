-- Create the weeks table in Supabase
CREATE TABLE IF NOT EXISTS weeks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_weeks_partnershipid ON weeks(partnershipid);
CREATE INDEX IF NOT EXISTS idx_weeks_weeknumber ON weeks(partnershipid, weeknumber);
CREATE INDEX IF NOT EXISTS idx_weeks_weekstart ON weeks(weekstart);

-- Add RLS (Row Level Security) policies
ALTER TABLE weeks ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to see weeks for their partnerships
CREATE POLICY "Users can view weeks for their partnerships" ON weeks
  FOR SELECT USING (
    partnershipid IN (
      SELECT id FROM partnerships 
      WHERE user1id = auth.uid() OR user2id = auth.uid()
    )
  );

-- Policy to allow users to insert weeks for their partnerships
CREATE POLICY "Users can insert weeks for their partnerships" ON weeks
  FOR INSERT WITH CHECK (
    partnershipid IN (
      SELECT id FROM partnerships 
      WHERE user1id = auth.uid() OR user2id = auth.uid()
    )
  );

-- Policy to allow users to update weeks for their partnerships
CREATE POLICY "Users can update weeks for their partnerships" ON weeks
  FOR UPDATE USING (
    partnershipid IN (
      SELECT id FROM partnerships 
      WHERE user1id = auth.uid() OR user2id = auth.uid()
    )
  );
