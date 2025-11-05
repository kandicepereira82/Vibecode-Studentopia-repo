# Future Authentication Implementation Plan

**Date Created:** November 5, 2025
**Status:** Planned for future implementation
**Priority:** High

---

## Overview

Implement a full authentication system with login/signup screens and cloud data synchronization to allow users to access their Studentopia account across multiple devices.

---

## Current State

### What We Have Now:
- ✅ Local-only data persistence using Zustand + AsyncStorage
- ✅ Onboarding flow (4 steps) for first-time setup
- ✅ User data saved locally on device only
- ✅ Logout functionality that clears local data
- ✅ All user data (profile, tasks, stats, groups) stored locally

### Limitations:
- ❌ No cloud backup of user data
- ❌ No multi-device sync
- ❌ Data lost if app is uninstalled
- ❌ No user authentication (email/password)
- ❌ Cannot share account across devices
- ❌ No password recovery

---

## Implementation Requirements

### 1. Backend Infrastructure Needed

**Option A: Firebase (Recommended)**
- Firebase Authentication for user management
- Firestore Database for data storage
- Firebase Storage for media/images
- Setup required:
  - Create Firebase project
  - Add Firebase config to app
  - Install Firebase packages (may require ejecting from Expo)

**Option B: Supabase (Alternative)**
- PostgreSQL database
- Built-in authentication
- RESTful APIs
- Setup required:
  - Create Supabase project
  - Get API keys
  - Configure environment variables

**Option C: Custom Backend**
- Build REST API server
- Database (PostgreSQL, MongoDB, etc.)
- Authentication endpoints
- Hosting required

### 2. Authentication Features to Implement

**Screens to Build:**
- [ ] Login Screen (email + password)
- [ ] Signup Screen (email + password + profile setup)
- [ ] Forgot Password Screen
- [ ] Email Verification Flow
- [ ] Welcome/Splash Screen (checks auth state)

**Authentication Methods:**
- [ ] Email + Password (primary)
- [ ] Google Sign-In (optional)
- [ ] Apple Sign-In (required for iOS App Store)
- [ ] Guest/Anonymous mode (optional)

**Features:**
- [ ] Form validation (email format, password strength)
- [ ] Error handling (invalid credentials, network errors)
- [ ] Loading states during authentication
- [ ] Session management
- [ ] Auto-login if session valid
- [ ] Secure token storage
- [ ] Logout functionality (already exists, needs cloud integration)

### 3. Cloud Sync Implementation

**Data to Sync:**
- [ ] User Profile (username, role, email, creation date)
- [ ] Study Pal Configuration (name, animal, animations, theme)
- [ ] Tasks (all task data with CRUD operations)
- [ ] Statistics (study time, streaks, achievements)
- [ ] Groups (group memberships, shared tasks)
- [ ] Calendar Events (synced tasks and reminders)
- [ ] Timer Settings (study/break durations, alarm preferences)
- [ ] Preferences (language, notifications, theme)

**Sync Strategy:**
- [ ] Real-time sync (Firebase Realtime Database / Firestore listeners)
- [ ] Offline support (queue changes, sync when online)
- [ ] Conflict resolution (last-write-wins or timestamp-based)
- [ ] Initial data migration (move local data to cloud on first login)

**Database Schema Design:**
```
users/
  └── {userId}/
      ├── profile/
      │   ├── username
      │   ├── email
      │   ├── role
      │   ├── language
      │   ├── themeColor
      │   └── studyPalConfig/
      ├── tasks/
      │   └── {taskId}/
      ├── stats/
      ├── groups/
      └── preferences/
```

### 4. Navigation Flow Changes

**Current Flow:**
```
App Launch → Check Local Storage → Onboarding OR Home Screen
```

**New Flow:**
```
App Launch
  → Check Auth State
    → Not Authenticated → Login/Signup Screen
    → Authenticated → Load Cloud Data → Home Screen
```

**Screens to Update:**
- [ ] App.tsx - Add authentication state checking
- [ ] Create AuthNavigator.tsx (Login/Signup stack)
- [ ] Update RootNavigator to include AuthNavigator
- [ ] Add transition from Auth screens to Main app
- [ ] Handle onboarding for new users after signup

### 5. Environment Setup Required

**Environment Variables Needed:**
```env
# Firebase (if using)
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=

# Supabase (alternative)
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=

# Custom API (alternative)
EXPO_PUBLIC_API_BASE_URL=
EXPO_PUBLIC_API_KEY=
```

**Package Dependencies to Add:**
```json
{
  "firebase": "^10.x.x",
  "@react-native-firebase/app": "^18.x.x",
  "@react-native-firebase/auth": "^18.x.x",
  "@react-native-firebase/firestore": "^18.x.x",
  // OR
  "@supabase/supabase-js": "^2.x.x"
}
```

---

## Implementation Steps (When Ready)

### Phase 1: Backend Setup (1-2 hours)
1. Create Firebase/Supabase project
2. Configure authentication methods
3. Set up database structure
4. Configure security rules
5. Get API keys and add to .env

