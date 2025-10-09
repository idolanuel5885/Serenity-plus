-- Fix existing partnerships with incorrect weekly goals
-- This script updates partnerships to have the correct combined weekly goal

-- First, let's see what we have
SELECT 
  p.id,
  p.userid,
  p.partnerid,
  p.weeklygoal as current_goal,
  u1.weeklytarget as user1_target,
  u2.weeklytarget as user2_target,
  (u1.weeklytarget + u2.weeklytarget) as correct_goal
FROM partnerships p
JOIN users u1 ON p.userid = u1.id
JOIN users u2 ON p.partnerid = u2.id
WHERE p.weeklygoal != (u1.weeklytarget + u2.weeklytarget);

-- Update partnerships with correct weekly goals
UPDATE partnerships 
SET weeklygoal = (
  SELECT u1.weeklytarget + u2.weeklytarget
  FROM users u1, users u2
  WHERE u1.id = partnerships.userid 
  AND u2.id = partnerships.partnerid
)
WHERE weeklygoal != (
  SELECT u1.weeklytarget + u2.weeklytarget
  FROM users u1, users u2
  WHERE u1.id = partnerships.userid 
  AND u2.id = partnerships.partnerid
);

-- Update weeks table with correct weekly goals
UPDATE weeks 
SET weeklygoal = (
  SELECT p.weeklygoal
  FROM partnerships p
  WHERE p.id = weeks.partnershipid
)
WHERE weeklygoal != (
  SELECT p.weeklygoal
  FROM partnerships p
  WHERE p.id = weeks.partnershipid
);

-- Verify the changes
SELECT 
  p.id,
  p.weeklygoal as partnership_goal,
  w.weeklygoal as week_goal,
  u1.weeklytarget as user1_target,
  u2.weeklytarget as user2_target
FROM partnerships p
JOIN users u1 ON p.userid = u1.id
JOIN users u2 ON p.partnerid = u2.id
LEFT JOIN weeks w ON p.id = w.partnershipid
ORDER BY p.id;

