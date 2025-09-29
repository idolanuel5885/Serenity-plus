export interface NotificationData {
  type: 'partner_meditation' | 'one_sitting_left' | 'weekly_goal_complete' | 'new_week_start'
  partnerName?: string
  username?: string
  clickAction?: string
}

export interface NotificationTrigger {
  type: string
  data: NotificationData
  scheduledTime?: Date
  timezone?: string
}

// Notification content templates
export const NOTIFICATION_TEMPLATES = {
  partner_meditation: (username: string) => ({
    title: 'Meditation Complete!',
    body: `${username} just completed a meditation! Give them a kudos!`,
    clickAction: '/'
  }),
  
  one_sitting_left: (partnerName: string) => ({
    title: 'Almost There!',
    body: `Nice job! You are one sitting away from meeting your weekly goal with ${partnerName}! Click here to start meditating`,
    clickAction: '/timer'
  }),
  
  weekly_goal_complete: (username: string) => ({
    title: 'Weekly Goal Complete!',
    body: `Woo-hoo! You and ${username} opened the lotus together. Huge kudos to both of you!`,
    clickAction: '/'
  }),
  
  new_week_start: (partnerName: string) => ({
    title: 'New Week Started!',
    body: `A new week started for you and ${partnerName}. Are you ready to open the lotus together?`,
    clickAction: '/'
  })
}

// Get user's timezone automatically
export const getUserTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch (error) {
    console.error('Error getting timezone:', error)
    return 'UTC' // fallback
  }
}

// Schedule notification for 8AM in user's timezone
export const schedule8AMNotification = (date: Date, timezone: string): Date => {
  const targetDate = new Date(date)
  targetDate.setHours(8, 0, 0, 0) // 8:00 AM
  
  // Convert to user's timezone
  const userTime = new Date(targetDate.toLocaleString('en-US', { timeZone: timezone }))
  return userTime
}
