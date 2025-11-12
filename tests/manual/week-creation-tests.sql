-- Manual Test Script for Automatic Week Creation System
-- Run these tests in Supabase SQL Editor
-- Replace 'YOUR_TEST_PARTNERSHIP_ID' with an actual partnership ID from your database

-- ============================================================================
-- TEST 1: Verify Schema Changes Exist
-- ============================================================================
SELECT 
  'TEST 1: Schema Check' as test_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'partnerships' AND column_name = 'autocreateweeks'
    ) THEN 'PASS'
    ELSE 'FAIL - autocreateweeks column missing'
  END as result;

SELECT 
  'TEST 1b: week_creation_log table exists' as test_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'week_creation_log'
    ) THEN 'PASS'
    ELSE 'FAIL - week_creation_log table missing'
  END as result;

-- ============================================================================
-- TEST 2: Get Test Partnership Info
-- ============================================================================
-- First, let's find a partnership to test with
SELECT 
  'TEST 2: Find Test Partnership' as test_name,
  p.id as partnership_id,
  p.autocreateweeks,
  p.weekcreationpauseduntil,
  MAX(w.weeknumber) as last_week_number,
  MAX(w.weekend) as last_week_end,
  COUNT(DISTINCT w.id) as total_weeks
FROM partnerships p
LEFT JOIN weeks w ON p.id = w.partnershipid
GROUP BY p.id, p.autocreateweeks, p.weekcreationpauseduntil
HAVING COUNT(DISTINCT w.id) > 0  -- Has at least one week
ORDER BY MAX(w.weekend) DESC
LIMIT 5;

-- ============================================================================
-- TEST 3: Test get_current_week_for_partnership Function
-- ============================================================================
-- Replace 'YOUR_TEST_PARTNERSHIP_ID' with actual ID from TEST 2
SELECT 
  'TEST 3: get_current_week_for_partnership' as test_name,
  * 
FROM get_current_week_for_partnership('YOUR_TEST_PARTNERSHIP_ID'::uuid);

-- ============================================================================
-- TEST 4: Test create_next_week_for_partnership (IDEMPOTENCY TEST)
-- ============================================================================
-- Step 4a: Get current state
SELECT 
  'TEST 4a: Before Creation - Current Weeks' as test_name,
  weeknumber,
  weekstart,
  weekend,
  weeklygoal
FROM weeks
WHERE partnershipid = 'YOUR_TEST_PARTNERSHIP_ID'::uuid
ORDER BY weeknumber DESC
LIMIT 3;

-- Step 4b: Create next week (first time)
SELECT 
  'TEST 4b: Create Next Week (First Call)' as test_name,
  create_next_week_for_partnership('YOUR_TEST_PARTNERSHIP_ID'::uuid) as new_week_id;

-- Step 4c: Verify week was created
SELECT 
  'TEST 4c: After Creation - Verify New Week' as test_name,
  weeknumber,
  weekstart,
  weekend,
  weeklygoal,
  inviteesits,
  invitersits
FROM weeks
WHERE partnershipid = 'YOUR_TEST_PARTNERSHIP_ID'::uuid
ORDER BY weeknumber DESC
LIMIT 3;

-- Step 4d: Try to create again (should be idempotent)
SELECT 
  'TEST 4d: Create Next Week (Second Call - Should Skip)' as test_name,
  create_next_week_for_partnership('YOUR_TEST_PARTNERSHIP_ID'::uuid) as existing_week_id;

-- Step 4e: Check log for idempotency
SELECT 
  'TEST 4e: Check Log for Idempotency' as test_name,
  status,
  weeknumber,
  metadata->>'reason' as reason,
  createdat
FROM week_creation_log
WHERE partnershipid = 'YOUR_TEST_PARTNERSHIP_ID'::uuid
ORDER BY createdat DESC
LIMIT 5;

-- ============================================================================
-- TEST 5: Test Auto-Creation Disabled
-- ============================================================================
-- Step 5a: Disable auto-creation for test partnership
UPDATE partnerships 
SET autocreateweeks = FALSE
WHERE id = 'YOUR_TEST_PARTNERSHIP_ID'::uuid
RETURNING id, autocreateweeks;

-- Step 5b: Try to create week (should skip)
SELECT 
  'TEST 5: Auto-Creation Disabled' as test_name,
  create_next_week_for_partnership('YOUR_TEST_PARTNERSHIP_ID'::uuid) as result;

-- Step 5c: Check log
SELECT 
  'TEST 5c: Check Log for Skip' as test_name,
  status,
  metadata->>'reason' as reason
FROM week_creation_log
WHERE partnershipid = 'YOUR_TEST_PARTNERSHIP_ID'::uuid
ORDER BY createdat DESC
LIMIT 1;

