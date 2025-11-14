# Quick Android APK Build - Step by Step

**Goal:** Build APK for beta testing  
**Time:** 5 minutes setup + 15-20 minutes build time

---

## ✅ Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

**Or use npx (no install needed):**
```bash
npx eas-cli --version
```

---

## ✅ Step 2: Login to Expo

```bash
eas login
```

**Enter your Expo account:**
- Email: [your email]
- Password: [your password]
- Or create account at: https://expo.dev/signup

**Verify login:**
```bash
eas whoami
```

---

## ✅ Step 3: Build APK

**For beta testing (preview):**
```bash
eas build --platform android --profile preview
```

**What happens:**
1. ✅ Uploads your code to EAS servers
2. ✅ Builds APK in the cloud (10-20 min)
3. ✅ Provides download link when done
4. ✅ No Android Studio needed!

---

## 📱 Step 4: Download APK

**After build completes:**

1. **Check terminal** - Download link will appear
2. **Or go to:** https://expo.dev/accounts/kandicepereira/projects/vibecode/builds
3. **Click "Download"** on completed build
4. **Share APK** with beta testers!

---

## 🐛 Common Errors & Quick Fixes

### Error: "EAS CLI not found"
```bash
npm install -g eas-cli
# Or use: npx eas-cli build --platform android --profile preview
```

### Error: "Not logged in"
```bash
eas login
```

### Error: "Build failed"
- Check build logs in terminal
- Or view in EAS dashboard
- Share error message for help

### Error: "Project not found"
```bash
eas build:configure
```

---

## ✅ Your Configuration (Already Set!)

- ✅ **Package:** `com.kandicepereira.vibecode`
- ✅ **Version:** `1.0.0`
- ✅ **Build Type:** APK (perfect for beta)
- ✅ **SDK:** 34 (latest)
- ✅ **Kotlin:** 2.1.0 (compatible)

**Everything looks good!** 🎉

---

## 🚀 Ready to Build?

Run this command:
```bash
eas build --platform android --profile preview
```

**Or with npx (no install):**
```bash
npx eas-cli build --platform android --profile preview
```

---

## 📊 Monitor Build Progress

**While building:**
- Terminal shows progress
- Or check: https://expo.dev/accounts/kandicepereira/projects/vibecode/builds

**Build takes:** 15-20 minutes (cloud build)

---

## 🎯 After Build

1. **Download APK** from link
2. **Test on device:**
   - Transfer APK to Android phone
   - Enable "Install from unknown sources"
   - Install and test
3. **Share with testers:**
   - Upload to Google Drive/Dropbox
   - Share download link
   - Or use Firebase App Distribution

---

**Need help?** Share the exact error message! 🆘

