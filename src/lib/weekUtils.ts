import { prisma } from './prisma'

export async function checkAndTransitionWeek(partnershipId: string) {
  const partnership = await prisma.partnership.findUnique({
    where: { id: partnershipId }
  })

  if (!partnership) return

  const now = new Date()
  const weekStart = new Date(partnership.currentWeekStart)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 7) // 7 full days

  // If current week has ended
  if (now >= weekEnd) {
    // Save current week to history
    const goalMet = (partnership.user1Sits + partnership.user2Sits) >= partnership.weeklyGoal
    
    await prisma.weekHistory.create({
      data: {
        partnershipId,
        weekNumber: partnership.currentWeekNumber,
        weekStart: partnership.currentWeekStart,
        weekEnd,
        user1Sits: partnership.user1Sits,
        user2Sits: partnership.user2Sits,
        goalMet
      }
    })

    // Update streak
    const newCurrentStreak = goalMet ? partnership.currentStreak + 1 : 0
    const newLongestStreak = Math.max(partnership.longestStreak, newCurrentStreak)

    // Start new week
    await prisma.partnership.update({
      where: { id: partnershipId },
      data: {
        currentWeekNumber: partnership.currentWeekNumber + 1,
        currentWeekStart: weekEnd, // New week starts when old week ended
        user1Sits: 0,
        user2Sits: 0,
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        totalWeeks: partnership.totalWeeks + 1
      }
    })
  }
}