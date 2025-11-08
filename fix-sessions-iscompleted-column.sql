-- Fix sessions table: ensure iscompleted column exists
-- This fixes the error: "Could not find the 'iscompleted' column of 'sessions' in the schema cache"

-- First, check if the column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'sessions' 
AND table_schema = 'public'
AND column_name = 'iscompleted';

-- If the column doesn't exist, add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sessions' 
        AND table_schema = 'public'
        AND column_name = 'iscompleted'
    ) THEN
        ALTER TABLE sessions ADD COLUMN iscompleted BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added iscompleted column to sessions table';
    ELSE
        RAISE NOTICE 'iscompleted column already exists in sessions table';
    END IF;
END $$;

-- Verify the column exists
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'sessions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

