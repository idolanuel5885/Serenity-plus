-- Check Cron Job Status for Week Creation
-- Run this in Supabase SQL Editor to verify if the automatic week creation cron job is active

-- ============================================================================
-- STEP 1: Check if pg_cron extension is enabled
-- ============================================================================
SELECT 
  'pg_cron Extension Status' as check_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') 
    THEN '✅ pg_cron extension is enabled'
    ELSE '❌ pg_cron extension is NOT enabled'
  END as status;

-- ============================================================================
-- STEP 2: Check if the cron job exists
-- ============================================================================
-- This will only work if pg_cron is enabled and you have access to the cron schema
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'cron') THEN
      RAISE NOTICE '✅ pg_cron extension is enabled and cron schema exists';
    ELSE
      RAISE WARNING '⚠️ pg_cron extension exists but cron schema not found';
    END IF;
  ELSE
    RAISE WARNING '❌ pg_cron extension not found. Cron jobs cannot be scheduled.';
    RAISE WARNING '💡 You can manually trigger week creation using: SELECT * FROM trigger_week_creation_for_all_partnerships();';
  END IF;
END $$;

-- Check cron job status (safely check if schema exists first)
DO $$
DECLARE
  v_cron_exists BOOLEAN;
  v_job_exists BOOLEAN;
  rec RECORD;
BEGIN
  -- Check if cron schema exists
  SELECT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'cron') INTO v_cron_exists;
  
  IF v_cron_exists THEN
    -- Check if the job exists
    SELECT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'create-next-weeks-hourly') INTO v_job_exists;
    
    IF v_job_exists THEN
      RAISE NOTICE '✅ Cron job "create-next-weeks-hourly" is scheduled and active';
      FOR rec IN SELECT jobid, schedule, active FROM cron.job WHERE jobname = 'create-next-weeks-hourly' LOOP
        RAISE NOTICE '   Job ID: %, Schedule: %, Active: %', rec.jobid, rec.schedule, rec.active;
      END LOOP;
    ELSE
      RAISE WARNING '⚠️ Cron schema exists but job "create-next-weeks-hourly" not found';
      RAISE WARNING '💡 The cron job was not created. You can manually trigger week creation using: SELECT * FROM trigger_week_creation_for_all_partnerships();';
    END IF;
  ELSE
    RAISE WARNING '❌ pg_cron not enabled - cron schema does not exist';
    RAISE WARNING '💡 Cron jobs cannot be scheduled. You can manually trigger week creation using: SELECT * FROM trigger_week_creation_for_all_partnerships();';
    RAISE WARNING '💡 To enable pg_cron: Go to Supabase Dashboard → Database → Extensions → Enable pg_cron';
  END IF;
END $$;

-- Status is shown in the DO block above via RAISE NOTICE/WARNING messages

-- ============================================================================
-- STEP 3: Check recent week creation log entries
-- ============================================================================
-- This shows if week creation has been happening (either via cron or manual)
SELECT 
  'Recent Week Creation Activity' as check_name,
  COUNT(*) as total_entries,
  COUNT(*) FILTER (WHERE status = 'success') as successful,
  COUNT(*) FILTER (WHERE status = 'skipped') as skipped,
  COUNT(*) FILTER (WHERE status = 'error') as errors,
  MAX(createdat) as most_recent_activity
FROM week_creation_log
WHERE createdat > NOW() - INTERVAL '24 hours';

-- ============================================================================
-- STEP 4: Check partnerships that need new weeks
-- ============================================================================
-- This shows partnerships that should have a new week created
SELECT 
  'Partnerships Needing New Weeks' as check_name,
  p.id as partnership_id,
  p.autocreateweeks,
  p.weekcreationpauseduntil,
  MAX(w.weeknumber) as last_week_number,
  MAX(w.weekend) as last_week_end,
  NOW() - MAX(w.weekend) as time_since_week_end,
  CASE 
    WHEN MAX(w.weekend) < NOW() - INTERVAL '1 minute' THEN '⚠️ Needs new week'
    ELSE '✅ Week is current'
  END as status
FROM partnerships p
INNER JOIN weeks w ON p.id = w.partnershipid
WHERE p.autocreateweeks = TRUE
  AND (p.weekcreationpauseduntil IS NULL OR p.weekcreationpauseduntil < NOW())
GROUP BY p.id, p.autocreateweeks, p.weekcreationpauseduntil
HAVING MAX(w.weekend) < NOW() - INTERVAL '1 minute'
  AND NOT EXISTS (
    SELECT 1 FROM weeks w2
    WHERE w2.partnershipid = p.id
    AND w2.weeknumber = MAX(w.weeknumber) + 1
  )
ORDER BY MAX(w.weekend) DESC;

-- ============================================================================
-- STEP 5: Manual trigger option (if cron is not working)
-- ============================================================================
-- If cron is not working, you can manually trigger week creation:
-- SELECT * FROM trigger_week_creation_for_all_partnerships();
--
-- Or schedule it externally (e.g., Vercel Cron, GitHub Actions, etc.)

