# Firebase Setup Guide for Serenity+

## Step 1: Create Firebase Project

1. **Go to [Firebase Console](https://console.firebase.google.com/)**
2. **Click "Create a project"**
3. **Project name**: `serenity-plus-demo`
4. **Enable Google Analytics**: Optional (can be disabled)
5. **Click "Create project"**

## Step 2: Set up Firestore Database

1. **In your Firebase project, go to "Firestore Database"**
2. **Click "Create database"**
3. **Choose "Start in test mode"** (for development)
4. **Select a location** (choose closest to your users)
5. **Click "Done"**

## Step 3: Get Firebase Configuration

1. **Go to Project Settings** (gear icon)
2. **Scroll down to "Your apps"**
3. **Click "Web" icon** (</>)
4. **App nickname**: `serenity-plus-web`
5. **Click "Register app"**
6. **Copy the configuration object**

## Step 4: Update Configuration

Replace the placeholder values in `firebase-config.js` with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: 'your-actual-api-key',
  authDomain: 'your-project-id.firebaseapp.com',
  projectId: 'your-actual-project-id',
  storageBucket: 'your-project-id.appspot.com',
  messagingSenderId: 'your-actual-sender-id',
  appId: 'your-actual-app-id',
};
```

## Step 5: Set up Firestore Security Rules

In Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all documents for now (development only)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**⚠️ WARNING**: These rules allow anyone to read/write your database. For production, implement proper authentication and security rules.

## Step 6: Test the Setup

1. **Build the project**: `npm run build`
2. **Deploy to Netlify**
3. **Test user registration** - check if users appear in Firestore
4. **Test partnerships** - check if partnerships are created between users

## Database Structure

### Users Collection

```javascript
{
  id: "auto-generated-id",
  name: "User Name",
  email: "user@example.com",
  weeklyTarget: 5,
  usualSitLength: 30,
  image: "/icons/meditation-1.svg",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z"
}
```

### Partnerships Collection

```javascript
{
  id: "auto-generated-id",
  userId: "user-id-1",
  partnerId: "user-id-2",
  partnerName: "Partner Name",
  partnerEmail: "partner@example.com",
  partnerImage: "/icons/meditation-1.svg",
  partnerWeeklyTarget: 5,
  userSits: 0,
  partnerSits: 0,
  weeklyGoal: 5,
  score: 0,
  currentWeekStart: "2024-01-01T00:00:00Z",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z"
}
```

## Troubleshooting

### Common Issues:

1. **"Firebase not initialized"** - Check your config values
2. **"Permission denied"** - Check Firestore security rules
3. **"Network error"** - Check internet connection and Firebase project status

### Debug Steps:

1. **Check browser console** for Firebase errors
2. **Check Firebase Console** for database activity
3. **Verify config values** match your Firebase project
4. **Test with simple read/write** operations first

## Next Steps After Setup:

1. **Test user registration** - Create a user and verify it appears in Firestore
2. **Test partnership creation** - Create two users and verify partnerships are created
3. **Test cross-device partnerships** - Users on different devices should see each other
4. **Implement proper security rules** for production use

## Production Considerations:

1. **Authentication**: Implement proper user authentication
2. **Security Rules**: Restrict database access to authenticated users only
3. **Data Validation**: Add server-side validation for user inputs
4. **Error Handling**: Implement proper error handling and user feedback
5. **Monitoring**: Set up Firebase monitoring and alerts
