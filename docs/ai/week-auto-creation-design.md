# Automatic Week Creation System Design

## Overview
This document describes the architecture for automatically creating new weeks for partnerships exactly one week after the previous week was created, with robust failure prevention and frontend control mechanisms.

## Core Principles
1. **Automatic**: No user involvement required
2. **Reliable**: Multiple failure prevention mechanisms
3. **Idempotent**: Safe to run multiple times
4. **Controllable**: Frontend can stop/start auto-creation
5. **Historical**: Preserve all week data (never update, always create new)

## Architecture Components

### 1. Database Schema Changes

#### Add to `partnerships` table:
```sql
ALTER TABLE partnerships 
ADD COLUMN IF NOT EXISTS autocreateweeks BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS weekcreationpauseduntil TIMESTAMP WITH TIME ZONE NULL;

-- Index for efficient querying
CREATE INDEX IF NOT EXISTS idx_partnerships_autocreateweeks 
ON partnerships(autocreateweeks) 
WHERE autocreateweeks = TRUE;
```

**Fields:**
- `autocreateweeks`: Boolean flag to enable/disable auto-creation (default: true)
- `weekcreationpauseduntil`: Optional timestamp to temporarily pause until a specific date (NULL = not paused)

#### Add `week_creation_log` table for audit trail:
```sql
CREATE TABLE IF NOT EXISTS week_creation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnershipid UUID NOT NULL REFERENCES partnerships(id),
  weekid UUID REFERENCES weeks(id),
  weeknumber INTEGER NOT NULL,
  createdat TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL, -- 'success', 'skipped', 'error'
  errormessage TEXT,
  retrycount INTEGER DEFAULT 0,
  metadata JSONB -- Store additional context
);

CREATE INDEX IF NOT EXISTS idx_week_creation_log_partnershipid 
ON week_creation_log(partnershipid, createdat DESC);
```

### 2. Scheduling Mechanism

**Option A: Supabase pg_cron (Recommended)**
- Native PostgreSQL extension
- Runs directly in database
- No external dependencies
- Reliable and well-tested

**Option B: Vercel Cron Jobs**
- Runs as serverless function
- Good for Next.js apps
- Requires external service

**Option C: Separate Worker Service**
- Most flexible
- Requires infrastructure management

**Recommendation: Option A (pg_cron)** for simplicity and reliability.

### 3. Week Creation Logic

#### Core Algorithm:
1. **Find partnerships needing new weeks:**
   - `autocreateweeks = TRUE`
   - `weekcreationpauseduntil IS NULL OR weekcreationpauseduntil < NOW()`
   - Last week's `weekend` is in the past (or within a grace period)

2. **For each partnership:**
   - Get the most recent week (ordered by `weeknumber DESC`)
   - Calculate next week number
   - Calculate week start/end dates (exactly 7 days after previous week end)
   - Create new week record
   - Log the creation

3. **Failure handling:**
   - If week already exists (idempotency check), skip
   - If error occurs, log it and continue with next partnership
   - Implement retry logic for transient failures

### 4. Implementation Details

#### SQL Function for Week Creation:
```sql
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
BEGIN
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

  -- Check if next week already exists (idempotency)
  IF EXISTS (
    SELECT 1 FROM weeks
    WHERE partnershipid = p_partnership_id
    AND weeknumber = v_last_week.weeknumber + 1
  ) THEN
    INSERT INTO week_creation_log (
      partnershipid, weeknumber, status, metadata
    ) VALUES (
      p_partnership_id, v_last_week.weeknumber + 1, 'skipped',
      jsonb_build_object('reason', 'week_already_exists')
    );
    RETURN NULL;
  END IF;

  -- Calculate next week details
  v_next_week_number := v_last_week.weeknumber + 1;
  v_week_start := v_last_week.weekend + INTERVAL '1 second'; -- Start immediately after previous week ends
  v_week_end := v_week_start + INTERVAL '7 days' - INTERVAL '1 second'; -- Exactly 7 days later

  -- Get weekly goal from users' targets
  SELECT 
    u1.weeklytarget,
    u2.weeklytarget
  INTO v_user1_target, v_user2_target
  FROM partnerships p
  JOIN users u1 ON p.userid = u1.id
  JOIN users u2 ON p.partnerid = u2.id
  WHERE p.id = p_partnership_id;

  v_weekly_goal := COALESCE(v_user1_target, 5) + COALESCE(v_user2_target, 5);

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
      'weekly_goal', v_weekly_goal
    )
  );

  RETURN v_new_week_id;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error
    INSERT INTO week_creation_log (
      partnershipid, weeknumber, status, errormessage, metadata
    ) VALUES (
      p_partnership_id, v_next_week_number, 'error',
      SQLERRM,
      jsonb_build_object('sqlstate', SQLSTATE)
    );
    RAISE;
END;
$$ LANGUAGE plpgsql;
```

