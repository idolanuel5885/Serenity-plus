export interface NotificationPermission {
  granted: boolean
  denied: boolean
  default: boolean
}

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    return { granted: false, denied: true, default: false }
  }

  if (Notification.permission === 'granted') {
    return { granted: true, denied: false, default: false }
  }

  if (Notification.permission === 'denied') {
    return { granted: false, denied: true, default: false }
  }

  const permission = await Notification.requestPermission()
  return {
    granted: permission === 'granted',
    denied: permission === 'denied',
    default: permission === 'default'
  }
}

export const subscribeToNotifications = async (): Promise<string | null> => {
  try {
    // Request permission first
    const permission = await requestNotificationPermission()
    if (!permission.granted) {
      console.log('Notification permission denied')
      return null
    }

    // For static export, just return a mock token
    const mockToken = 'mock-fcm-token-' + Date.now()
    localStorage.setItem('fcm_token', mockToken)
    
    return mockToken
  } catch (error) {
    console.error('Error subscribing to notifications:', error)
    return null
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
