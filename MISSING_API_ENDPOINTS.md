# Missing API Endpoints for Recent Updates

**Date:** January 2025  
**Status:** Analysis Complete

---

## Executive Summary

Based on recent security fixes, content moderation, and feature implementations, the following backend API endpoints are **missing** or **need enhancement**:

---

## 🔴 CRITICAL: Authentication & Security APIs

### 1. **User Authentication APIs**

#### Missing Endpoints:

```typescript
// User Registration
POST /api/auth/register
Body: {
  email: string;
  password: string; // Will be hashed server-side
  username: string; // Must pass content moderation
}
Response: {
  success: boolean;
  userId: string;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

// User Login
POST /api/auth/login
Body: {
  email: string;
  password: string;
  mfaCode?: string; // If MFA enabled
}
Response: {
  success: boolean;
  userId: string;
  username: string;
  token: string;
  refreshToken: string;
  expiresIn: number;
  requiresMFA?: boolean;
  sessionId: string;
}

// Password Reset Request
POST /api/auth/password-reset/request
Body: {
  email: string;
}
Response: {
  success: boolean;
  message: string; // Generic message to prevent email enumeration
}

// Password Reset Confirm
POST /api/auth/password-reset/confirm
Body: {
  token: string;
  newPassword: string; // Must pass strength validation + content moderation
}
Response: {
  success: boolean;
}

// Token Refresh
POST /api/auth/refresh
Body: {
  refreshToken: string;
}
Response: {
  token: string;
  refreshToken: string;
  expiresIn: number;
}

// Logout
POST /api/auth/logout
Headers: { Authorization: Bearer <token> }
Response: {
  success: boolean;
}

// Logout All Sessions
POST /api/auth/logout-all
Headers: { Authorization: Bearer <token> }
Response: {
  success: boolean;
  sessionsRevoked: number;
}
```

**Why Needed:**
- Currently using local-only authentication (`authService.ts`)
- No server-side password hashing validation
- No MFA backend support
- No session management on server
- No token refresh mechanism

---

### 2. **MFA (Multi-Factor Authentication) APIs**

#### Missing Endpoints:

```typescript
// Enable MFA
POST /api/auth/mfa/enable
Headers: { Authorization: Bearer <token> }
Body: {
  userId: string;
}
Response: {
  secret: string; // Base32 encoded secret
  qrCodeData: string; // otpauth:// URL
  backupCodes: string[]; // One-time backup codes
}

// Verify MFA Setup
POST /api/auth/mfa/verify-setup
Headers: { Authorization: Bearer <token> }
Body: {
  userId: string;
  code: string; // TOTP code from authenticator app
}
Response: {
  success: boolean;
  enabled: boolean;
}

// Disable MFA
POST /api/auth/mfa/disable
Headers: { Authorization: Bearer <token> }
Body: {
  userId: string;
  password: string; // Require password confirmation
}
Response: {
  success: boolean;
}

// Verify MFA Code (during login)
POST /api/auth/mfa/verify
Body: {
  userId: string;
  code: string;
}
Response: {
  success: boolean;
  isBackupCode: boolean; // If backup code was used
}
```

**Why Needed:**
- MFA service (`mfaService.ts`) is client-side only
- No server-side TOTP verification
- No backup code management on server
- Security risk: MFA can be bypassed if only client-side

---

### 3. **Session Management APIs**

#### Missing Endpoints:

```typescript
// Get User Sessions
GET /api/auth/sessions
Headers: { Authorization: Bearer <token> }
Response: {
  sessions: Array<{
    sessionId: string;
    deviceId: string;
    deviceName: string;
    platform: string;
    createdAt: number;
    lastActive: number;
    ipAddress?: string;
    isCurrent: boolean;
  }>;
}

// Revoke Session
DELETE /api/auth/sessions/:sessionId
Headers: { Authorization: Bearer <token> }
Response: {
  success: boolean;
}

// Revoke All Sessions
DELETE /api/auth/sessions
Headers: { Authorization: Bearer <token> }
Response: {
  success: boolean;
  sessionsRevoked: number;
}
```

**Why Needed:**
- Session service (`sessionService.ts`) is client-side only
- No server-side session tracking
- Cannot detect suspicious activity (multiple devices, locations)
- Cannot remotely revoke compromised sessions

---

## 🟡 HIGH PRIORITY: Content Moderation APIs

### 4. **Content Moderation APIs**

#### Missing Endpoints:

