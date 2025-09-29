import { NOTIFICATION_TEMPLATES, getUserTimezone, schedule8AMNotification } from './notificationTypes'
import { sendTestNotification } from './notifications'

export interface Partnership {
  id: string
  user: {
    id: string
    name: string
    fcmToken?: string
    timezone?: string
  }
  partner: {
    id: string
    name: string
    fcmToken?: string
    timezone?: string
  }
  userSits: number
  partnerSits: number
  weeklyGoal: number
  currentWeekStart: string
}

export class NotificationScheduler {
  private partnerships: Partnership[] = []

  // 1. Partner completed a meditation
  async notifyPartnerMeditation(partnership: Partnership, meditatorName: string) {
    const partner = partnership.partner
    if (!partner.fcmToken) return

    const template = NOTIFICATION_TEMPLATES.partner_meditation(meditatorName)
    
    // Send immediate notification to partner
    await this.sendNotification(partner.fcmToken, template.title, template.body, template.clickAction)
  }

  // 2. One sitting left (next day at 8AM)
  async scheduleOneSittingLeft(partnership: Partnership) {
    const user = partnership.user
    if (!user.fcmToken) return

    const timezone = user.timezone || getUserTimezone()
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const scheduledTime = schedule8AMNotification(tomorrow, timezone)
    const template = NOTIFICATION_TEMPLATES.one_sitting_left(partnership.partner.name)
    
    // Schedule notification for 8AM tomorrow
    await this.scheduleNotification(user.fcmToken, template.title, template.body, template.clickAction, scheduledTime)
  }

  // 3. Weekly goal complete
  async notifyWeeklyGoalComplete(partnership: Partnership, completerName: string) {
    const partner = partnership.partner
    if (!partner.fcmToken) return

    const template = NOTIFICATION_TEMPLATES.weekly_goal_complete(completerName)
    
    // Send immediate notification to partner
    await this.sendNotification(partner.fcmToken, template.title, template.body, template.clickAction)
  }

  // 4. New week started
  async notifyNewWeekStart(partnership: Partnership) {
    const user = partnership.user
    const partner = partnership.partner
    
    // Send to both users
    if (user.fcmToken) {
      const template = NOTIFICATION_TEMPLATES.new_week_start(partner.name)
      await this.sendNotification(user.fcmToken, template.title, template.body, template.clickAction)
    }
    
    if (partner.fcmToken) {
      const template = NOTIFICATION_TEMPLATES.new_week_start(user.name)
      await this.sendNotification(partner.fcmToken, template.title, template.body, template.clickAction)
    }
  }

  // Helper method to send immediate notification
  private async sendNotification(token: string, title: string, body: string, clickAction: string) {
    try {
      // For now, use the test notification function
      // In production, this would send via Firebase Cloud Messaging
      await sendTestNotification(title, body)
      console.log(`Notification sent to ${token}: ${title}`)
    } catch (error) {
      console.error('Error sending notification:', error)
    }
  }

  // Helper method to schedule notification
  private async scheduleNotification(token: string, title: string, body: string, clickAction: string, scheduledTime: Date) {
    try {
      // For now, just log the scheduled time
      // In production, this would use a proper scheduling service
      console.log(`Notification scheduled for ${scheduledTime.toISOString()}: ${title}`)
      
      // For demo purposes, send immediately (remove in production)
      setTimeout(async () => {
        await this.sendNotification(token, title, body, clickAction)
      }, 2000) // 2 second delay for demo
    } catch (error) {
      console.error('Error scheduling notification:', error)
    }
  }

  // Check if user needs "one sitting left" notification
  checkOneSittingLeft(partnership: Partnership): boolean {
    const userSits = partnership.userSits
    const weeklyGoal = partnership.weeklyGoal
    
    // User has completed all but one meditation
    return userSits === weeklyGoal - 1
  }

  // Check if weekly goal is complete
  checkWeeklyGoalComplete(partnership: Partnership): boolean {
    const userSits = partnership.userSits
    const partnerSits = partnership.partnerSits
    const weeklyGoal = partnership.weeklyGoal
    
    // Both partners have completed their weekly goal
    return userSits >= weeklyGoal && partnerSits >= weeklyGoal
  }

  // Check if new week has started
  checkNewWeekStart(partnership: Partnership): boolean {
    const currentWeekStart = new Date(partnership.currentWeekStart)
    const now = new Date()
    
    // Check if we're in a new week (Monday)
    const daysSinceWeekStart = Math.floor((now.getTime() - currentWeekStart.getTime()) / (1000 * 60 * 60 * 24))
    return daysSinceWeekStart >= 7
  }
}
