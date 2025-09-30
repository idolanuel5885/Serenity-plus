'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { subscribeToNotifications } from '../../lib/notifications'

export default function NotificationsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleEnableNotifications = async () => {
    setIsLoading(true)
    try {
      console.log('Starting notification subscription...')
      const token = await subscribeToNotifications()
      console.log('Notification token result:', token)
      
      if (token) {
        console.log('Notifications enabled successfully')
        // Redirect to homepage after successful permission
        router.push('/')
      } else {
        console.log('Notification permission denied or failed')
        // Still redirect to homepage even if denied
        router.push('/')
      }
    } catch (error) {
      console.error('Error enabling notifications:', error)
      // Redirect to homepage even if error
      router.push('/')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="Serenity+" className="w-6 h-6" />
          <span className="font-bold text-lg">Serenity+</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8 flex-1 flex flex-col items-center justify-center text-center space-y-6">
        <img src="/logo.svg" alt="Serenity+" className="w-24 h-24 mx-auto" />
        
        <div className="space-y-4 flex-1 flex flex-col justify-center">
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">
            Enable Notifications
          </h1>
          
          <p className="text-lg text-gray-600 max-w-md">
            So we can best support you and your partner's meditation commitment, we will need you to enable notifications
          </p>
        </div>

        <button
          onClick={handleEnableNotifications}
          disabled={isLoading}
          className="w-full bg-black text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Enabling...' : 'Enable Notifications and Continue'}
        </button>
      </div>
    </div>
  )
}
