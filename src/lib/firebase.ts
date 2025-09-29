import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Cloud Messaging and get a reference to the service
export const messaging = typeof window !== 'undefined' ? getMessaging(app) : null

export const getFirebaseToken = async (): Promise<string | null> => {
  if (!messaging) return null
  
  try {
    const token = await getToken(messaging, {
      vapidKey: firebaseConfig.vapidKey
    })
    return token
  } catch (error) {
    console.error('Error getting Firebase token:', error)
    return null
  }
}

export const onFirebaseMessage = (callback: (payload: unknown) => void) => {
  if (!messaging) return
  
  onMessage(messaging, (payload) => {
    callback(payload)
  })
}
