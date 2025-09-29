'use client'

import { useState } from 'react'
import { sendTestNotification } from '../lib/notifications'

export default function NotificationDemo() {
  const [isLoading, setIsLoading] = useState(false)

  const triggerNotification = async (type: string) => {
    setIsLoading(true)
    try {
      let title = ''
      let body = ''
      
      switch (type) {
        case 'partner_meditation':
          title = 'Meditation Complete!'
          body = 'Sarah just completed a meditation! Give them a kudos!'
          break
        case 'one_sitting_left':
          title = 'Almost There!'
          body = 'Nice job! You are one sitting away from meeting your weekly goal with Alex! Click here to start meditating'
          break
        case 'weekly_goal_complete':
          title = 'Weekly Goal Complete!'
          body = 'Woo-hoo! You and Sarah opened the lotus together. Huge kudos to both of you!'
          break
        case 'new_week_start':
          title = 'New Week Started!'
          body = 'A new week started for you and Alex. Are you ready to open the lotus together?'
          break
      }
      
      await sendTestNotification(title, body)
    } catch (error) {
      console.error('Error triggering notification:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Notification Demo</h3>
      <p className="text-sm text-gray-600">
        Test the 4 notification types that will be sent automatically
      </p>
      
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => triggerNotification('partner_meditation')}
          disabled={isLoading}
          className="p-3 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50"
        >
          Partner Meditation
        </button>
        
        <button
          onClick={() => triggerNotification('one_sitting_left')}
          disabled={isLoading}
          className="p-3 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
        >
          One Sitting Left
        </button>
        
        <button
          onClick={() => triggerNotification('weekly_goal_complete')}
          disabled={isLoading}
          className="p-3 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 disabled:opacity-50"
        >
          Weekly Goal Complete
        </button>
        
        <button
          onClick={() => triggerNotification('new_week_start')}
          disabled={isLoading}
          className="p-3 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 disabled:opacity-50"
        >
          New Week Start
        </button>
      </div>
      
      {isLoading && (
        <div className="text-center">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-gray-500 mt-2">Sending notification...</p>
        </div>
      )}
    </div>
  )
}
