-- Fix sessions table: Add missing duration column
-- This fixes the error: "Could not find the 'duration' column of 'sessions' in the schema cache"

-- First, check what columns currently exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'sessions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Add duration column if it doesn't exist
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS duration INTEGER;

-- Make it NOT NULL if there are no existing rows, or set a default for existing NULL values
-- For existing rows with NULL, we'll set a default value
UPDATE sessions SET duration = 60 WHERE duration IS NULL;

-- Now make it NOT NULL (this will fail if there are still NULLs, so run the UPDATE first)
-- ALTER TABLE sessions ALTER COLUMN duration SET NOT NULL;

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'sessions' 
AND table_schema = 'public'
ORDER BY ordinal_position;
