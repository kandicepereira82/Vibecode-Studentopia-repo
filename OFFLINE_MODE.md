# Studentopia Offline Mode - Implementation Guide

## Overview

Studentopia now includes comprehensive offline functionality with automatic data caching and syncing. Users can continue using the app even without an internet connection, with seamless synchronization once reconnected.

## Offline Capabilities

### ✅ Fully Offline Features

These features work completely offline without any internet connection:

1. **Task Management**
   - View all existing tasks
   - Create new tasks (queued for sync)
   - Edit existing tasks
   - Mark tasks as complete/pending
   - Delete tasks
   - Filter tasks by category

2. **Study Timer**
   - Full timer functionality (1-120 minutes)
   - Study and Break modes
   - Pause, resume, and stop controls
   - Progress tracking

3. **Mindfulness Features**
   - Breathwork exercises with timer
   - Tips and quotes
   - Acupressure guide
   - Session tracking

4. **Companion Features**
   - View Studentopia Companion
   - View saved motivational quotes
   - Access study tips and guidance
   - Daily reminder messages (cached)

5. **Settings & Preferences**
   - Update notification preferences
   - Change theme and language
   - Manage companion settings
   - View app settings

6. **Saved Data**
   - View user profile
   - Access saved tasks
   - View completion statistics
   - View study sessions

### 🌐 Online-Required Features

These features require internet connectivity:

1. **AI Features**
   - AI Chat and Grammar Helper
   - Audio transcription
   - Image generation
   - Text responses from AI models

2. **Calendar Sync**
   - Syncing with Google Calendar
   - Syncing with Apple Calendar
   - Exporting tasks to calendar

3. **Music Player**
   - Streaming music from external sources
   - (Local music can be played offline)

4. **Backend Synchronization**
   - Cloud backup of user data
   - Multi-device sync
   - Server-side storage

## Technical Architecture

### Components

#### 1. **Connectivity Service** (`connectivityService.ts`)
- Monitors device network status in real-time
- Uses `@react-native-community/netinfo` for network detection
- Maintains connection state with timestamp
- Persists last known state to AsyncStorage

**Key Methods:**
```typescript
- initialize(): Start monitoring connectivity
- getState(): Get current connection state
- isOnline(): Check if connected with internet reachability
- hasInternetReachability(): Check internet availability
- subscribe(listener): Subscribe to connectivity changes
```

#### 2. **Sync Service** (`syncService.ts`)
- Manages offline data queue
- Queues actions when offline
- Automatically syncs when connectivity restored
- Handles retry logic with max retry count

**Key Methods:**
```typescript
- queueAction(action): Add action to offline queue
- processSyncQueue(): Process all queued actions
- getPendingActionCount(): Get number of pending syncs
- getPendingActions(): Get all pending actions
- clearQueue(): Clear sync queue
```

#### 3. **Connectivity Store** (`connectivityStore.ts`)
- Zustand store for connectivity state
- Manages UI state for offline indicator
- Tracks sync status and pending actions
- Provides real-time connectivity updates

**Store State:**
```typescript
- isOnline: boolean
- isInternetReachable: boolean
- connectionType: string ("wifi", "cellular", "unknown")
- isSyncing: boolean
- pendingActions: number
- offlineMessage: string
```

#### 4. **Offline Indicator** (`OfflineIndicator.tsx`)
- Visual indicator of connection status
- Shows when device is offline
- Displays syncing status
- Shows pending change count

**States:**
- ✅ Online with no pending changes: Hidden
- 🔄 Online and syncing: Shows "Syncing changes..."
- ✅ Changes synced: Shows "N changes synced"
- ❌ Offline mode: Shows "Offline Mode • Changes will sync when online"

### Data Persistence

All user data is persisted locally using AsyncStorage:

```
@studentopia/tasks                  - Task list
@studentopia/user-storage          - User profile and settings
@studentopia/stats-storage         - Statistics
@studentopia/timer-storage         - Timer state
@studentopia/connectivity_state    - Last known connection state
@studentopia/sync_queue            - Offline action queue
```

### Auto-Sync Process

1. **When User Goes Offline:**
   - Connectivity service detects loss
   - New actions are queued instead of failed
   - UI shows offline indicator

2. **When User Goes Online:**
   - Connectivity service detects connection
   - Sync service automatically processes queue
   - UI shows "Syncing changes..." indicator
   - Once complete, shows "N changes synced"

3. **Sync Retry Logic:**
   - Failed actions are retried (max 3 retries by default)
   - Exponential backoff prevents server overload
   - Failed actions after max retries are logged

## User Experience

### Offline Indicator

The offline indicator appears at the top of the Home screen in different states:

```
OFFLINE MODE:
┌─────────────────────────────────────────┐
│ 📡 Offline Mode • Changes will sync     │
│    when online                          │
└─────────────────────────────────────────┘

SYNCING:
┌─────────────────────────────────────────┐
│ 🔄 Syncing changes...                   │
└─────────────────────────────────────────┘

SYNCED:
┌─────────────────────────────────────────┐
│ ✅ 2 changes synced                     │
└─────────────────────────────────────────┘
```

### User Workflow Example

1. **User is Online:**
   - Creates a task
   - Immediately saved locally
   - If internet available, synced to server
   - Indicator remains hidden

2. **User Goes Offline:**
   - Creates another task
   - Saved locally
   - Action queued for sync
   - Offline indicator appears

3. **User Goes Online:**
   - Connectivity restored
   - Offline indicator changes to "Syncing..."
   - Queued actions processed
   - Indicator changes to "2 changes synced"
   - Indicator disappears after 3 seconds

## Implementation Details

### Initialization

Services are initialized in `App.tsx`:

```typescript
useEffect(() => {
  // Initialize connectivity monitoring
  connectivityService.initialize();
  useConnectivityStore.getState().initialize();

  // Initialize sync service
  syncService.initialize();
}, [fontsLoaded]);
```

### Using in Components

```typescript
// Check connectivity in components
const isOnline = useConnectivityStore((s) => s.isOnline);
const isSyncing = useConnectivityStore((s) => s.isSyncing);
const pendingActions = useConnectivityStore((s) => s.pendingActions);

// Show different UI based on connectivity
if (!isOnline) {
  // Show offline mode UI
}
```

### Queueing Actions

When user creates/edits data:

```typescript
// If offline, action is queued
if (!connectivityService.isOnline()) {
  await syncService.queueAction({
    type: "create",
    entity: "task",
    data: newTask,
    maxRetries: 3,
  });
}
```

## Security Considerations

1. **Local Data Encryption:**
   - Consider encrypting sensitive data in AsyncStorage
   - Use expo-secure-store for credentials

2. **Queue Integrity:**
   - Sync queue is stored locally (not encrypted by default)
   - Consider encryption for sensitive operations

3. **Conflict Resolution:**
   - In future, implement conflict detection
   - Last-write-wins strategy (current)
   - Or server-side merge logic

## Future Enhancements

1. **Advanced Conflict Resolution:**
   - Detect conflicts when syncing
   - Ask user to resolve (keep local, keep server, merge)

2. **Selective Sync:**
   - Allow users to choose what to sync
   - Priority-based sync queue

3. **Background Sync:**
   - Use background task API
   - Sync when connectivity restored (even if app closed)

4. **Data Encryption:**
   - Encrypt queued actions
   - Encrypt AsyncStorage data

5. **Sync Analytics:**
   - Track sync success/failure rates
   - Monitor queue sizes
   - Performance metrics

## Testing Offline Functionality

### Manual Testing

1. **Simulate Offline:**
   - Use Device Settings to disable WiFi/Mobile Data
   - Or use Network Link Conditioner (iOS)

2. **Test Scenarios:**
   - Create/edit/delete tasks while offline
   - Toggle connection multiple times
   - Check data persists after restart

3. **Verify Syncing:**
   - Enable connectivity
   - Observe sync indicator
   - Verify all changes saved

### Automated Testing

```typescript
// Test connectivity detection
it("should detect offline mode", async () => {
  connectivityService.initialize();
  // Simulate network loss
  // Assert isOnline becomes false
});

// Test action queueing
it("should queue actions when offline", async () => {
  // Go offline
  // Queue action
  // Assert action in queue
});

// Test auto-sync
it("should sync when reconnected", async () => {
  // Queue action while offline
  // Go online
  // Assert action is synced
});
```

## Database Structure (Future)

For server-side sync in production:

```json
{
  "tasks": [
    {
      "id": "task-id",
      "userId": "user-id",
      "title": "Study for exam",
      "completed": false,
      "lastModified": "2024-11-06T10:00:00Z",
      "synced": true
    }
  ],
  "syncLog": [
    {
      "action": "create",
      "entity": "task",
      "timestamp": "2024-11-06T10:00:00Z",
      "status": "synced"
    }
  ]
}
```

## Troubleshooting

### Issue: Changes not syncing
- **Check:** Is device connected to internet?
- **Check:** Is sync service initialized?
- **Fix:** Restart app and verify connectivity

### Issue: Offline indicator always showing
- **Check:** Network permissions in device settings
- **Check:** Connectivity service is initialized
- **Fix:** Restart app and verify network status

### Issue: Duplicate data after sync
- **Check:** Conflict resolution logic
- **Fix:** Clear sync queue: `syncService.clearQueue()`

## References

- NetInfo: https://github.com/react-native-netinfo/react-native-netinfo
- AsyncStorage: https://react-native-async-storage.github.io/
- Zustand: https://github.com/pmndrs/zustand
- Expo Network: https://docs.expo.dev/versions/latest/sdk/network/
