-- Check if tables exist and create them if needed

-- Check if partnerships table exists and has correct structure
DO $$
BEGIN
    -- Check if partnerships table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'partnerships') THEN
        RAISE NOTICE 'partnerships table does not exist';
    ELSE
        RAISE NOTICE 'partnerships table exists';
    END IF;
    
    -- Check if weeks table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'weeks') THEN
        RAISE NOTICE 'weeks table does not exist - creating it';
        
        -- Create the weeks table
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
    ELSE
        RAISE NOTICE 'weeks table exists';
    END IF;
    
    -- Check if sessions table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sessions') THEN
        RAISE NOTICE 'sessions table does not exist - creating it';
        
        -- Create the sessions table
        CREATE TABLE IF NOT EXISTS sessions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          createdat TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          sitlength INTEGER NOT NULL, -- Session length in seconds
          iscompleted BOOLEAN DEFAULT FALSE,
          completedat TIMESTAMP WITH TIME ZONE, -- Nullable - set when session completes
          startedat TIMESTAMP WITH TIME ZONE,
          userid UUID NOT NULL REFERENCES users(id),
          partnershipid UUID REFERENCES partnerships(id),
          weekid UUID REFERENCES weeks(id) -- Link session to week
        );
        
        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_sessions_userid ON sessions(userid);
        CREATE INDEX IF NOT EXISTS idx_sessions_partnershipid ON sessions(partnershipid);
        CREATE INDEX IF NOT EXISTS idx_sessions_completedat ON sessions(completedat);
        
        -- Add RLS (Row Level Security) policies
        ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
        
        -- Policy to allow users to see their own sessions
        CREATE POLICY "Users can view their own sessions" ON sessions
          FOR SELECT USING (auth.uid() = userid);
        
        -- Policy to allow users to insert their own sessions
        CREATE POLICY "Users can insert their own sessions" ON sessions
          FOR INSERT WITH CHECK (auth.uid() = userid);
        
        -- Policy to allow users to update their own sessions
        CREATE POLICY "Users can update their own sessions" ON sessions
          FOR UPDATE USING (auth.uid() = userid);
    ELSE
        RAISE NOTICE 'sessions table exists';
    END IF;
END $$;
