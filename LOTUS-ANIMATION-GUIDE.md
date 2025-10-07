# 🌸 Lotus Animation Implementation Guide

## Overview

The lotus animation is a beautiful, synchronized meditation progress indicator that unfolds as partners complete their weekly meditation goals together. The lotus only opens when both partners meditate, creating accountability and shared motivation.

## 🎯 Key Features

### **Progressive Opening**
- Each meditation session contributes to the lotus opening
- Progress is calculated as: `(completed_sits / weekly_goal) * 100`
- Each sit adds `(1 / weekly_goal) * 100` percentage points

### **Individual Animation**
- Each user sees their own lotus animation based on their timer
- No cross-viewing of partner's meditation sessions
- Database sync only happens when sessions complete

### **Session-based Animation**
- During meditation, the lotus animates smoothly based on elapsed time
- If user meditates for 30 minutes, the lotus opens 10% over 30 minutes
- Animation starts where the previous session ended

## 🏗️ Technical Implementation

### **Components**

1. **`LotusAnimation.tsx`** - Lottie animation component
   - Uses the provided lotus-animation.json
   - Animates based on progress percentage (0-100)
   - Shows progress indicator overlay

2. **`lotusProgress.ts`** - Progress calculation logic
   - Calculates base progress from completed sits
   - Adds current session progress
   - Handles weekly goal completion

3. **`useLotusProgress.ts`** - React hook for state management
   - Fetches progress from API
   - Updates progress during meditation
   - Handles loading and error states

4. **`usePartnershipSync.ts`** - Real-time synchronization
   - WebSocket connection for partner updates
   - Sends meditation start/end events
   - Receives partner progress updates

### **Database Schema**

The existing Prisma schema already supports the lotus animation:

```prisma
model Partnership {
  weeklyGoal    Int     // Combined weekly target
  user1Sits     Int     // Sits completed by user1 this week
  user2Sits     Int     // Sits completed by user2 this week
  currentWeekNumber Int // Week tracking
}

model Session {
  duration     Int      // Duration in minutes
  isCompleted  Boolean  // Whether session was completed
  completedAt  DateTime?
}
```

### **API Endpoints**

- `GET /api/lotus-progress` - Fetch current progress
- `POST /api/lotus-progress` - Update progress with session data

## 🎮 Usage

### **In Timer Component**

```tsx
<LotusAnimation
  progress={getLotusProgress()}
  isActive={isRunning}
  duration={user?.usualSitLength ? user.usualSitLength * 60 : 0}
  elapsed={user?.usualSitLength ? (user.usualSitLength * 60) - timeLeft : 0}
/>
```

### **Progress Calculation**

```typescript
const getLotusProgress = () => {
  const totalSits = partnership.weeklyGoal;
  const completedSits = partnership.userSits + partnership.partnerSits;
  const baseProgress = (completedSits / totalSits) * 100;
  
  // Add current session progress if running
  if (isRunning && user?.usualSitLength) {
    const sessionProgress = ((user.usualSitLength * 60 - timeLeft) / (user.usualSitLength * 60)) * 100;
    return Math.min(baseProgress + sessionProgress, 100);
  }
  
  return baseProgress;
};
```

## 🔄 Database Sync

### **Session Completion Events**

1. **Session Complete** - Updates database with new sit count
2. **Session Interrupted** - No database update
3. **Weekly Goal Met** - Triggers celebration

### **Sync Behavior**

- **Individual Animation**: Each user sees their own lotus progress
- **Database Updates**: Only when sessions complete successfully
- **Progress Tracking**: Cumulative progress from both partners
- **Session Interrupted**: No progress saved to database

## 🎨 Animation Details

### **Lottie Animation**
- **Total frames**: 417
- **Frame calculation**: `Math.floor((progress / 100) * 417)`
- **Smooth animation**: Updates every second during meditation
- **Progress overlay**: Shows percentage completion

### **Visual States**
- **0-25%**: "The lotus begins to stir"
- **25-50%**: "Petals start to unfurl"
- **50-75%**: "The lotus is opening beautifully"
- **75-100%**: "Almost there - the lotus is nearly open"
- **100%**: "The lotus is fully open - you've achieved your weekly goal!"

## 🚀 Deployment Notes

### **WebSocket Server**
- Production WebSocket URL needed in `websocket.ts`
- Fallback to polling if WebSocket unavailable
- Automatic reconnection with exponential backoff

### **Performance**
- Lottie animation is lightweight and smooth
- Progress updates throttled to 1 second intervals
- WebSocket messages are minimal and efficient

## 🧪 Testing

### **Local Development**
```bash
npm run dev
# Open timer page with partnership data
# Start meditation to see lotus animation
```

### **Partner Testing**
1. Create two user accounts
2. Form a partnership
3. Both users start meditating
4. Verify real-time sync works

## 📱 Mobile Considerations

- Animation works on all devices
- WebSocket reconnects on app resume
- Progress persists across sessions
- Smooth 60fps animation on modern devices

---

The lotus animation creates a beautiful, shared meditation experience that motivates partners to meditate together and achieve their weekly goals! 🌸✨