### Phase 2: Authentication Screens (3-4 hours)
1. Create LoginScreen.tsx
2. Create SignupScreen.tsx
3. Create ForgotPasswordScreen.tsx
4. Add form validation
5. Implement authentication service
6. Add error handling and loading states

### Phase 3: Navigation Integration (1-2 hours)
1. Create AuthNavigator
2. Update App.tsx with auth state checking
3. Add splash screen with auth loading
4. Handle navigation transitions
5. Test authentication flow

### Phase 4: Cloud Sync (4-6 hours)
1. Create cloud sync service
2. Update userStore to sync with cloud
3. Update taskStore to sync with cloud
4. Update statsStore to sync with cloud
5. Update groupStore to sync with cloud
6. Implement offline support
7. Add data migration for existing users

### Phase 5: Testing & Polish (2-3 hours)
1. Test signup flow
2. Test login flow
3. Test multi-device sync
4. Test offline functionality
5. Test logout and re-login
6. Handle edge cases and errors
7. Update README with authentication docs

**Total Estimated Time: 12-18 hours**

---

## Files That Will Be Created

```
src/
├── screens/
│   ├── LoginScreen.tsx          (NEW)
│   ├── SignupScreen.tsx         (NEW)
│   ├── ForgotPasswordScreen.tsx (NEW)
│   └── SplashScreen.tsx         (NEW - auth loading)
├── services/
│   ├── authService.ts           (NEW - Firebase/Supabase auth)
│   └── syncService.ts           (NEW - cloud data sync)
├── navigation/
│   └── AuthNavigator.tsx        (NEW - login/signup stack)
├── hooks/
│   └── useAuth.ts               (NEW - auth context/hook)
└── utils/
    └── validation.ts            (NEW - form validation)
```

## Files That Will Be Modified

```
src/
├── App.tsx                      (Add auth state checking)
├── navigation/
│   └── RootNavigator.tsx       (Add auth navigation)
├── state/
│   ├── userStore.ts            (Add cloud sync)
│   ├── taskStore.ts            (Add cloud sync)
│   ├── statsStore.ts           (Add cloud sync)
│   └── groupStore.ts           (Add cloud sync)
└── screens/
    ├── ProfileScreen.tsx       (Update logout to handle cloud)
    └── SettingsScreen.tsx      (Add account management options)
```

---

## User Experience Changes

### For New Users:
1. Open app → See Splash screen
2. Tap "Get Started" → Signup screen
3. Enter email, password, confirm password
4. Verify email (optional)
5. Complete onboarding (4 steps - same as current)
6. Access main app with data synced to cloud

### For Returning Users:
1. Open app → Automatic login if session valid
2. If session expired → Login screen
3. Enter email + password
4. Access main app with cloud data loaded

### For Users Switching Devices:
1. Install app on new device
2. Login with email + password
3. All data synced from cloud
4. Continue where they left off

---

## Security Considerations

- [ ] Password hashing (handled by Firebase/Supabase)
- [ ] Email verification before full access
- [ ] Secure token storage (use expo-secure-store)
- [ ] Rate limiting on login attempts
- [ ] Data encryption at rest
- [ ] Firestore security rules to prevent unauthorized access
- [ ] HTTPS for all API calls
- [ ] No sensitive data in client-side code

---

## Testing Checklist (When Implemented)

- [ ] User can sign up with valid email/password
- [ ] User receives verification email
- [ ] User can log in after signup
- [ ] User stays logged in after app restart
- [ ] User can reset forgotten password
- [ ] User can log out successfully
- [ ] Data syncs across devices
- [ ] Offline changes sync when back online
- [ ] App handles network errors gracefully
- [ ] Security rules prevent unauthorized access
- [ ] Multi-device login works correctly
- [ ] Data persists after logout/login

---

## Notes & Reminders

- **IMPORTANT:** This feature requires backend infrastructure that is not currently available in the Vibecode environment
- Wait until backend access is available or project is deployed outside Vibecode
- Consider using Firebase for fastest implementation
- May require ejecting from Expo Managed Workflow if using native Firebase modules
- Ensure compliance with GDPR/privacy laws for user data storage
- Add privacy policy and terms of service before collecting user emails
- Consider adding biometric authentication (Face ID/Touch ID) after basic auth is working

---

## Alternative: Lightweight Implementation

If full cloud sync is too complex, consider implementing:
1. **Account Export/Import** - Let users backup data to file and restore on new device
2. **QR Code Transfer** - Transfer data between devices via QR code
3. **Email Backup** - Email encrypted backup file to user
4. **iCloud/Google Drive Sync** - Use device cloud storage (simpler than custom backend)

---

## Contact for Implementation

When ready to implement:
1. Ensure you have backend infrastructure set up
2. Have Firebase/Supabase account created
3. Have API keys ready
4. Review this document
5. Ask Claude to implement this feature

**Estimated Timeline:** 2-3 days of development + testing

---

**END OF DOCUMENT**
