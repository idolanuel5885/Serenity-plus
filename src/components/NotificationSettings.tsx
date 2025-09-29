'use client'

import { useNotifications } from '../hooks/useNotifications'

export default function NotificationSettings() {
  const { 
    isSupported, 
    permission, 
    isLoading, 
    enableNotifications, 
    sendTest 
  } = useNotifications()

  if (!isSupported) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">
          Notifications are not supported in this browser.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Push Notifications</h3>
          <p className="text-sm text-gray-600">
            Get reminders and updates about your meditation practice
          </p>
        </div>
        <div className="flex items-center gap-2">
          {permission.granted ? (
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              Enabled
            </span>
          ) : permission.denied ? (
            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
              Blocked
            </span>
          ) : (
            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
              Not Set
            </span>
          )}
        </div>
      </div>

      {!permission.granted && (
        <button
          onClick={enableNotifications}
          disabled={isLoading}
          className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50"
        >
          {isLoading ? 'Enabling...' : 'Enable Notifications'}
        </button>
      )}

      {permission.granted && (
        <div className="space-y-2">
          <button
            onClick={sendTest}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-600"
          >
            Send Test Notification
          </button>
          <p className="text-xs text-gray-500 text-center">
            Tap to test if notifications are working
          </p>
        </div>
      )}

      {permission.denied && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">
            Notifications are blocked. Please enable them in your browser settings.
          </p>
        </div>
      )}
    </div>
  )
}
