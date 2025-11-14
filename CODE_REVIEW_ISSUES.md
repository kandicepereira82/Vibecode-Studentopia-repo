# Code Review: Critical Issues and Improvements

## 🔴 CRITICAL ISSUES

### 1. **backend.ts - Line 45: Race Condition with Async Token**
**Location:** `src/api/backend.ts:45`
**Issue:** `getAuthToken()` is async but not awaited before use
```typescript
const token = await getAuthToken(); // ✅ This is correct
```
**Status:** Actually correct - token is awaited. No issue here.

### 2. **backend.ts - Line 71: JSON Parse Error Handling**
**Location:** `src/api/backend.ts:71`
**Issue:** `response.json()` can throw if response is not valid JSON (e.g., HTML error pages)
**Current Code:**
```typescript
return await response.json();
```
**Fix:**
```typescript
try {
  return await response.json();
} catch (jsonError) {
  // If JSON parsing fails, try to get text for debugging
  const text = await response.text().catch(() => '');
  throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
}
```

### 3. **backend.ts - Line 67: Error Response Handling**
**Location:** `src/api/backend.ts:67`
**Issue:** Error response might not be JSON, causing silent failures
**Current Code:**
```typescript
const error = await response.json().catch(() => ({}));
```
**Fix:**
```typescript
let error: any = {};
try {
  const text = await response.text();
  error = text ? JSON.parse(text) : {};
} catch {
  error = { message: `HTTP ${response.status}: ${response.statusText}` };
}
```

### 4. **realtimeService.ts - Line 87: Type Safety Issue**
**Location:** `src/services/realtimeService.ts:87`
**Issue:** Emitting "connected" event that's not in RealtimeEvent type
**Current Code:**
```typescript
this.emit("connected" as RealtimeEvent, { userId });
```
**Fix:** Add "connected" to RealtimeEvent type:
```typescript
export type RealtimeEvent =
  | "connected"  // Add this
  | "friend_request"
  | ...
```

### 5. **realtimeService.ts - Line 204: Memory Leak Risk**
**Location:** `src/services/realtimeService.ts:204`
**Issue:** setTimeout not cleared if service is destroyed during delay
**Current Code:**
```typescript
setTimeout(() => {
  if (this.userId) {
    this.connect(this.userId);
  }
}, delay);
```
**Fix:** Store timeout ID and clear on disconnect:
```typescript
private reconnectTimeoutId: NodeJS.Timeout | null = null;

private attemptReconnect(): void {
  // ... existing code ...
  
  this.reconnectTimeoutId = setTimeout(() => {
    this.reconnectTimeoutId = null;
    if (this.userId) {
      this.connect(this.userId);
    }
  }, delay);
}

disconnect(): void {
  if (this.reconnectTimeoutId) {
    clearTimeout(this.reconnectTimeoutId);
    this.reconnectTimeoutId = null;
  }
  // ... rest of disconnect code ...
}
```

### 6. **connectivityService.ts - Line 39: Unhandled Promise**
**Location:** `src/services/connectivityService.ts:39`
**Issue:** NetInfo.fetch() promise not handled, could cause unhandled rejection
**Current Code:**
```typescript
NetInfo.fetch().then((state) => {
  this.handleConnectivityChange(state);
});
```
**Fix:** Add error handling:
```typescript
NetInfo.fetch()
  .then((state) => {
    this.handleConnectivityChange(state);
  })
  .catch((error) => {
    console.error("Error fetching initial connectivity state:", error);
  });
```

### 7. **syncService.ts - Line 24: Memory Leak**
**Location:** `src/services/syncService.ts:24`
**Issue:** Subscription to connectivityService never cleaned up
**Current Code:**
```typescript
initialize(): void {
  connectivityService.subscribe((state) => {
    if (state.isConnected && state.isInternetReachable && !this.isSyncing) {
      this.processSyncQueue();
    }
  });
  // ...
}
```
**Fix:** Store unsubscribe function and provide cleanup:
```typescript
private connectivityUnsubscribe: (() => void) | null = null;

initialize(): void {
  this.connectivityUnsubscribe = connectivityService.subscribe((state) => {
    if (state.isConnected && state.isInternetReachable && !this.isSyncing) {
      this.processSyncQueue();
    }
  });
  // ...
}

cleanup(): void {
  if (this.connectivityUnsubscribe) {
    this.connectivityUnsubscribe();
    this.connectivityUnsubscribe = null;
  }
}
```

### 8. **App.tsx - Line 82: setTimeout Without Cleanup**
**Location:** `App.tsx:82`
**Issue:** setTimeout not cleared if component unmounts during delay
**Current Code:**
```typescript
await new Promise(resolve => setTimeout(resolve, 200));
```
**Fix:** Use cleanup pattern:
```typescript
let timeoutId: NodeJS.Timeout;
await new Promise<void>((resolve) => {
  timeoutId = setTimeout(resolve, 200);
});
// Note: This is in async function, cleanup handled by component unmount
// But better to use AbortController pattern for cancellable delays
```

### 9. **google-translate.ts - Line 92: Wrong Environment Variable**
**Location:** `src/api/google-translate.ts:92`
**Issue:** Checking wrong env var name (missing EXPO_PUBLIC_ prefix)
**Current Code:**
```typescript
const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY || process.env.EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY;
```
**Status:** Actually correct - checks both. But should prioritize EXPO_PUBLIC_ version:
**Fix:**
```typescript
const apiKey = process.env.EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY || process.env.GOOGLE_TRANSLATE_API_KEY;
```

