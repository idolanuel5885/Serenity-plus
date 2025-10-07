import { useState, useEffect } from 'react';
import {
  subscribeToNotifications,
  sendTestNotification,
  isNotificationSupported,
  type NotificationPermission,
} from '../lib/notifications';

export const useNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>({
    granted: false,
    denied: false,
    default: false,
  });
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsSupported(isNotificationSupported());

    if (isNotificationSupported()) {
      // Check current permission status
      if (Notification.permission === 'granted') {
        setPermission({ granted: true, denied: false, default: false });
      } else if (Notification.permission === 'denied') {
        setPermission({ granted: false, denied: true, default: false });
      } else {
        setPermission({ granted: false, denied: false, default: true });
      }
    }
  }, []);

  const enableNotifications = async () => {
    setIsLoading(true);
    try {
      const newToken = await subscribeToNotifications();
      setToken(newToken);

      if (newToken) {
        setPermission({ granted: true, denied: false, default: false });
        console.log('Notifications enabled successfully');
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendTest = async () => {
    await sendTestNotification('Serenity+ Test', 'This is a test notification from Serenity+');
  };

  return {
    isSupported,
    permission,
    token,
    isLoading,
    enableNotifications,
    sendTest,
  };
};