#### Scheduled Job (pg_cron):
```sql
-- Enable pg_cron extension (run as superuser)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule job to run every hour
SELECT cron.schedule(
  'create-next-weeks',           -- Job name
  '0 * * * *',                   -- Every hour at minute 0
  $$
  WITH partnerships_needing_weeks AS (
    SELECT DISTINCT p.id as partnership_id
    FROM partnerships p
    INNER JOIN weeks w ON p.id = w.partnershipid
    WHERE p.autocreateweeks = TRUE
      AND (p.weekcreationpauseduntil IS NULL OR p.weekcreationpauseduntil < NOW())
      AND w.weekend < NOW() - INTERVAL '1 minute'  -- Grace period of 1 minute
      AND NOT EXISTS (
        -- Check if next week already exists
        SELECT 1 FROM weeks w2
        WHERE w2.partnershipid = p.id
        AND w2.weeknumber = w.weeknumber + 1
      )
    GROUP BY p.id
    HAVING MAX(w.weekend) < NOW() - INTERVAL '1 minute'
  )
  SELECT create_next_week_for_partnership(partnership_id)
  FROM partnerships_needing_weeks;
  $$
);
```

### 5. Current Week Identification

#### Helper Function:
```sql
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
  goalmet BOOLEAN
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
    w.goalmet
  FROM weeks w
  WHERE w.partnershipid = p_partnership_id
    AND NOW() >= w.weekstart
    AND NOW() <= w.weekend
  ORDER BY w.weeknumber DESC
  LIMIT 1;
  
  -- If no current week found, return the most recent week
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
      w.goalmet
    FROM weeks w
    WHERE w.partnershipid = p_partnership_id
    ORDER BY w.weeknumber DESC
    LIMIT 1;
  END IF;
END;
$$ LANGUAGE plpgsql;
```

### 6. Frontend Control API

#### API Endpoints:

**Pause Auto-Creation:**
```typescript
// POST /api/partnerships/[id]/pause-weeks
{
  pausedUntil: string | null  // ISO timestamp or null to pause indefinitely
}
```

**Resume Auto-Creation:**
```typescript
// POST /api/partnerships/[id]/resume-weeks
// Sets autocreateweeks = TRUE and weekcreationpauseduntil = NULL
```

**Check Auto-Creation Status:**
```typescript
// GET /api/partnerships/[id]/week-settings
// Returns: { autocreateweeks: boolean, weekcreationpauseduntil: string | null }
```

### 7. Failure Prevention Mechanisms

1. **Idempotency Checks:**
   - Check if week already exists before creating
   - Use unique constraint on (partnershipid, weeknumber)

2. **Transaction Safety:**
   - All operations in transactions
   - Rollback on errors

3. **Grace Period:**
   - Check `weekend < NOW() - INTERVAL '1 minute'` to avoid race conditions
   - Prevents multiple jobs from creating the same week

4. **Error Logging:**
   - All attempts logged in `week_creation_log`
   - Includes error messages and retry counts

5. **Retry Logic:**
   - Failed creations can be retried manually or via separate job
   - Track retry count to prevent infinite loops

6. **Validation:**
   - Verify partnership exists and is active
   - Verify previous week exists
   - Verify weekly goal can be calculated

7. **Locking:**
   - Use advisory locks to prevent concurrent creation for same partnership
   ```sql
   PERFORM pg_advisory_xact_lock(hashtext(p_partnership_id::text));
   ```

### 8. Monitoring & Observability

1. **Log Table Queries:**
   ```sql
   -- Recent failures
   SELECT * FROM week_creation_log 
   WHERE status = 'error' 
   ORDER BY createdat DESC 
   LIMIT 10;

   -- Success rate
   SELECT 
     status,
     COUNT(*) as count,
     COUNT(*) * 100.0 / SUM(COUNT(*)) OVER () as percentage
   FROM week_creation_log
   WHERE createdat > NOW() - INTERVAL '7 days'
   GROUP BY status;
   ```

2. **Health Check:**
   - Monitor job execution in pg_cron
   - Alert on consecutive failures
   - Track partnerships missing weeks

### 9. Migration Strategy

1. **Phase 1:** Add schema changes (non-breaking)
2. **Phase 2:** Deploy functions and jobs
3. **Phase 3:** Enable for test partnerships
4. **Phase 4:** Gradual rollout to all partnerships
5. **Phase 5:** Monitor and adjust

### 10. Edge Cases Handled

- **No previous week:** Log error, don't create
- **Week already exists:** Skip (idempotent)
- **Partnership deleted:** Foreign key constraint prevents orphaned weeks
- **Auto-creation disabled:** Skip silently
- **Paused until future date:** Skip until date passes
- **Concurrent execution:** Advisory locks prevent duplicates
- **Database errors:** Logged and don't crash job
- **Missing user data:** Use defaults (5 + 5 = 10)

## Implementation Priority

1. **High Priority:**
   - Database schema changes
   - Core week creation function
   - Scheduled job setup
   - Current week helper function

2. **Medium Priority:**
   - Frontend control API
   - Logging and monitoring
   - Error handling improvements

3. **Low Priority:**
   - Retry mechanism
   - Advanced monitoring dashboards
   - Alerting system

