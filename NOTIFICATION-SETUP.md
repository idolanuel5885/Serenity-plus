# 🔔 Notification System Setup

## ✅ **What's Implemented:**
- ✅ **PWA notification support** (manifest.json, service worker)
- ✅ **Firebase Cloud Messaging** integration
- ✅ **Notification permission handling**
- ✅ **Test notification functionality**
- ✅ **UI components** for notification settings

## 🔧 **Setup Required:**

### **1. Firebase Project Setup:**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or use existing
3. Enable **Cloud Messaging**
4. Go to Project Settings > Cloud Messaging
5. Generate a **Web Push certificate** (VAPID key)

### **2. Environment Variables:**
Create `.env.local` file with:
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key
```

### **3. Firebase SDK Installation:**
```bash
npm install firebase
```

## 📱 **How It Works:**

### **User Experience:**
1. **User opens PWA** → sees notification settings
2. **Taps "Enable Notifications"** → browser asks permission
3. **User grants permission** → notifications enabled
4. **User can test** with "Send Test Notification" button

### **Notification Types:**
- ✅ **Meditation reminders** (daily)
- ✅ **Partner updates** (when partner meditates)
- ✅ **Weekly summaries** (progress reports)
- ✅ **Invitation notifications** (new partnership requests)

## 🚀 **Next Steps:**
1. **Set up Firebase project**
2. **Add environment variables**
3. **Install Firebase SDK**
4. **Test notifications** on mobile
5. **Deploy updated PWA** to Netlify

## 📱 **Mobile Testing:**
- **iPhone**: Safari → Add to Home Screen → Test notifications
- **Android**: Chrome → Install App → Test notifications
- **Both**: Should work with PWA installation