-- Step 5d: Re-enable auto-creation
UPDATE partnerships 
SET autocreateweeks = TRUE
WHERE id = 'YOUR_TEST_PARTNERSHIP_ID'::uuid
RETURNING id, autocreateweeks;

-- ============================================================================
-- TEST 6: Test Paused Until Date
-- ============================================================================
-- Step 6a: Set pause until future date
UPDATE partnerships 
SET weekcreationpauseduntil = NOW() + INTERVAL '1 day'
WHERE id = 'YOUR_TEST_PARTNERSHIP_ID'::uuid
RETURNING id, weekcreationpauseduntil;

-- Step 6b: Try to create (should skip)
SELECT 
  'TEST 6: Paused Until Future' as test_name,
  create_next_week_for_partnership('YOUR_TEST_PARTNERSHIP_ID'::uuid) as result;

-- Step 6c: Clear pause
UPDATE partnerships 
SET weekcreationpauseduntil = NULL
WHERE id = 'YOUR_TEST_PARTNERSHIP_ID'::uuid
RETURNING id, weekcreationpauseduntil;

-- ============================================================================
-- TEST 7: Test Edge Case - No Previous Week
-- ============================================================================
-- Find a partnership with no weeks (if any)
SELECT 
  'TEST 7: Partnership with No Weeks' as test_name,
  p.id as partnership_id
FROM partnerships p
LEFT JOIN weeks w ON p.id = w.partnershipid
WHERE w.id IS NULL
LIMIT 1;

-- If found, test with that partnership
-- SELECT create_next_week_for_partnership('PARTNERSHIP_WITH_NO_WEEKS'::uuid);

-- ============================================================================
-- TEST 8: Test Batch Function
-- ============================================================================
SELECT 
  'TEST 8: Batch Week Creation' as test_name,
  *
FROM trigger_week_creation_for_all_partnerships();

-- ============================================================================
-- TEST 9: Verify Week Timing (7 days exactly)
-- ============================================================================
SELECT 
  'TEST 9: Week Timing Verification' as test_name,
  w1.weeknumber as prev_week_number,
  w1.weekend as prev_week_end,
  w2.weeknumber as next_week_number,
  w2.weekstart as next_week_start,
  w2.weekend as next_week_end,
  EXTRACT(EPOCH FROM (w2.weekstart - w1.weekend)) as seconds_between,
  EXTRACT(EPOCH FROM (w2.weekend - w2.weekstart)) as week_duration_seconds,
  CASE 
    WHEN EXTRACT(EPOCH FROM (w2.weekstart - w1.weekend)) = 1 THEN 'PASS - 1 second gap'
    ELSE 'FAIL - Wrong gap'
  END as gap_check,
  CASE 
    WHEN EXTRACT(EPOCH FROM (w2.weekend - w2.weekstart)) BETWEEN 604799 AND 604800 THEN 'PASS - ~7 days'
    ELSE 'FAIL - Wrong duration'
  END as duration_check
FROM weeks w1
JOIN weeks w2 ON w1.partnershipid = w2.partnershipid 
  AND w2.weeknumber = w1.weeknumber + 1
WHERE w1.partnershipid = 'YOUR_TEST_PARTNERSHIP_ID'::uuid
ORDER BY w1.weeknumber DESC
LIMIT 1;

-- ============================================================================
-- TEST 10: Check for Duplicates
-- ============================================================================
SELECT 
  'TEST 10: Duplicate Check' as test_name,
  partnershipid,
  weeknumber,
  COUNT(*) as count
FROM weeks
WHERE partnershipid = 'YOUR_TEST_PARTNERSHIP_ID'::uuid
GROUP BY partnershipid, weeknumber
HAVING COUNT(*) > 1;

-- Should return no rows (no duplicates)

-- ============================================================================
-- TEST 11: Review Creation Log
-- ============================================================================
SELECT 
  'TEST 11: Creation Log Review' as test_name,
  status,
  COUNT(*) as count,
  COUNT(*) * 100.0 / SUM(COUNT(*)) OVER () as percentage
FROM week_creation_log
WHERE createdat > NOW() - INTERVAL '1 day'
GROUP BY status
ORDER BY count DESC;

-- ============================================================================
-- TEST 12: Verify Unique Constraint
-- ============================================================================
-- This should fail if constraint is working
-- (Uncomment to test - will cause error if constraint exists)
-- INSERT INTO weeks (partnershipid, weeknumber, weekstart, weekend, weeklygoal)
-- SELECT 
--   partnershipid,
--   weeknumber,
--   weekstart,
--   weekend,
--   weeklygoal
-- FROM weeks
-- WHERE partnershipid = 'YOUR_TEST_PARTNERSHIP_ID'::uuid
-- LIMIT 1;

