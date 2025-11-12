-- Fix sessions table: Remove duration column and add weekid column
-- This standardizes on sitlength and links sessions to weeks

-- First, check what columns currently exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'sessions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Drop duration column if it exists (we standardized on sitlength)
ALTER TABLE sessions DROP COLUMN IF EXISTS duration;

-- Add weekid column to link sessions to weeks
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS weekid UUID REFERENCES weeks(id);

-- Create index for better performance when querying by week
CREATE INDEX IF NOT EXISTS idx_sessions_weekid ON sessions(weekid);

-- Verify the changes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'sessions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

