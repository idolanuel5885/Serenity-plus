-- Monitoring Query for Week Creation System
-- Run this periodically to check if week creation is working properly
-- Can be used for alerts or dashboards

-- ============================================================================
-- Check 1: Recent Week Creation Activity (Last 24 Hours)
-- ============================================================================
SELECT 
  'Recent Activity (24h)' as check_name,
  COUNT(*) as total_attempts,
  COUNT(*) FILTER (WHERE status = 'success') as successful,
  COUNT(*) FILTER (WHERE status = 'skipped') as skipped,
  COUNT(*) FILTER (WHERE status = 'error') as errors,
  MAX(createdat) as most_recent_activity,
  CASE 
    WHEN MAX(createdat) > NOW() - INTERVAL '2 hours' THEN '✅ Active'
    WHEN MAX(createdat) > NOW() - INTERVAL '24 hours' THEN '⚠️ Stale'
    ELSE '❌ No recent activity'
  END as status
FROM week_creation_log
WHERE createdat > NOW() - INTERVAL '24 hours';

-- ============================================================================
-- Check 2: Recent Errors (Last 24 Hours)
-- ============================================================================
SELECT 
  'Recent Errors (24h)' as check_name,
  COUNT(*) as error_count,
  array_agg(DISTINCT errormessage) as error_messages,
  MAX(createdat) as most_recent_error
FROM week_creation_log
WHERE status = 'error'
  AND createdat > NOW() - INTERVAL '24 hours';

-- ============================================================================
-- Check 3: Partnerships That Need New Weeks (Should Have Been Created)
-- ============================================================================
SELECT 
  'Partnerships Needing Weeks' as check_name,
  COUNT(*) as partnerships_needing_weeks,
  array_agg(p.id::text) as partnership_ids
FROM partnerships p
INNER JOIN weeks w ON p.id = w.partnershipid
WHERE p.autocreateweeks = TRUE
  AND (p.weekcreationpauseduntil IS NULL OR p.weekcreationpauseduntil < NOW())
  AND w.weekend < NOW() - INTERVAL '1 hour'  -- Give it 1 hour buffer
  AND NOT EXISTS (
    SELECT 1 FROM weeks w2
    WHERE w2.partnershipid = p.id
    AND w2.weeknumber = w.weeknumber + 1
  )
GROUP BY p.id
HAVING MAX(w.weekend) < NOW() - INTERVAL '1 hour';

-- ============================================================================
-- Check 4: Cron Job Status (if pg_cron is enabled)
-- ============================================================================
DO $$
DECLARE
  v_cron_exists BOOLEAN;
  v_job_exists BOOLEAN;
  v_job_active BOOLEAN;
BEGIN
  SELECT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'cron') INTO v_cron_exists;
  
  IF v_cron_exists THEN
    SELECT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'create-next-weeks-hourly') INTO v_job_exists;
    
    IF v_job_exists THEN
      SELECT active INTO v_job_active FROM cron.job WHERE jobname = 'create-next-weeks-hourly' LIMIT 1;
      
      IF v_job_active THEN
        RAISE NOTICE '✅ Cron job is active and scheduled';
      ELSE
        RAISE WARNING '⚠️ Cron job exists but is INACTIVE';
      END IF;
    ELSE
      RAISE WARNING '⚠️ Cron job "create-next-weeks-hourly" not found';
    END IF;
  ELSE
    RAISE WARNING '⚠️ pg_cron not enabled - cron jobs cannot run';
  END IF;
END $$;

-- ============================================================================
-- Check 5: Health Summary (Combined View)
-- ============================================================================
WITH recent_activity AS (
  SELECT 
    COUNT(*) FILTER (WHERE status = 'success') as successful,
    COUNT(*) FILTER (WHERE status = 'error') as errors,
    MAX(createdat) as last_activity
  FROM week_creation_log
  WHERE createdat > NOW() - INTERVAL '24 hours'
),
needing_weeks AS (
  SELECT COUNT(DISTINCT p.id) as count
  FROM partnerships p
  INNER JOIN weeks w ON p.id = w.partnershipid
  WHERE p.autocreateweeks = TRUE
    AND (p.weekcreationpauseduntil IS NULL OR p.weekcreationpauseduntil < NOW())
    AND w.weekend < NOW() - INTERVAL '1 hour'
    AND NOT EXISTS (
      SELECT 1 FROM weeks w2
      WHERE w2.partnershipid = p.id
      AND w2.weeknumber = w.weeknumber + 1
    )
  GROUP BY p.id
  HAVING MAX(w.weekend) < NOW() - INTERVAL '1 hour'
)
SELECT 
  'Health Summary' as check_name,
  ra.successful as successful_creations_24h,
  ra.errors as errors_24h,
  ra.last_activity,
  COALESCE(nw.count, 0) as partnerships_needing_weeks,
  CASE 
    WHEN ra.last_activity > NOW() - INTERVAL '2 hours' AND COALESCE(nw.count, 0) = 0 THEN '✅ Healthy'
    WHEN ra.last_activity > NOW() - INTERVAL '6 hours' AND COALESCE(nw.count, 0) <= 2 THEN '⚠️ Warning'
    ELSE '❌ Critical'
  END as overall_status
FROM recent_activity ra
CROSS JOIN (SELECT COUNT(*) as count FROM needing_weeks) nw;

