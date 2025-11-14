-- Implementation Script for Automatic Week Creation System
-- Run this in Supabase SQL Editor (requires superuser for pg_cron)

-- ============================================================================
-- STEP 1: Add schema changes to partnerships table
-- ============================================================================

ALTER TABLE partnerships 
ADD COLUMN IF NOT EXISTS autocreateweeks BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS weekcreationpauseduntil TIMESTAMP WITH TIME ZONE NULL;

-- Index for efficient querying
CREATE INDEX IF NOT EXISTS idx_partnerships_autocreateweeks 
ON partnerships(autocreateweeks) 
WHERE autocreateweeks = TRUE;

COMMENT ON COLUMN partnerships.autocreateweeks IS 'If true, automatically create new weeks for this partnership';
COMMENT ON COLUMN partnerships.weekcreationpauseduntil IS 'If set, pause auto-creation until this timestamp (NULL = not paused)';

-- ============================================================================
-- STEP 2: Create week_creation_log table for audit trail
-- ============================================================================

CREATE TABLE IF NOT EXISTS week_creation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnershipid UUID NOT NULL REFERENCES partnerships(id) ON DELETE CASCADE,
  weekid UUID REFERENCES weeks(id) ON DELETE SET NULL,
  weeknumber INTEGER,
  createdat TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('success', 'skipped', 'error')),
  errormessage TEXT,
  retrycount INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_week_creation_log_partnershipid 
ON week_creation_log(partnershipid, createdat DESC);

CREATE INDEX IF NOT EXISTS idx_week_creation_log_status 
ON week_creation_log(status, createdat DESC);

COMMENT ON TABLE week_creation_log IS 'Audit log for automatic week creation attempts';

-- ============================================================================
-- STEP 3: Add unique constraint to prevent duplicate weeks
-- ============================================================================

-- Ensure we can't have duplicate week numbers for same partnership
CREATE UNIQUE INDEX IF NOT EXISTS idx_weeks_partnership_weeknumber 
ON weeks(partnershipid, weeknumber);

-- ============================================================================
-- STEP 4: Create function to get current week for a partnership
-- ============================================================================