```typescript
// Validate Content (Server-Side)
POST /api/moderation/validate
Headers: { Authorization: Bearer <token> }
Body: {
  content: string;
  type: "message" | "username" | "task_title" | "task_description" | 
        "group_name" | "group_description" | "room_name" | "password";
}
Response: {
  isValid: boolean;
  error?: string;
  flaggedWords?: string[]; // Which words triggered the filter
  confidence?: number; // 0-1, how confident the filter is
}

// Report Inappropriate Content
POST /api/moderation/report
Headers: { Authorization: Bearer <token> }
Body: {
  contentId: string;
  contentType: "message" | "task" | "group" | "room";
  reason: string;
  reportedBy: string;
}
Response: {
  success: boolean;
  reportId: string;
}

// Get Moderation Analytics (Admin)
GET /api/moderation/analytics
Headers: { Authorization: Bearer <admin_token> }
Query: {
  startDate?: string;
  endDate?: string;
  type?: string;
}
Response: {
  totalBlocked: number;
  byType: Record<string, number>;
  topFlaggedWords: Array<{ word: string; count: number }>;
  falsePositiveRate?: number;
}
```

**Why Needed:**
- Client-side validation can be bypassed
- Need server-side validation for all user-generated content
- Need audit trail for moderation actions
- Need analytics to improve filter accuracy
- Need reporting mechanism for users

---

### 5. **Chat Message APIs with Moderation**

#### Missing/Enhanced Endpoints:

```typescript
// Send Chat Message (with server-side moderation)
POST /api/study-rooms/:roomId/messages
Headers: { Authorization: Bearer <token> }
Body: {
  userId: string;
  username: string;
  content: string; // Will be validated server-side
}
Response: {
  success: boolean;
  messageId: string;
  moderated: boolean; // If content was flagged but allowed
  error?: string; // If content was blocked
}

// Get Chat Messages (with moderation filtering)
GET /api/study-rooms/:roomId/messages
Headers: { Authorization: Bearer <token> }
Query: {
  limit?: number;
  offset?: number;
  includeModerated?: boolean; // Admin only
}
Response: {
  messages: Array<{
    id: string;
    userId: string;
    username: string;
    content: string;
    timestamp: string;
    moderated: boolean;
    flagged?: boolean;
  }>;
  total: number;
}
```

**Why Needed:**
- Current chat store (`chatStore.ts`) is client-side only
- No server-side message storage
- No server-side moderation
- Messages lost on app restart
- Cannot audit chat history

---

## 🟢 MEDIUM PRIORITY: Enhanced APIs

### 6. **Group APIs with Content Moderation**

#### Enhanced Endpoints Needed:

```typescript
// Create Group (with server-side name/description validation)
POST /api/groups
Headers: { Authorization: Bearer <token> }
Body: {
  name: string; // Must pass content moderation
  description?: string; // Must pass content moderation
  teacherId: string;
  school?: string;
  className?: string;
  teacherEmail?: string;
}
Response: {
  success: boolean;
  group: Group;
  moderationFlags?: string[]; // If any content was flagged
}

// Update Group (with server-side validation)
PUT /api/groups/:groupId
Headers: { Authorization: Bearer <token> }
Body: {
  name?: string; // Must pass content moderation
  description?: string; // Must pass content moderation
  // ... other fields
}
Response: {
  success: boolean;
  group: Group;
  moderationFlags?: string[];
}
```

**Why Needed:**
- Current group store is client-side only
- No server-side validation of group names/descriptions
- Groups not persisted on server
- Cannot sync groups across devices

---

### 7. **Study Room APIs with Content Moderation**

#### Enhanced Endpoints Needed:

```typescript
// Create Study Room (with server-side name validation)
POST /api/study-rooms
Headers: { Authorization: Bearer <token> }
Body: {
  name: string; // Must pass content moderation
  hostUserId: string;
  hostUsername: string;
  isPrivate: boolean;
  maxParticipants?: number;
}
Response: {
  success: boolean;
  room: StudyRoom;
  moderationFlags?: string[];
}

// Update Room Name (with validation)
PUT /api/study-rooms/:roomId/name
Headers: { Authorization: Bearer <token> }
Body: {
  name: string; // Must pass content moderation
}
Response: {
  success: boolean;
  room: StudyRoom;
}
```

**Why Needed:**
- Room names currently only validated client-side
- Rooms not persisted on server
- Cannot sync rooms across devices

---

### 8. **Task APIs with Content Moderation**

#### Missing Endpoints:

```typescript
// Create Task (with server-side title/description validation)
POST /api/tasks
Headers: { Authorization: Bearer <token> }
Body: {
  userId: string;
  title: string; // Must pass content moderation
  description?: string; // Must pass content moderation
  category: string;
  dueDate: string;
  reminder?: string;
}
Response: {
  success: boolean;
  task: Task;
  moderationFlags?: string[];
}

// Update Task (with validation)
PUT /api/tasks/:taskId
Headers: { Authorization: Bearer <token> }
Body: {
  title?: string; // Must pass content moderation
  description?: string; // Must pass content moderation
  // ... other fields
}
Response: {
  success: boolean;
  task: Task;
  moderationFlags?: string[];
}
```

**Why Needed:**
- Tasks currently only validated client-side
- Tasks not synced to server
- Cannot access tasks from other devices
- No backup/recovery mechanism

---

## 🔵 LOW PRIORITY: Analytics & Admin APIs

### 9. **Rate Limiting APIs**

#### Missing Endpoints:

```typescript
// Check Rate Limit Status
GET /api/rate-limit/status
Headers: { Authorization: Bearer <token> }
Query: {
  action: "message" | "login" | "password_reset";
}
Response: {
  remaining: number;
  resetAt: number; // Unix timestamp
  limit: number;
}
```

**Why Needed:**
- Current rate limiting (`authService.ts`, `chatStore.ts`) is client-side only
- Can be bypassed by clearing app data
- Need server-side rate limiting for security

---

### 10. **User Profile APIs**

#### Missing Endpoints:

```typescript
// Update Username (with content moderation)
PUT /api/users/:userId/username
Headers: { Authorization: Bearer <token> }
Body: {
  username: string; // Must pass content moderation
}
Response: {
  success: boolean;
  user: User;
}

// Update Profile
PUT /api/users/:userId/profile
Headers: { Authorization: Bearer <token> }
Body: {
  username?: string; // Must pass content moderation
  language?: string;
  themeColor?: string;
  // ... other fields
}
Response: {
  success: boolean;
  user: User;
}
```

**Why Needed:**
- Username changes not validated server-side
- Profile updates not synced to server
- Cannot access profile from other devices

---

## 📊 Summary Table

| Category | Missing APIs | Priority | Impact |
|----------|--------------|----------|--------|
| **Authentication** | Login, Register, Password Reset, Token Refresh | 🔴 CRITICAL | High - Security risk |
| **MFA** | Enable, Verify, Disable MFA | 🔴 CRITICAL | High - Security risk |
| **Sessions** | List, Revoke Sessions | 🔴 CRITICAL | High - Security risk |
| **Content Moderation** | Validate, Report, Analytics | 🟡 HIGH | Medium - Can bypass client-side |
| **Chat Messages** | Send/Get with moderation | 🟡 HIGH | Medium - No persistence |
| **Groups** | Create/Update with validation | 🟢 MEDIUM | Low - Works offline |
| **Study Rooms** | Create/Update with validation | 🟢 MEDIUM | Low - Works offline |
| **Tasks** | Create/Update with validation | 🟢 MEDIUM | Low - Works offline |
| **Rate Limiting** | Check status | 🔵 LOW | Low - Client-side works |
| **User Profile** | Update username/profile | 🔵 LOW | Low - Works offline |

---

## Implementation Priority

### Phase 1: Critical Security APIs (Week 1)
1. ✅ Authentication APIs (Login, Register, Password Reset)
2. ✅ Token Refresh API
3. ✅ Session Management APIs
4. ✅ MFA APIs

### Phase 2: Content Moderation APIs (Week 2)
5. ✅ Content Validation API
6. ✅ Chat Message APIs with moderation
7. ✅ Report Content API

### Phase 3: Enhanced APIs (Week 3-4)
8. ✅ Group APIs with validation
9. ✅ Study Room APIs with validation
10. ✅ Task APIs with validation

### Phase 4: Analytics & Admin (Future)
11. ✅ Moderation Analytics API
12. ✅ Rate Limit Status API
13. ✅ User Profile APIs

---

## Security Considerations

### All APIs Must:
- ✅ Validate authentication tokens
- ✅ Implement rate limiting server-side
- ✅ Log all moderation actions
- ✅ Validate content server-side (never trust client)
- ✅ Return consistent error messages (prevent enumeration)
- ✅ Use HTTPS only
- ✅ Implement CORS properly
- ✅ Validate input types and formats
- ✅ Sanitize all user input
- ✅ Implement request timeouts

---

## Testing Requirements

Each API endpoint should have:
- ✅ Unit tests
- ✅ Integration tests
- ✅ Security tests (SQL injection, XSS, etc.)
- ✅ Rate limiting tests
- ✅ Content moderation tests
- ✅ Error handling tests

---

**Last Updated:** January 2025  
**Next Steps:** Implement Phase 1 (Critical Security APIs) first

