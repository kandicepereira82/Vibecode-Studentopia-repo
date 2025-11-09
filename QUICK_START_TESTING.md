# Quick Start: Testing Firebase Backend

This guide helps you quickly test the new multi-user features with your 5-10 friends.

## ⚡ **Quick Setup (10 minutes)**

### Step 1: Complete Firebase Setup
Follow **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)** to:
1. Create Firebase project
2. Add config to `.env`
3. Enable Authentication
4. Create Firestore + Realtime Database
5. Set security rules

### Step 2: Restart Your App
```bash
# Stop expo server (Ctrl+C)
# Then restart:
bun start
```

---

## 🧪 **Test Scenarios**

### Test 1: Authentication
**Goal**: Verify Firebase auth is working

1. Open app on Device 1
2. Create new account with email/password
3. Check Firebase Console → Authentication → Users
4. ✅ **Success**: You should see your test user listed

### Test 2: Multi-User Groups
**Goal**: Test real group collaboration

**Device 1 (Teacher)**:
1. Sign up as teacher role
2. Go to Groups tab
3. Create group "Math Study Group"
4. Copy the 6-character share code

**Device 2 (Student)**:
1. Sign up as student role
2. Go to Groups tab
3. Tap "Join Group"
4. Enter share code from Device 1
5. ✅ **Success**: Group appears on Device 2!

**Verify in Firebase Console**:
- Go to Firestore Database
- Check `groups` collection
- You should see the group with both users in `studentIds` array

### Test 3: Live Study Sessions
**Goal**: Test real-time timer sync and chat

**Device 1 (Host)**:
1. Go to Groups tab → Live Sessions
2. Create "Focus Session" (public)
3. Start the 25-minute timer

**Device 2 (Participant)**:
1. Go to Groups tab → Live Sessions
2. Browse public rooms
3. Join "Focus Session"
4. ✅ **Success**: Timer should be synchronized!

**Test Chat**:
- Device 1: Send message "Hello!"
- Device 2: Should see message instantly
- Device 2: Reply "Hi!"
- Device 1: Should see reply instantly

**Verify in Firebase Console**:
- Go to Realtime Database
- Check `study_rooms/{roomId}`
- You should see live updates as you interact

### Test 4: Cross-Device Sync
**Goal**: Verify data persists across devices

**Device 1**:
1. Create 3 groups
2. Log out
3. Log in on Device 2 with same account
4. ✅ **Success**: All 3 groups appear!

---

## 📊 **What to Check in Firebase Console**

### Authentication Tab
- See all registered users
- Check user creation timestamps
- Verify email addresses

### Firestore Database
```
groups/
  └── {groupId}
      ├── name: "Math Study Group"
      ├── teacherId: "user123"
      ├── studentIds: ["user456", "user789"]
      └── shareCode: "ABC123"
```

### Realtime Database
```
study_rooms/
  └── {roomId}
      ├── hostUserId: "user123"
      ├── participants: [...]
      ├── timerRunning: true
      ├── timerMinutes: 24
      └── timerSeconds: 45

room_messages/
  └── {roomId}
      └── {messageId}
          ├── userId: "user123"
          ├── username: "Alex"
          ├── content: "Hello!"
          └── timestamp: 1234567890
```

---

## 🐛 **Common Issues**

### "Firebase not configured"
- Did you add Firebase config to `.env`?
- Did you restart Expo server after changing `.env`?

### Groups not syncing between devices
- Check Firebase Console → Firestore → groups collection
- Verify both users are authenticated
- Check `expo.log` for Firebase errors

### Timer not syncing in live sessions
- Verify Realtime Database is created
- Check security rules are published
- Confirm both devices have internet connection

### Can't see messages in chat
- Check Firebase Console → Realtime Database → room_messages
- Verify both users joined the same room
- Check for JavaScript errors in `expo.log`

---

## 📱 **Testing Tips**

### Use Multiple Devices
- **Best**: 2 physical devices (iPhone + Android, or 2 iPhones)
- **Good**: 1 physical device + 1 simulator
- **Works**: 2 different simulator instances

### Test Different Roles
- Create 1 teacher account
- Create 2-3 student accounts
- Test teacher features (create groups, analytics)
- Test student features (join groups, complete tasks)

### Test Offline Behavior
- Disconnect wifi on one device
- Try creating group/session
- Reconnect wifi
- ✅ Data should sync automatically

### Monitor in Real-Time
- Keep Firebase Console open while testing
- Watch data update live in Firestore
- See real-time updates in Realtime Database
- Check Authentication tab for new users

---

## ✅ **Success Checklist**

Before inviting your 5-10 friends, verify:

- [ ] Users can sign up with email/password
- [ ] Users appear in Firebase Console → Authentication
- [ ] Teachers can create groups
- [ ] Students can join groups with share codes
- [ ] Groups sync across devices instantly
- [ ] Live sessions can be created and joined
- [ ] Timers synchronize in real-time
- [ ] Chat messages appear instantly for all participants
- [ ] Data persists after closing and reopening app
- [ ] Multiple users can be in same session simultaneously

---

## 🎉 **Ready to Invite Friends!**

Once all tests pass:

1. **Share the app** with your 5-10 friends
2. **Create a test group** for everyone to join
3. **Schedule a live session** to test timer sync
4. **Collect feedback** on:
   - Sign up experience
   - Group joining flow
   - Live session usability
   - Chat functionality
   - Any bugs or confusion

---

## 📈 **Monitor Usage**

Firebase Console lets you see:
- **Authentication**: How many users signed up
- **Firestore**: How many groups created
- **Realtime Database**: How many live sessions active
- **Usage Metrics**: Storage, bandwidth, API calls

All free tier limits are MORE than enough for 5-10 users!

---

## 🚀 **After Testing**

Once testing goes well:
1. **Collect feedback** from friends
2. **Fix any issues** discovered
3. **Prepare for App Store launch**
4. **Migrate to production backend** (optional - see README)

Happy testing! 🎊