CREATE OR REPLACE FUNCTION get_current_week_for_partnership(
  p_partnership_id UUID
) RETURNS TABLE (
  id UUID,
  weeknumber INTEGER,
  weekstart TIMESTAMP WITH TIME ZONE,
  weekend TIMESTAMP WITH TIME ZONE,
  weeklygoal INTEGER,
  inviteesits INTEGER,
  invitersits INTEGER,
  goalmet BOOLEAN,
  createdat TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    w.id,
    w.weeknumber,
    w.weekstart,
    w.weekend,
    w.weeklygoal,
    w.inviteesits,
    w.invitersits,
    w.goalmet,
    w.createdat
  FROM weeks w
  WHERE w.partnershipid = p_partnership_id
    AND NOW() >= w.weekstart
    AND NOW() <= w.weekend
  ORDER BY w.weeknumber DESC
  LIMIT 1;
  
  -- If no current week found (between weeks or before first week), return the most recent week
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      w.id,
      w.weeknumber,
      w.weekstart,
      w.weekend,
      w.weeklygoal,
      w.inviteesits,
      w.invitersits,
      w.goalmet,
      w.createdat
    FROM weeks w
    WHERE w.partnershipid = p_partnership_id
    ORDER BY w.weeknumber DESC
    LIMIT 1;
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_current_week_for_partnership IS 'Returns the current week for a partnership, or the most recent week if no current week exists';

-- ============================================================================
-- STEP 5: Create function to create next week for a partnership
-- ============================================================================

CREATE OR REPLACE FUNCTION create_next_week_for_partnership(
  p_partnership_id UUID
) RETURNS UUID AS $$
DECLARE
  v_last_week RECORD;
  v_next_week_number INTEGER;
  v_week_start TIMESTAMP WITH TIME ZONE;
  v_week_end TIMESTAMP WITH TIME ZONE;
  v_weekly_goal INTEGER;
  v_new_week_id UUID;
  v_user1_target INTEGER;
  v_user2_target INTEGER;
  v_lock_key BIGINT;
BEGIN
  -- Use advisory lock to prevent concurrent creation for same partnership
  v_lock_key := hashtext(p_partnership_id::text);
  PERFORM pg_advisory_xact_lock(v_lock_key);

  -- Check if auto-creation is enabled
  IF NOT EXISTS (
    SELECT 1 FROM partnerships 
    WHERE id = p_partnership_id 
    AND autocreateweeks = TRUE
    AND (weekcreationpauseduntil IS NULL OR weekcreationpauseduntil < NOW())
  ) THEN
    INSERT INTO week_creation_log (
      partnershipid, weeknumber, status, metadata
    ) VALUES (
      p_partnership_id, NULL, 'skipped', 
      jsonb_build_object('reason', 'auto-creation disabled or paused')
    );
    RETURN NULL;
  END IF;

  -- Get the last week for this partnership
  SELECT * INTO v_last_week
  FROM weeks
  WHERE partnershipid = p_partnership_id
  ORDER BY weeknumber DESC
  LIMIT 1;

  -- If no previous week exists, this shouldn't be called (Week 1 is created manually)
  IF v_last_week IS NULL THEN
    INSERT INTO week_creation_log (
      partnershipid, weeknumber, status, errormessage, metadata
    ) VALUES (
      p_partnership_id, NULL, 'error',
      'No previous week found',
      jsonb_build_object('reason', 'no_previous_week')
    );
    RETURN NULL;
  END IF;

  -- Check if next week already exists (idempotency check)
  IF EXISTS (
    SELECT 1 FROM weeks
    WHERE partnershipid = p_partnership_id
    AND weeknumber = v_last_week.weeknumber + 1
  ) THEN
    SELECT id INTO v_new_week_id
    FROM weeks
    WHERE partnershipid = p_partnership_id
    AND weeknumber = v_last_week.weeknumber + 1
    LIMIT 1;
    
    INSERT INTO week_creation_log (
      partnershipid, weekid, weeknumber, status, metadata
    ) VALUES (
      p_partnership_id, v_new_week_id, v_last_week.weeknumber + 1, 'skipped',
      jsonb_build_object('reason', 'week_already_exists', 'existing_week_id', v_new_week_id)
    );
    RETURN v_new_week_id;
  END IF;

  -- Calculate next week details
  v_next_week_number := v_last_week.weeknumber + 1;
  -- Start immediately after previous week ends (add 1 second to avoid overlap)
  v_week_start := v_last_week.weekend + INTERVAL '1 second';
  -- End exactly 7 days later (minus 1 second to make it exactly 7 days)
  v_week_end := v_week_start + INTERVAL '7 days' - INTERVAL '1 second';

  -- Get weekly goal from users' targets
  SELECT 
    COALESCE(u1.weeklytarget, 5),
    COALESCE(u2.weeklytarget, 5)
  INTO v_user1_target, v_user2_target
  FROM partnerships p
  JOIN users u1 ON p.userid = u1.id
  JOIN users u2 ON p.partnerid = u2.id
  WHERE p.id = p_partnership_id;

  v_weekly_goal := v_user1_target + v_user2_target;

  -- Create the new week
  INSERT INTO weeks (
    partnershipid,
    weeknumber,
    weekstart,
    weekend,
    weeklygoal,
    inviteesits,
    invitersits,
    goalmet,
    createdat
  ) VALUES (
    p_partnership_id,
    v_next_week_number,
    v_week_start,
    v_week_end,
    v_weekly_goal,
    0,
    0,
    FALSE,
    NOW()
  ) RETURNING id INTO v_new_week_id;

  -- Log successful creation
  INSERT INTO week_creation_log (
    partnershipid, weekid, weeknumber, status, metadata
  ) VALUES (
    p_partnership_id, v_new_week_id, v_next_week_number, 'success',
    jsonb_build_object(
      'week_start', v_week_start,
      'week_end', v_week_end,
      'weekly_goal', v_weekly_goal,
      'previous_week_number', v_last_week.weeknumber
    )
  );

  RETURN v_new_week_id;
EXCEPTION
  WHEN unique_violation THEN
    -- Week was created by another process, get the existing one
    SELECT id INTO v_new_week_id
    FROM weeks
    WHERE partnershipid = p_partnership_id
    AND weeknumber = v_next_week_number
    LIMIT 1;
    
    INSERT INTO week_creation_log (
      partnershipid, weekid, weeknumber, status, metadata
    ) VALUES (
      p_partnership_id, v_new_week_id, v_next_week_number, 'skipped',
      jsonb_build_object('reason', 'unique_violation_race_condition', 'existing_week_id', v_new_week_id)
    );
    RETURN v_new_week_id;
  WHEN OTHERS THEN
    -- Log error
    INSERT INTO week_creation_log (
      partnershipid, weeknumber, status, errormessage, metadata
    ) VALUES (
      p_partnership_id, v_next_week_number, 'error',
      SQLERRM,
      jsonb_build_object('sqlstate', SQLSTATE, 'error_code', SQLSTATE)
    );
    -- Re-raise the exception
    RAISE;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION create_next_week_for_partnership IS 'Creates the next week for a partnership. Returns the new week ID or NULL if skipped/error. Idempotent and thread-safe.';

-- ============================================================================
-- STEP 6: Create scheduled job (requires pg_cron extension)
-- ============================================================================

-- Check if pg_cron extension exists and is available
DO $$
DECLARE
  v_job_id BIGINT;
BEGIN
  -- Check if pg_cron extension exists
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
  ) THEN
    RAISE NOTICE 'pg_cron extension found. Attempting to schedule job...';
    
    -- Try to schedule the job
    -- Note: This requires superuser privileges
    BEGIN
      -- Use SELECT INTO since cron.schedule returns a value (job ID)
      SELECT cron.schedule(
        'create-next-weeks-hourly',    -- Job name
        '0 * * * *',                   -- Every hour at minute 0 (cron syntax)
        $CRON$
        WITH partnerships_needing_weeks AS (
          SELECT DISTINCT p.id as partnership_id
          FROM partnerships p
          INNER JOIN weeks w ON p.id = w.partnershipid
          WHERE p.autocreateweeks = TRUE
            AND (p.weekcreationpauseduntil IS NULL OR p.weekcreationpauseduntil < NOW())
            AND w.weekend < NOW() - INTERVAL '1 minute'
            AND NOT EXISTS (
              SELECT 1 FROM weeks w2
              WHERE w2.partnershipid = p.id
              AND w2.weeknumber = w.weeknumber + 1
            )
          GROUP BY p.id
          HAVING MAX(w.weekend) < NOW() - INTERVAL '1 minute'
        )
        SELECT create_next_week_for_partnership(partnership_id)
        FROM partnerships_needing_weeks;
        $CRON$
      ) INTO v_job_id;
      RAISE NOTICE '✅ Scheduled job "create-next-weeks-hourly" created successfully with job ID: %', v_job_id;
    EXCEPTION
      WHEN insufficient_privilege THEN
        RAISE WARNING '⚠️ Insufficient privileges to create cron job. Contact Supabase admin to enable pg_cron extension and schedule the job.';
      WHEN OTHERS THEN
        RAISE WARNING '⚠️ Could not create cron job: %. You can manually trigger week creation using trigger_week_creation_for_all_partnerships() function.', SQLERRM;
    END;
  ELSE
    RAISE WARNING '⚠️ pg_cron extension not found. Automatic week creation will not run on a schedule.';
    RAISE WARNING '⚠️ You can manually trigger week creation using: SELECT * FROM trigger_week_creation_for_all_partnerships();';
    RAISE WARNING '⚠️ Or contact Supabase admin to enable pg_cron extension for automatic scheduling.';
  END IF;
