# Connection Error Investigation Report

## Summary
Investigated connection errors in the Studentopia app. Found several areas where connection errors may occur and need better handling.

## Connection Error Sources

### 1. API Requests (`src/api/backend.ts`)
**Current Implementation:**
- Uses `fetch()` for all API requests
- Basic error handling with try-catch
- Errors logged but not specifically categorized

**Potential Issues:**
- No timeout handling
- No retry logic for network failures
- Generic error messages don't distinguish connection errors
- No offline detection before making requests

**Recommendations:**
1. Add timeout to fetch requests (default 10-15 seconds)
2. Implement retry logic for network errors
3. Check connectivity before making requests
4. Provide user-friendly error messages

### 2. WebSocket Connections (`src/services/realtimeService.ts`)
**Current Implementation:**
- Has reconnection logic (max 5 attempts)
- Exponential backoff delay
- Error handling for connection failures

**Potential Issues:**
- No timeout for initial connection
- Reconnection attempts may be too aggressive
- No user notification of connection status

**Recommendations:**
1. Add connection timeout
2. Show connection status to user
3. Limit reconnection attempts in offline mode

### 3. Connectivity Service (`src/services/connectivityService.ts`)
**Current Implementation:**
- Uses `@react-native-community/netinfo`
- Monitors connection state
- Saves state to AsyncStorage

**Status:** ✅ Well implemented

### 4. Error Handling (`src/utils/errorUtils.ts`)
**Current Implementation:**
- Parses network errors
- Provides user-friendly messages
- Categorizes error types

**Status:** ✅ Good error parsing

## Common Connection Errors

### Network Timeout
- **Error:** Request takes too long
- **Solution:** Add timeout to fetch requests

### Connection Refused
- **Error:** Server not reachable
- **Solution:** Check server URL and connectivity

### DNS Resolution Failed
- **Error:** Cannot resolve hostname
- **Solution:** Verify API URL configuration

### SSL/TLS Errors
- **Error:** Certificate validation failed
- **Solution:** Check API endpoint security

## Recommended Fixes

### 1. Enhanced API Request Handler
```typescript
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  timeout: number = 15000
): Promise<T> {
  // Check connectivity first
  const isOnline = connectivityService.isOnline();
  if (!isOnline) {
    throw new Error("No internet connection");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error("Request timeout - please check your connection");
    }
    
    if (error.message?.includes('network') || error.message?.includes('fetch')) {
      throw new Error("Network error - please check your internet connection");
    }
    
    console.error(`API Request failed: ${endpoint}`, error);
    throw error;
  }
}
```

### 2. Retry Logic for Network Errors
```typescript
async function apiRequestWithRetry<T>(
  endpoint: string,
  options: RequestInit = {},
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiRequest<T>(endpoint, options);
    } catch (error: any) {
      lastError = error;
      
      // Only retry on network errors
      if (error.message?.includes('network') || 
          error.message?.includes('timeout') ||
          error.message?.includes('connection')) {
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        }
      }
      
      throw error;
    }
  }
  
  throw lastError!;
}
```

### 3. Connection Status Indicator
- Show connection status in UI
- Disable actions when offline
- Queue actions for when connection returns

## Testing Recommendations

1. **Test offline scenarios:**
   - Airplane mode
   - No WiFi/cellular
   - Slow connection

2. **Test API failures:**
   - Invalid API URL
   - Server down
   - Timeout scenarios

3. **Test WebSocket:**
   - Connection drops
   - Reconnection behavior
   - Multiple reconnection attempts

## Files to Update

1. `src/api/backend.ts` - Add timeout and retry logic
2. `src/services/realtimeService.ts` - Add connection timeout
3. `src/components/OfflineIndicator.tsx` - Enhance connection status display
4. `src/utils/errorUtils.ts` - Add more specific connection error types

## Next Steps

1. Implement timeout handling in API requests
2. Add retry logic for network errors
3. Improve error messages for connection issues
4. Add connection status UI indicator
5. Test all connection error scenarios

