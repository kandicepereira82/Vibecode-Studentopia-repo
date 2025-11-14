# EAS Build Fixes

## Issues Fixed

### 1. EAS Update Channel Configuration
**Error:**
```
This build has an invalid EAS Update configuration: update.url is set to "https://u.expo.dev/..." 
in app config, but a channel is not specified for the current build profile "null" in eas.json.
```

**Fix:**
Added `channel` configuration to both `preview` and `production` build profiles in `eas.json`:

```json
{
  "build": {
    "preview": {
      "channel": "preview",
      ...
    },
    "production": {
      "channel": "production",
      ...
    }
  }
}
```

### 2. Kotlin Version Mismatch
**Error:**
```
ksp-2.0.21-1.0.28 is too old for kotlin-2.1.20. 
Please upgrade ksp or downgrade kotlin-gradle-plugin to 2.0.21.
```

**Fix:**
Upgraded Kotlin version from `2.0.21` to `2.1.20` in `app.json` to match dependency requirements:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "kotlinVersion": "2.1.20"
          }
        }
      ]
    ]
  }
}
```

## Files Modified

1. **`eas.json`**
   - Added `"channel": "preview"` to preview profile
   - Added `"channel": "production"` to production profile

2. **`app.json`**
   - Updated `kotlinVersion` from `"2.0.21"` to `"2.1.20"`

## Build Status

The build is currently running with these fixes applied. The EAS Update channel warning should be resolved, and the Kotlin/KSP version mismatch should be fixed.

## Next Steps

1. Monitor the build progress:
   ```bash
   EXPO_TOKEN=YOUR_TOKEN npx eas-cli build:list --platform android --limit 1
   ```

2. If the build succeeds, download the APK:
   ```bash
   EXPO_TOKEN=YOUR_TOKEN npx eas-cli build:download --latest --platform android
   ```

3. If issues persist, check the build logs for any remaining errors.

## Notes

- EAS Update channels are now properly configured for both preview and production builds
- Kotlin 2.1.20 is compatible with KSP versions 2.1.20-1.0.28 and higher
- Expo's build system should automatically select the correct KSP version based on Kotlin version

