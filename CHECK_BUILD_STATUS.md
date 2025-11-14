# Check EAS Build Status

## Quick Status Check

Run this command to check the current build status:

```bash
EXPO_TOKEN=DxE2wKMYsPX_VYxvykAUh8IfkjuLYWjb8cESYGTN npx eas-cli build:list --platform android --limit 1
```

## Current Build

- **Build ID**: `b99eeb87-3648-41f3-97df-53675960784f`
- **Status**: In Progress
- **Started**: 11/14/2025, 2:56:55 AM
- **Logs**: https://expo.dev/accounts/kandicepereira/projects/vibecode/builds/b99eeb87-3648-41f3-97df-53675960784f

## Build Stages

EAS builds typically go through these stages:
1. **Queued** - Build waiting to start
2. **In Progress** - Currently building (this stage)
   - Installing dependencies
   - Running Gradle build
   - Compiling Kotlin/Java code
   - Generating APK
   - Signing APK
3. **Finished** - Build completed successfully
4. **Errored** - Build failed (check logs)

## Estimated Time

- **Typical duration**: 15-30 minutes
- **Complex projects**: 30-45 minutes
- **Simple projects**: 10-15 minutes

## Download APK (After Build Completes)

Once the build status shows "finished", download the APK:

```bash
EXPO_TOKEN=DxE2wKMYsPX_VYxvykAUh8IfkjuLYWjb8cESYGTN npx eas-cli build:download --id b99eeb87-3648-41f3-97df-53675960784f --platform android
```

Or download the latest preview build:

```bash
EXPO_TOKEN=DxE2wKMYsPX_VYxvykAUh8IfkjuLYWjb8cESYGTN npx eas-cli build:download --latest --platform android --profile preview
```

## Monitor Build Progress

You can watch the build logs in real-time by visiting the logs URL above, or check status periodically with the `build:list` command.