### 10. **chat-service.ts - Line 85: Potential Undefined Return**
**Location:** `src/api/chat-service.ts:85`
**Issue:** Optional chaining could return undefined, but return type is string
**Current Code:**
```typescript
content: response.choices[0]?.message?.content || "",
```
**Status:** Actually safe with `|| ""` fallback. No issue.

## ⚠️ MEDIUM PRIORITY ISSUES

### 11. **backend.ts - Headers Override Issue**
**Location:** `src/api/backend.ts:47-51`
**Issue:** User-provided headers could override Content-Type or Authorization
**Current Code:**
```typescript
const headers: HeadersInit = {
  "Content-Type": "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
  ...options.headers,  // ⚠️ This could override Content-Type or Authorization
};
```
**Fix:** Ensure critical headers aren't overridden:
```typescript
const headers: HeadersInit = {
  ...options.headers,
  "Content-Type": "application/json",  // Always set
  ...(token ? { Authorization: `Bearer ${token}` } : {}),  // Always set if token exists
};
```

### 12. **realtimeService.ts - WebSocket URL Injection Risk**
**Location:** `src/services/realtimeService.ts:75`
**Issue:** Token in URL query string could be logged
**Current Code:**
```typescript
const url = `${WS_URL}?userId=${userId}&token=${token}`;
```
**Fix:** Use headers instead (if WebSocket supports it) or ensure token is not logged:
```typescript
// Note: WebSocket doesn't support custom headers in browser
// Consider using wss:// with token in initial message instead
const url = `${WS_URL}?userId=${userId}`;
// Send token in first message after connection
```

### 13. **errorUtils.ts - Case Sensitivity Issue**
**Location:** `src/utils/errorUtils.ts:30`
**Issue:** Converting to lowercase might miss some error patterns
**Current Code:**
```typescript
const message = error.message.toLowerCase();
```
**Status:** Generally fine, but could miss mixed-case errors. Consider case-insensitive regex.

### 14. **syncService.ts - Race Condition in processSyncQueue**
**Location:** `src/services/syncService.ts:59-98`
**Issue:** Multiple calls to processSyncQueue could cause race conditions
**Current Code:**
```typescript
async processSyncQueue(): Promise<void> {
  if (this.isSyncing || this.syncQueue.length === 0) {
    return;
  }
  this.isSyncing = true;
  // ...
}
```
**Fix:** Use a lock/promise to prevent concurrent execution:
```typescript
private syncPromise: Promise<void> | null = null;

async processSyncQueue(): Promise<void> {
  if (this.syncPromise) {
    return this.syncPromise; // Return existing promise
  }
  
  if (this.syncQueue.length === 0) {
    return;
  }
  
  this.syncPromise = this._processSyncQueue();
  try {
    await this.syncPromise;
  } finally {
    this.syncPromise = null;
  }
}
```

## 💡 IMPROVEMENTS & BEST PRACTICES

### 15. **backend.ts - Add Request Retry Logic**
**Location:** `src/api/backend.ts:40-102`
**Suggestion:** Add retry logic for transient network errors
```typescript
async function apiRequestWithRetry<T>(
  endpoint: string,
  options: RequestInit = {},
  maxRetries: number = 3
): Promise<T> {
  // Implementation with exponential backoff
}
```

### 16. **realtimeService.ts - Add Connection Timeout**
**Location:** `src/services/realtimeService.ts:59-116`
**Suggestion:** Add timeout for WebSocket connection attempts
```typescript
private connectionTimeout: NodeJS.Timeout | null = null;

async connect(userId: string): Promise<void> {
  // ... existing code ...
  
  this.connectionTimeout = setTimeout(() => {
    if (this.ws?.readyState === WebSocket.CONNECTING) {
      this.ws.close();
      this.isConnecting = false;
      this.attemptReconnect();
    }
  }, 10000); // 10 second timeout
}
```

### 17. **connectivityService.ts - Add Error Boundary**
**Location:** `src/services/connectivityService.ts:34-36`
**Suggestion:** Wrap NetInfo.addEventListener in try-catch
```typescript
try {
  this.unsubscribe = NetInfo.addEventListener((state) => {
    this.handleConnectivityChange(state);
  });
} catch (error) {
  console.error("Failed to initialize connectivity monitoring:", error);
}
```

### 18. **Type Safety Improvements**
**Location:** Multiple files
**Suggestion:** Add stricter types for API responses
```typescript
// Instead of Promise<any[]>
Promise<{ id: string; name: string; ... }[]>
```

## 📋 SUMMARY

### Critical Issues Found: 7
1. JSON parse error handling (backend.ts:71)
2. Error response handling (backend.ts:67)
3. Type safety - missing "connected" event (realtimeService.ts:87)
4. Memory leak - setTimeout not cleared (realtimeService.ts:204)
5. Unhandled promise (connectivityService.ts:39)
6. Memory leak - subscription not cleaned up (syncService.ts:24)
7. Headers override risk (backend.ts:47-51)

### Medium Priority: 4
8. WebSocket token in URL (realtimeService.ts:75)
9. Race condition in sync queue (syncService.ts:59)
10. Case sensitivity in error parsing (errorUtils.ts:30)
11. Missing connection timeout (realtimeService.ts:59)

### Recommendations: 4
12. Add retry logic for API requests
13. Add connection timeout for WebSocket
14. Add error boundaries
15. Improve type safety

## 🔧 PRIORITY FIXES

**Immediate (Before Production):**
1. Fix JSON parse error handling
2. Fix memory leaks (setTimeout, subscriptions)
3. Add error handling for NetInfo.fetch()
4. Fix headers override issue

**High Priority:**
5. Add "connected" to RealtimeEvent type
6. Add connection timeout for WebSocket
7. Fix race condition in sync queue

**Nice to Have:**
8. Add retry logic
9. Improve type safety
10. Add error boundaries

