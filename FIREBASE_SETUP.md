# Firebase Backend Setup Guide

This guide will help you set up Firebase backend for Studentopia to enable real multi-user collaboration for groups and live study sessions.

## 📋 Prerequisites

- Google account
- 10-15 minutes setup time
- Studentopia app running locally

---

## 🚀 Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: **`Studentopia`** (or your preferred name)
4. Click **Continue**
5. **Disable Google Analytics** (optional for testing, can enable later)
6. Click **Create project**
7. Wait for project creation (30-60 seconds)
8. Click **Continue** when ready

---

## 🌐 Step 2: Register Web App

1. On the Project Overview page, click the **Web icon (</> code symbol)**
2. Enter app nickname: **`Studentopia Web`**
3. **Do NOT check** "Set up Firebase Hosting"
4. Click **Register app**
5. You'll see a `firebaseConfig` object - **KEEP THIS OPEN**

---

## 🔑 Step 3: Add Firebase Config to Your App

1. Copy the `firebaseConfig` values from Firebase Console
2. Open your `.env` file in the Studentopia project
3. Add these lines (replace with YOUR actual values from Firebase):

```bash
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:xxxxxxxxxxxxx
```

4. **Save the file**
5. **Restart your Expo development server** (important!)

---

## 🔐 Step 4: Enable Authentication

1. In Firebase Console, click **"Authentication"** in the left sidebar
2. Click **"Get started"**
3. Click on **"Sign-in method"** tab
4. Find **"Email/Password"** provider
5. Click **"Email/Password"**
6. Toggle **"Enable"** to ON
7. Click **"Save"**

---

## 📦 Step 5: Create Firestore Database (for Groups)

1. In Firebase Console, click **"Firestore Database"** in the left sidebar
2. Click **"Create database"**
3. Choose **"Start in test mode"** (we'll add security rules next)
4. Click **"Next"**
5. Choose your location (closest to your users, e.g., `us-central1`)
6. Click **"Enable"**
7. Wait for database creation (30-60 seconds)

### Add Security Rules

1. Click on **"Rules"** tab
2. Replace the content with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Groups collection
    match /groups/{groupId} {
      // Anyone authenticated can read groups
      allow read: if request.auth != null;

      // Only authenticated users can create groups
      allow create: if request.auth != null;

      // Only group teacher can update/delete
      allow update, delete: if request.auth != null &&
        resource.data.teacherId == request.auth.uid;
    }

    // User profiles collection
    match /users/{userId} {
      // Users can read any profile
      allow read: if request.auth != null;

      // Users can only write their own profile
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Click **"Publish"**

---

## ⚡ Step 6: Create Realtime Database (for Live Sessions)

1. In Firebase Console, click **"Realtime Database"** in the left sidebar
2. Click **"Create Database"**
3. Choose your location (same as Firestore)
4. Choose **"Start in test mode"**
5. Click **"Enable"**
6. Wait for database creation

### Add Security Rules

1. Click on **"Rules"** tab
2. Replace the content with:

```json
{
  "rules": {
    "study_rooms": {
      "$roomId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    },
    "room_messages": {
      "$roomId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}
```

3. Click **"Publish"**

---

## ✅ Step 7: Verify Setup

1. **Restart your Expo app** completely (close and reopen)
2. Open the app on your device/simulator
3. Try creating a new account (this will test Firebase Auth)
4. Try creating a group (this will test Firestore)
5. Try creating a live session (this will test Realtime Database)

### Check Firebase Console:
- Go to **Authentication** → **Users** tab → You should see your test user
- Go to **Firestore Database** → You should see a `groups` collection
- Go to **Realtime Database** → You should see `study_rooms` data

---

## 🧪 Testing Multi-User Features

### Test Groups:
1. **Device 1**: Create account as teacher → Create group → Copy share code
2. **Device 2**: Create account as student → Join group with code
3. **Device 1**: Check group members → Should see Device 2 student!

### Test Live Sessions:
1. **Device 1**: Create public live session → Start timer
2. **Device 2**: Browse public rooms → Join session
3. **Both devices**: Timer should be synchronized in real-time!
4. **Both devices**: Send chat messages → Should appear on both instantly

---

## 🔧 Troubleshooting

### "Firebase not configured" error
- Check that you added all Firebase env variables to `.env`
- Make sure to **restart Expo server** after changing `.env`
- Verify no typos in environment variable names

### "Permission denied" errors
- Check that security rules are published in Firestore
- Check that security rules are published in Realtime Database
- Verify user is authenticated before accessing data

### Users not seeing each other
- Confirm both users are authenticated (check Firebase Console → Authentication)
- Check internet connection on both devices
- Check Firebase Console to see if data is being written

### Timer not syncing
- Verify Realtime Database is created and rules are set
- Check `expo.log` file for any Firebase errors
- Ensure `EXPO_PUBLIC_FIREBASE_DATABASE_URL` is set correctly

---

## 💰 Cost Estimate (Testing Phase)

Firebase Free Tier includes:
- ✅ **Authentication**: 50,000 MAU (Monthly Active Users)
- ✅ **Firestore**: 1 GB storage, 50K reads/day, 20K writes/day
- ✅ **Realtime Database**: 1 GB storage, 10 GB/month downloads
- ✅ **Perfect for 10-50 test users** with no cost

---

## 🚀 Next Steps After Testing

Once testing is successful:

1. **Tighten Security Rules** - Add more specific permission checks
2. **Enable Production Mode** - Switch from test mode to production
3. **Add Indexes** - Firestore will suggest indexes as needed
4. **Monitor Usage** - Check Firebase Console for usage metrics
5. **Upgrade Plan** - Move to Blaze (pay-as-you-go) when ready to scale

---

## 📚 Additional Resources

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Firestore Docs](https://firebase.google.com/docs/firestore)
- [Realtime Database Docs](https://firebase.google.com/docs/database)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)

---

## 🎉 Success!

You now have a fully functional multi-user backend! Your 5-10 friends can:
- ✅ Create accounts and sign in
- ✅ Create and join groups with real-time sync
- ✅ Start live study sessions with synchronized timers
- ✅ Chat in real-time during sessions
- ✅ See each other's progress and activity

**Happy testing! 🚀**
