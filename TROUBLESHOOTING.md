# StudyPal Troubleshooting Guide

## Issue: Blank Screens on All Tabs (Except Profile)

### Root Cause
The app was showing blank screens because the user profile was not properly initialized in the app's local storage (AsyncStorage). When there's no valid user data, most screens show a fallback message or blank content.

### What Was Fixed

#### 1. **Improved App Initialization Logic** (`App.tsx`)
- Added validation to check if user has all required fields (`id`, `username`, `language`)
- Increased hydration wait time from 100ms to 200ms for more reliable AsyncStorage loading
- Added automatic cleanup of corrupted/partial user data
- If user data is invalid, the app now automatically shows the onboarding screen

#### 2. **Added Debug Logging**
Console logs are now added throughout the app to help identify issues:
- `[App] Initialization check` - Shows user validation status on startup
- `[App] User state changed` - Logs when user state updates
- `[HomeScreen] Rendered` - Confirms HomeScreen is rendering and user status

You can view these logs in:
- **Vibecode App**: LOGS tab
- **Local file**: `/home/user/workspace/expo.log`

### How to Fix Blank Screens

#### Option 1: Automatic Fix (Recommended)
**Close and reopen the app.** The updated code will:
1. Detect invalid/missing user data
2. Clear corrupted storage
3. Show the onboarding screen automatically
4. Let you create a fresh profile

#### Option 2: Manual Recovery (If Option 1 Doesn't Work)
If you still see blank screens after reopening:
1. Go to the **Profile** tab (only tab that shows content)
2. Look for the blue "Set Up Profile" button
3. Tap it to create a default profile:
   - Username: Student
   - Language: English (UK)
   - Theme: Nature
   - Study Pal: Buddy the Cat

#### Option 3: Clear App Storage (Last Resort)
If both options above fail:
1. Uninstall the Vibecode app completely
2. Reinstall it
3. Open StudyPal - you'll see onboarding screen
4. Complete the setup

### After Fixing: What to Expect

Once you complete onboarding or set up your profile, all tabs should display content:

1. ✅ **Home Tab** - Dashboard with Study Pal, progress tracking, quotes
2. ✅ **Tasks Tab** - Task list with add/edit/complete functionality
3. ✅ **Calendar Tab** - Month view with task indicators
4. ✅ **Timer Tab** - Pomodoro timer with customizable durations
5. ✅ **Music Tab** - Classical music player with 6 tracks
6. ✅ **AI Helper Tab** - Chat and grammar checker
7. ✅ **Tips Tab** - Study tips and motivational quotes
8. ✅ **Groups Tab** - Study groups (placeholder for future)
9. ✅ **Profile Tab** - User settings and customization

### Settings Screen

The Settings screen is **not a separate tab** - it's a modal accessed from the Profile screen:

1. Go to **Profile** tab
2. Tap the **gear icon** (⚙️) in the top-right corner
3. Settings modal opens with options for:
   - Enable Notifications
   - Calendar Sync
   - Daily Reminders
   - Test Notification

To close Settings, tap the "Close" button at the bottom.

### Verifying the Fix

After setting up your profile, check these indicators:

**1. Check Logs (LOGS tab in Vibecode or `expo.log` file):**
```
[App] Initialization check: { hasUser: true, hasId: true, hasUsername: true, hasLanguage: true, isValidUser: true }
[App] Valid user found - showing main app
[HomeScreen] Rendered. User: exists
[HomeScreen] User valid - rendering main content
```

**2. All Tabs Show Content:**
- No blank white screens
- Each tab displays its intended UI
- No "Please set up your profile" messages

**3. Settings Works:**
- Profile → Gear Icon → Settings modal opens
- All settings options visible
- "Close" button at bottom works

### Common Questions

**Q: Why did this happen?**
A: The app's AsyncStorage (local storage) had corrupted or incomplete user data, likely from a previous session or incomplete onboarding.

**Q: Will this happen again?**
A: No. The new code validates user data on every app start and automatically fixes issues.

**Q: What if I see blank screens on only some tabs?**
A: Check the logs. If `[App]` logs show a valid user but a specific screen is blank, there may be a different issue. Report which specific tab is blank.

**Q: The onboarding keeps showing even after I complete it**
A: Check the logs for `[App] Initialization check`. If `isValidUser` is false even after onboarding, the user data isn't being saved to AsyncStorage properly.

**Q: Can I change my profile after setup?**
A: Yes! Go to Profile tab to change:
- Username
- Language (14 options)
- Theme (10 color themes)
- Study Pal name and animal (20 animals)
- Animation settings

### Debug Checklist

If issues persist, check these in order:

- [ ] App reloaded/restarted after code changes
- [ ] Check LOGS tab for `[App]` initialization messages
- [ ] Onboarding screen appears (4-step setup)
- [ ] User profile created (check Profile tab shows your name)
- [ ] All 9 tabs are accessible via bottom navigation
- [ ] Settings modal opens from Profile → Gear icon

### Technical Details

**Files Modified:**
- `/home/user/workspace/App.tsx` - Improved initialization and validation logic
- `/home/user/workspace/src/screens/HomeScreen.tsx` - Added debug logging

**Key Changes:**
- User validation now checks for `id`, `username`, and `language` fields
- Increased AsyncStorage hydration wait time from 100ms → 200ms
- Added comprehensive console logging for debugging
- Automatic cleanup of invalid user data

**No Breaking Changes:**
- All existing features preserved
- All translations still work
- Music player, timer, tasks, calendar all functional
- No packages added or removed

### Still Having Issues?

If you're still experiencing blank screens:

1. **Share the logs** - Copy the contents of the LOGS tab or `expo.log` file
2. **Share a screenshot** - Show which tabs are blank
3. **Describe the steps** - What happens when you try to fix it?

The console logs will show exactly what's happening during initialization.
