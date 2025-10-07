import { Partnership } from '@prisma/client';

export interface LotusProgressData {
  currentProgress: number; // 0-100
  weeklyTarget: number;
  currentWeekSits: number;
  isActive: boolean;
  sessionProgress: number; // 0-100 for current session
}

/**
 * Calculate lotus opening progress based on partnership data
 * Each user sees their own animation based on their individual session
 */
export function calculateLotusProgress(
  partnership: Partnership,
  userId: string,
  currentSessionDuration?: number,
  currentSessionElapsed?: number
): LotusProgressData {
  const totalSits = partnership.user1Sits + partnership.user2Sits;
  const weeklyTarget = partnership.weeklyGoal;
  
  // Calculate base progress (completed sits this week from database)
  const baseProgress = Math.min((totalSits / weeklyTarget) * 100, 100);
  
  // Calculate current session progress if meditation is active
  let sessionProgress = 0;
  if (currentSessionDuration && currentSessionElapsed !== undefined) {
    // Each session contributes 1/weeklyTarget percentage
    const sessionContribution = (1 / weeklyTarget) * 100;
    sessionProgress = Math.min((currentSessionElapsed / currentSessionDuration) * sessionContribution, sessionContribution);
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
  const totalSits = partnership.user1Sits + partnership.user2Sits;
  const weeklyTarget = partnership.weeklyGoal;
  
  return Math.min((totalSits / weeklyTarget) * 100, 100);
}

/**
 * Calculate progress increment for each completed meditation
 */
export function getProgressIncrement(partnership: Partnership): number {
  const weeklyTarget = partnership.weeklyGoal;
  return (1 / weeklyTarget) * 100; // Each sit adds this percentage
}

/**
 * Check if both partners have completed their weekly goal
 */
export function isWeeklyGoalComplete(partnership: Partnership): boolean {
  const user1Target = Math.ceil(partnership.weeklyGoal / 2); // Split goal between partners
  const user2Target = partnership.weeklyGoal - user1Target;
  
  return partnership.user1Sits >= user1Target && partnership.user2Sits >= user2Target;
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
