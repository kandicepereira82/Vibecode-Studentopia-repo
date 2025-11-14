# Android APK Build Guide for Beta Testing

**Quick guide to build Android APK using Expo EAS Build**

---

## 🚀 Quick Start

### Step 1: Install EAS CLI

```bash
# Install globally
npm install -g eas-cli

# Or use npx (no installation needed)
npx eas-cli --version
```

### Step 2: Login to Expo

```bash
eas login
```

Enter your Expo account credentials (or create one at https://expo.dev)

---

## 📱 Build Android APK

### Option A: Cloud Build (Recommended - Easiest)

```bash
# Build APK for beta testing
eas build --platform android --profile preview

# Or for production
eas build --platform android --profile production
```

**What happens:**
- ✅ Builds in the cloud (no local setup needed)
- ✅ Takes 10-20 minutes
- ✅ Downloads APK automatically when done
- ✅ No Android Studio needed

**After build completes:**
- APK will be available in EAS dashboard
- Download link will be provided
- Share APK with beta testers

---

### Option B: Local Build (Faster, but requires Android SDK)

```bash
# Build locally (requires Android SDK setup)
eas build --platform android --profile preview --local
```

**Requirements:**
- Android SDK installed
- Java JDK 11+
- Gradle configured
- More complex setup

---

## ⚙️ Current Configuration

Your `eas.json` is configured for:
- ✅ **Preview profile:** Builds APK (`buildType: "apk"`)
- ✅ **Production profile:** Builds APK (`buildType: "apk"`)
- ✅ **Auto-increment:** Version codes increment automatically

Your `app.json` has:
- ✅ **Package name:** `com.kandicepereira.vibecode`
- ✅ **Version:** `1.0.0`
- ✅ **Version code:** `1`
- ✅ **Build properties:** Configured (SDK 34, Kotlin 2.1.0)

---

## 🐛 Common Errors & Fixes

### Error 1: "EAS CLI not found"

**Fix:**
```bash
npm install -g eas-cli
# Or use npx
npx eas-cli build --platform android --profile preview
```

---

### Error 2: "Not logged in"

**Fix:**
```bash
eas login
# Enter your Expo account email/password
```

---

### Error 3: "Build failed: Gradle error"

**Possible causes:**
- Kotlin version mismatch
- SDK version issues
- Missing dependencies

**Check your `app.json` build properties:**
```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "compileSdkVersion": 34,
            "targetSdkVersion": 34,
            "minSdkVersion": 24,
            "buildToolsVersion": "34.0.0",
            "kotlinVersion": "2.1.0"
          }
        }
      ]
    ]
  }
}
```

**Current config looks good!** ✅

---

### Error 4: "Invalid credentials" or "Project not found"

**Fix:**
```bash
# Check your project ID
cat app.json | grep projectId

# Should match your Expo project
# If not, run:
eas build:configure
```

---

### Error 5: "Build timeout" or "Build taking too long"

**Fix:**
- Cloud builds can take 15-30 minutes
- Check EAS dashboard: https://expo.dev/accounts/[your-account]/projects/[your-project]/builds
- Wait for completion
- Check build logs for specific errors

---

### Error 6: "Missing environment variables"

**If you're using Supabase:**
- Make sure `.env` file has Supabase credentials
- EAS Build will automatically include them
- Check: `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`

**Note:** EAS Build reads `.env` automatically for `EXPO_PUBLIC_*` variables

---

## 📋 Pre-Build Checklist

Before building, verify:

- [ ] **EAS CLI installed:** `eas --version`
- [ ] **Logged in:** `eas whoami`
- [ ] **Project configured:** Check `app.json` has `projectId`
- [ ] **Version set:** `app.json` has `version` and `versionCode`
- [ ] **Package name set:** `app.json` → `android.package`
- [ ] **Dependencies installed:** `bun install` or `npm install`
- [ ] **No TypeScript errors:** `npm run typecheck`
- [ ] **Environment variables:** `.env` file exists (if using Supabase)

---

## 🎯 Build Commands Reference

```bash
# Check EAS CLI version
eas --version

# Login to Expo
eas login

# Check current user
eas whoami

# Configure EAS (if needed)
eas build:configure

# Build Android APK (preview)
eas build --platform android --profile preview

# Build Android APK (production)
eas build --platform android --profile production

# Build locally (requires Android SDK)
eas build --platform android --profile preview --local

# View build status
eas build:list

# Download build
eas build:download [build-id]
```

---

## 📊 After Build Completes

1. **Get APK:**
   - EAS dashboard → Builds → Download APK
   - Or use: `eas build:download [build-id]`

2. **Share with Beta Testers:**
   - Upload APK to Google Drive/Dropbox
   - Share download link
   - Or use Firebase App Distribution
   - Or use Google Play Internal Testing

3. **Test Installation:**
   - Install APK on Android device
   - Enable "Install from unknown sources" if needed
   - Test app functionality

---

## 🔍 Debugging Build Issues

### View Build Logs

```bash
# List recent builds
eas build:list

# View specific build logs
eas build:view [build-id]
```

### Check Build Status

Go to: https://expo.dev/accounts/[your-account]/projects/[your-project]/builds

---

## 💡 Tips

1. **Use cloud builds** - Much easier than local setup
2. **Preview profile** - Perfect for beta testing (APK format)
3. **Production profile** - For Play Store (can use APK or AAB)
4. **Auto-increment** - Version codes increment automatically
5. **Check logs** - Always check build logs for specific errors

---

## 🆘 Still Having Issues?

**Share the exact error message** and I can help troubleshoot!

Common things to check:
- Full error message from terminal
- Build logs from EAS dashboard
- `app.json` configuration
- `eas.json` configuration
- Environment variables

---

**Ready to build?** Run:
```bash
eas build --platform android --profile preview
```

