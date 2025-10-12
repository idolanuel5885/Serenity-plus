import { Partnership, Week } from './supabase-database';

export interface LotusProgressData {
  currentProgress: number; // 0-100
  weeklyTarget: number;
  currentWeekSits: number;
  isActive: boolean;
  sessionProgress: number; // 0-100 for current session
}

/**
 * Calculate lotus opening progress based on current week data
 * Each user sees their own animation based on their individual session
 */
export function calculateLotusProgress(
  currentWeek: Week,
  userId: string,
  currentSessionDuration?: number,
  currentSessionElapsed?: number
): LotusProgressData {
  const totalSits = currentWeek.user1sits + currentWeek.user2sits;
  const weeklyTarget = currentWeek.weeklygoal;
  
  // Calculate base progress (completed sits this week from database)
  const baseProgress = Math.min((totalSits / weeklyTarget) * 100, 100);
  
  // Calculate current session progress if meditation is active
  let sessionProgress = 0;
  if (currentSessionDuration && currentSessionElapsed !== undefined) {
    // Each session contributes 1/weeklyTarget percentage
    const sessionContribution = (1 / weeklyTarget) * 100;
    // Calculate session progress as percentage of session completion
    const sessionCompletionPercentage = currentSessionElapsed / currentSessionDuration;
    sessionProgress = sessionCompletionPercentage * sessionContribution;
  }
  
  // Total progress is base progress + current session progress
  const currentProgress = Math.min(baseProgress + sessionProgress, 100);
  
  return {
    currentProgress,
    weeklyTarget,
    currentWeekSits: totalSits,
    isActive: currentSessionDuration !== undefined && currentSessionElapsed !== undefined,
    sessionProgress
  };
}

/**
 * Get the starting progress for a new meditation session
 * This ensures the lotus starts where it left off from previous sessions
 */
export function getSessionStartProgress(partnership: Partnership): number {
  const totalSits = partnership.usersits + partnership.partnersits;
  const weeklyTarget = partnership.partnerweeklytarget + 5; // Assuming user's target is 5, should be dynamic
  
  return Math.min((totalSits / weeklyTarget) * 100, 100);
}

/**
 * Calculate progress increment for each completed meditation
 */
export function getProgressIncrement(partnership: Partnership): number {
  const weeklyTarget = partnership.partnerweeklytarget + 5; // Assuming user's target is 5, should be dynamic
  return (1 / weeklyTarget) * 100; // Each sit adds this percentage
}

/**
 * Check if both partners have completed their weekly goal
 */
export function isWeeklyGoalComplete(partnership: Partnership): boolean {
  const weeklyTarget = partnership.partnerweeklytarget + 5; // Assuming user's target is 5, should be dynamic
  const user1Target = Math.ceil(weeklyTarget / 2); // Split goal between partners
  const user2Target = weeklyTarget - user1Target;
  
  return partnership.usersits >= user1Target && partnership.partnersits >= user2Target;
}

/**
 * Get motivational message based on progress
 */
export function getProgressMessage(progress: number): string {
  if (progress === 0) {
    return "Begin your journey together";
  } else if (progress < 25) {
    return "The lotus begins to stir";
  } else if (progress < 50) {
    return "Petals start to unfurl";
  } else if (progress < 75) {
    return "The lotus is opening beautifully";
  } else if (progress < 100) {
    return "Almost there - the lotus is nearly open";
  } else {
    return "The lotus is fully open - you've achieved your weekly goal!";
  }
}
