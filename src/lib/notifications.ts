// import { getFirebaseToken } from './firebase'

export interface NotificationPermission {
  granted: boolean
  denied: boolean
  default: boolean
}

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.log('Notifications not supported in this browser')
    return { granted: false, denied: true, default: false }
  }

  console.log('Current notification permission:', Notification.permission)

  if (Notification.permission === 'granted') {
    return { granted: true, denied: false, default: false }
  }

  if (Notification.permission === 'denied') {
    console.log('Notifications already denied')
    return { granted: false, denied: true, default: false }
  }

  console.log('Requesting notification permission...')
  try {
    const permission = await Notification.requestPermission()
    console.log('Permission result:', permission)
    return {
      granted: permission === 'granted',
      denied: permission === 'denied',
      default: permission === 'default'
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error)
    return { granted: false, denied: true, default: false }
  }
}

export const subscribeToNotifications = async (): Promise<string | null> => {
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      console.log('Not in browser environment')
      return null
    }

    // Check if Notification API is available
    if (!('Notification' in window)) {
      console.log('Notification API not available')
      // Still return a mock token for demo purposes
      const mockToken = 'mock-fcm-token-' + Date.now()
      localStorage.setItem('fcm_token', mockToken)
      return mockToken
    }

    // Request permission first
    const permission = await requestNotificationPermission()
    if (!permission.granted) {
      console.log('Notification permission denied')
      // Still return a mock token for demo purposes
      const mockToken = 'mock-fcm-token-' + Date.now()
      localStorage.setItem('fcm_token', mockToken)
      return mockToken
    }

    // For static export, just return a mock token
    const mockToken = 'mock-fcm-token-' + Date.now()
    localStorage.setItem('fcm_token', mockToken)
    
    return mockToken
  } catch (error) {
    console.error('Error subscribing to notifications:', error)
    // Even on error, return a mock token for demo purposes
    const mockToken = 'mock-fcm-token-' + Date.now()
    localStorage.setItem('fcm_token', mockToken)
    return mockToken
  }
}

export const sendTestNotification = async (title: string, body: string) => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications')
    return
  }

  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/logo.svg',
      badge: '/logo.svg'
    })
  }
}

export const isNotificationSupported = (): boolean => {
  return 'Notification' in window && 'serviceWorker' in navigator
}