END $$;

-- ============================================================================
-- STEP 7: Helper function to manually trigger week creation (for testing)
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_week_creation_for_all_partnerships()
RETURNS TABLE (
  partnership_id UUID,
  week_id UUID,
  status TEXT
) AS $$
DECLARE
  v_partnership RECORD;
  v_week_id UUID;
BEGIN
  FOR v_partnership IN 
    SELECT DISTINCT p.id
    FROM partnerships p
    INNER JOIN weeks w ON p.id = w.partnershipid
    WHERE p.autocreateweeks = TRUE
      AND (p.weekcreationpauseduntil IS NULL OR p.weekcreationpauseduntil < NOW())
      AND w.weekend < NOW() - INTERVAL '1 minute'
      AND NOT EXISTS (
        SELECT 1 FROM weeks w2
        WHERE w2.partnershipid = p.id
        AND w2.weeknumber = w.weeknumber + 1
      )
    GROUP BY p.id
    HAVING MAX(w.weekend) < NOW() - INTERVAL '1 minute'
  LOOP
    BEGIN
      v_week_id := create_next_week_for_partnership(v_partnership.id);
      partnership_id := v_partnership.id;
      week_id := v_week_id;
      status := CASE WHEN v_week_id IS NULL THEN 'skipped' ELSE 'created' END;
      RETURN NEXT;
    EXCEPTION
      WHEN OTHERS THEN
        partnership_id := v_partnership.id;
        week_id := NULL;
        status := 'error: ' || SQLERRM;
        RETURN NEXT;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION trigger_week_creation_for_all_partnerships IS 'Manually trigger week creation for all partnerships that need it. Useful for testing and manual runs.';

-- ============================================================================
-- STEP 8: Verification queries
-- ============================================================================

-- Check recent week creation logs
-- SELECT * FROM week_creation_log ORDER BY createdat DESC LIMIT 20;

-- Check partnerships with auto-creation enabled
-- SELECT id, autocreateweeks, weekcreationpauseduntil FROM partnerships WHERE autocreateweeks = TRUE;

-- Check scheduled jobs (only works if pg_cron is enabled)
-- SELECT * FROM cron.job WHERE jobname = 'create-next-weeks-hourly';

-- Check for partnerships that should have a new week but don't
-- SELECT p.id, p.autocreateweeks, MAX(w.weekend) as last_week_end, MAX(w.weeknumber) as last_week_number
-- FROM partnerships p
-- INNER JOIN weeks w ON p.id = w.partnershipid
-- WHERE p.autocreateweeks = TRUE
--   AND (p.weekcreationpauseduntil IS NULL OR p.weekcreationpauseduntil < NOW())
--   AND w.weekend < NOW() - INTERVAL '1 hour'
-- GROUP BY p.id
-- HAVING NOT EXISTS (
--   SELECT 1 FROM weeks w2
--   WHERE w2.partnershipid = p.id
--   AND w2.weeknumber = MAX(w.weeknumber) + 1
-- );

