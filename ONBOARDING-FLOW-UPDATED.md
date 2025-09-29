# 📱 Updated Onboarding Flow - 5 Steps

## ✅ **New 5-Step Onboarding Process:**

### **Step 1: Welcome Page** (`/welcome`)
- **Invited users**: Shows inviter's name and avatar
- **Non-invited users**: Shows generic welcome message
- **CTA**: "Set up your profile" or "Get started"

### **Step 2: Nickname Page** (`/nickname`)
- **Validation**: 2-20 characters, letters/numbers/spaces only
- **Required field** for account creation

### **Step 3: Meditations Per Week** (`/meditations-per-week`)
- **Default**: 5 times per week
- **Contextual text**: "This will be your weekly commitment to yourself and to {partner name}"
- **Dropdown selection** for frequency

### **Step 4: Meditation Length** (`/meditation-length`)
- **Default**: 30 minutes
- **Contextual text**: "This will be the time you are accountable to meditating in each sitting"
- **Dropdown selection** for duration

### **Step 5: Notifications Page** (`/notifications`) ⭐ **NEW**
- **Title**: "Enable Notifications"
- **Description**: "So we can best support you and your partner's meditation commitment, we will need you to enable notifications"
- **Button**: "Enable Notifications and Continue"
- **Permission pop-up** appears when button is clicked
- **Redirects to homepage** after permission granted/denied

## 🔄 **Updated Flow:**

```
Welcome → Nickname → Meditations/Week → Meditation Length → Notifications → Homepage
```

## 📱 **User Experience:**

1. **User completes** meditation preferences
2. **User reaches** notifications page
3. **User taps** "Enable Notifications and Continue"
4. **Browser shows** permission pop-up
5. **User grants/denies** permission
6. **User is redirected** to homepage
7. **Notifications are ready** for the 4 notification types

## ✅ **What's Changed:**

- ✅ **Removed** notification settings from main page
- ✅ **Added** notifications as 5th onboarding step
- ✅ **Updated** meditation-length page to redirect to notifications
- ✅ **Updated** business rules to reflect 5-step process
- ✅ **Maintained** all existing functionality

**The onboarding flow now includes notification permission as a required step!** 🎉
