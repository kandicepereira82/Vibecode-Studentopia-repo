# EAS Android Build Error Investigation & Fixes

## Issues Identified

### 1. Missing `expo-build-properties` Configuration ⚠️ **FIXED**
**Problem:** The `expo-build-properties` plugin was listed in `app.json` but had no configuration. This plugin requires explicit Android build properties to function correctly.

**Impact:** Without proper configuration, EAS builds may fail with:
- Unspecified SDK version errors
- Gradle build failures
- Kotlin version mismatches
- Missing build tools version

**Fix Applied:**
- Added comprehensive Android build properties configuration:
  - `compileSdkVersion`: 35 (latest stable)
  - `targetSdkVersion`: 35 (matches compile SDK)
  - `minSdkVersion`: 24 (Android 7.0+, supports 95%+ devices)
  - `buildToolsVersion`: "35.0.0"
  - `kotlinVersion`: "2.0.21" (compatible with React Native 0.79)
  - Enabled ProGuard and resource shrinking for release builds

### 2. Conflicting `gradleCommand` in `eas.json` ⚠️ **FIXED**
**Problem:** The `preview` profile had a custom `gradleCommand: ":app:assembleRelease"` which could conflict with EAS's automatic build process.

**Impact:** 
- May cause build failures if EAS expects different build commands
- Can interfere with APK/AAB generation
- May skip important build steps

**Fix Applied:**
- Removed the custom `gradleCommand` from the preview profile
- Let EAS handle the build command automatically based on `buildType: "apk"`

### 3. New Architecture Enabled
**Status:** `newArchEnabled: true` is set in `app.json`

**Note:** The new architecture is enabled, which is good for performance. The build properties configuration now properly supports it with:
- Compatible Kotlin version (2.0.21)
- Proper SDK versions
- Build tools that support the new architecture

## Configuration Changes Made

### `app.json`
```json
"plugins": [
  "expo-asset",
  [
    "expo-build-properties",
    {
      "android": {
        "compileSdkVersion": 35,
        "targetSdkVersion": 35,
        "minSdkVersion": 24,
        "buildToolsVersion": "35.0.0",
        "kotlinVersion": "2.0.21",
        "enableProguardInReleaseBuilds": true,
        "enableShrinkResourcesInReleaseBuilds": true
      }
    }
  ],
  // ... other plugins
]
```

### `eas.json`
```json
"preview": {
  "distribution": "internal",
  "android": {
    "buildType": "apk"
  },
  "autoIncrement": true
}
```

## Next Steps

1. **Test the Build:**
   ```bash
   # Install EAS CLI if not already installed
   npm install -g eas-cli
   
   # Login to Expo
   eas login
   
   # Test preview build
   eas build --platform android --profile preview
   
   # Or test production build
   eas build --platform android --profile production
   ```

2. **Monitor Build Logs:**
   - Check the EAS dashboard for detailed build logs
   - Look for any Gradle errors or dependency issues
   - Verify that the build completes successfully

3. **If Build Still Fails:**
   - Check the specific error message in EAS dashboard
   - Verify all dependencies are compatible with React Native 0.79.6
   - Ensure all native modules support the new architecture
   - Check for any missing Android permissions or configurations

## Common Additional Issues to Watch For

### Dependency Compatibility
- Some packages may not support React Native 0.79 or the new architecture
- Check package compatibility before adding new dependencies

### Native Module Issues
- Packages with native Android code may need updates
- Check for patches in the `patches/` directory

### Asset Issues
- Ensure all referenced assets exist
- Check adaptive icon configuration if using one

### Environment Variables
- Verify all required environment variables are set in EAS
- Use `eas secret:create` to add secrets

## Verification Checklist

- [x] `expo-build-properties` plugin configured
- [x] Android SDK versions specified
- [x] Kotlin version specified
- [x] Removed conflicting `gradleCommand`
- [x] Build properties support new architecture
- [ ] Test preview build
- [ ] Test production build
- [ ] Verify APK generation
- [ ] Check build logs for any warnings

## Additional Resources

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [expo-build-properties Plugin](https://docs.expo.dev/versions/latest/sdk/build-properties/)
- [React Native 0.79 Release Notes](https://github.com/facebook/react-native/releases)
- [EAS Build Troubleshooting](https://docs.expo.dev/build/troubleshooting/)

