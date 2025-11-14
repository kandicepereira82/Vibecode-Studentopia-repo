# Kotlin Version Fix

## Problem

Build failed with:
```
Can't find KSP version for Kotlin version '1.9.24'. 
Supported versions are: '2.2.20, 2.2.10, 2.2.0, 2.1.21, 2.1.20, 2.1.10, 2.1.0, 2.0.21, 2.0.20, 2.0.10, 2.0.0'
```

**Root Cause:** Kotlin 1.9.24 is not supported by KSP (Kotlin Symbol Processing) which is required by Expo SDK 54.

## Solution

Changed Kotlin version to `2.0.21` which is:
- ✅ Supported by KSP
- ✅ Compatible with Expo SDK 54
- ✅ Compatible with React Native 0.81.5
- ✅ Stable and well-tested

## Updated Configuration

**File:** `app.json`
```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "kotlinVersion": "2.0.21"
          }
        }
      ]
    ]
  }
}
```

## Next Steps

1. **Rebuild:**
   ```bash
   EXPO_TOKEN=YOUR_TOKEN npx eas-cli build --platform android --profile preview
   ```

2. **Expected Result:**
   - ✅ KSP version found
   - ✅ Build succeeds
   - ✅ APK generated

## Why 2.0.21?

- Latest stable in 2.0.x series
- Fully supported by KSP
- Compatible with all dependencies
- Should work without expo-network-addons conflicts (since it's excluded)

