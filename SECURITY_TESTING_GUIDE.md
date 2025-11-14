# Security Fixes Testing Guide

**Date:** January 2025  
**Purpose:** Manual testing guide for all security fixes implemented

---

## 🧪 Testing Overview

This guide provides step-by-step instructions for testing all security fixes. Test in order for best results.

---

## Phase 1: Critical Security Fixes Testing

### Test 1: Password Requirements ✅

**Objective:** Verify strong password requirements are enforced

**Steps:**
1. Open app → Sign Up
2. Try weak passwords:
   - `123456` → Should fail: "Password must be at least 12 characters"
   - `password` → Should fail: "Password must be at least 12 characters"
   - `Password123` → Should fail: "Password must contain at least one special character"
   - `Password123!` → Should pass ✅

**Expected Results:**
- ✅ Minimum 12 characters enforced
- ✅ Lowercase letter required
- ✅ Uppercase letter required
- ✅ Number required
- ✅ Special character required

**Files to Check:**
- `src/screens/AuthenticationScreen.tsx` (UI validation)
- `src/utils/authService.ts` (backend validation)

---

### Test 2: Rate Limiting (Login) ✅

**Objective:** Verify login rate limiting prevents brute force attacks

**Steps:**
1. Open app → Login
2. Enter valid email, wrong password
3. Click Login 5 times (5 failed attempts)
4. On 6th attempt → Should show: "Account locked for 30 minutes"
5. Wait 30 minutes OR clear app data to reset

**Expected Results:**
- ✅ After 5 failed attempts, account locked
- ✅ Lockout message shows time remaining
- ✅ Cannot login during lockout period
- ✅ Counter resets after 15 minutes of no attempts

**Files to Check:**
- `src/utils/authService.ts` - `login()` function
- Check SecureStore/AsyncStorage for `login_attempts_${email}`

---

### Test 3: Rate Limiting (Password Reset) ✅

**Objective:** Verify password reset rate limiting

**Steps:**
1. Open app → Login → "Forgot Password?"
2. Enter email → Send reset request
3. Repeat 3 times (3 reset requests)
4. On 4th attempt → Should be locked for 1 hour

**Expected Results:**
- ✅ After 3 reset requests, locked for 1 hour
- ✅ Cannot request reset during lockout
- ✅ Counter resets after 1 hour

**Files to Check:**
- `src/utils/authService.ts` - `requestPasswordReset()` function

---

### Test 4: Token Expiration ✅

**Objective:** Verify auth tokens expire after 1 hour

**Steps:**
1. Login successfully
2. Note current time
3. Wait 1 hour (or manually set token expiry in storage)
4. Try to use API (should require re-login)

**Expected Results:**
- ✅ Token expires after 1 hour
- ✅ Expired token automatically cleared
- ✅ User must login again

**Files to Check:**
- `src/api/backend.ts` - `getAuthToken()` function
- Check SecureStore for `auth_token` (should have `expiresAt`)

**Manual Test:**
```typescript
// In app console or test file
const tokenData = await SecureStore.getItemAsync("auth_token");
const data = JSON.parse(tokenData);
console.log("Token expires at:", new Date(data.expiresAt));
console.log("Current time:", new Date());
console.log("Is expired:", Date.now() >= data.expiresAt);
```

---

### Test 5: Password Salt & Hashing ✅

**Objective:** Verify passwords are hashed with salt

**Steps:**
1. Register new user with password: `TestPassword123!`
2. Check storage for credentials
3. Verify password hash format: `salt:hash` (contains colon)
4. Register another user with same password
5. Verify hashes are different (different salts)

**Expected Results:**
- ✅ Password hash format: `salt:hash` (contains `:`)
- ✅ Same password produces different hashes (different salts)
- ✅ Legacy passwords migrated on next login

**Files to Check:**
- `src/utils/authService.ts` - `hashPassword()` function
- Check SecureStore for `app_credentials` (encrypted)

**Manual Test:**
```typescript
// Register user
await authService.register("test@example.com", "TestPassword123!", "TestUser");

// Check stored hash (after decryption)
// Should see format like: "a1b2c3d4...:e5f6g7h8..."
```

---

### Test 6: SecureStore Migration ✅

**Objective:** Verify sensitive data stored in SecureStore

**Steps:**
1. Login successfully
2. Check storage location:
   - **iOS:** Keychain (via SecureStore)
   - **Android:** EncryptedSharedPreferences (via SecureStore)
   - **Web:** AsyncStorage (fallback)

**Expected Results:**
- ✅ Auth tokens in SecureStore
- ✅ Credentials in SecureStore (encrypted)
- ✅ Reset tokens in SecureStore
- ✅ Rate limit attempts in SecureStore

**Files to Check:**
- `src/api/backend.ts` - Token storage
- `src/utils/authService.ts` - Credential storage

**Manual Test:**
```typescript
// Check if SecureStore is being used
try {
  const token = await SecureStore.getItemAsync("auth_token");
  console.log("Token in SecureStore:", token ? "Yes" : "No");
} catch (e) {
  console.log("SecureStore not available, using AsyncStorage");
}
```

---

### Test 7: Email Enumeration Fix ✅

**Objective:** Verify email enumeration is prevented

**Steps:**
1. Try login with non-existent email: `nonexistent@test.com`
2. Try login with existing email but wrong password
3. Compare error messages (should be identical)

**Expected Results:**
- ✅ Same error message: "Invalid email or password"
- ✅ Consistent response time (timing attack prevention)
- ✅ Cannot determine if email exists

**Files to Check:**
- `src/utils/authService.ts` - `login()` function

---

### Test 8: Strong Reset Tokens ✅

**Objective:** Verify password reset tokens are strong

**Steps:**
1. Request password reset
2. Check console/logs for reset token
3. Verify token format: 32-character hex string

**Expected Results:**
- ✅ Token is 32-character hex (not 6-digit)
- ✅ Token is hashed before storage
- ✅ Token only logged in development mode

**Files to Check:**
- `src/utils/authService.ts` - `requestPasswordReset()` function

**Manual Test:**
```typescript
// Request reset
await authService.requestPasswordReset("test@example.com");

// Check stored token hash (should be SHA256 hash, not plain token)
// Token in logs should be 32-char hex: "a1b2c3d4e5f6..."
```

---

## Phase 2: High-Priority Security Enhancements Testing

### Test 9: Session Management ✅

**Objective:** Verify session tracking and management

**Steps:**
1. Login successfully
2. Verify session created:
   ```typescript
   const sessionId = await sessionService.getCurrentSessionId();
   console.log("Session ID:", sessionId);
   ```
3. Get all sessions:
   ```typescript
   const sessions = await sessionService.getUserSessions(userId);
   console.log("Active sessions:", sessions);
   ```
4. Verify session contains:
   - Session ID
   - Device ID
   - Device name
   - Platform
   - Created timestamp
   - Last active timestamp

**Expected Results:**
- ✅ Session created on login
- ✅ Session contains device information
- ✅ Multiple sessions tracked per user
- ✅ Sessions expire after 90 days

**Files to Check:**
- `src/services/sessionService.ts`
- `src/utils/authService.ts` - Session creation on login

**Manual Test:**
```typescript
// After login
const sessions = await sessionService.getUserSessions(userId);
console.log("Sessions:", JSON.stringify(sessions, null, 2));

// Revoke a session
await sessionService.revokeSession(userId, sessionId);

// Revoke all sessions
await sessionService.revokeAllSessions(userId);
```

---

### Test 10: Multi-Factor Authentication (MFA) ✅

**Objective:** Verify MFA setup and login flow

**Steps:**

**A. Enable MFA:**
1. Call MFA enable:
   ```typescript
   const setup = await mfaService.enableMFA(userId, email);
   console.log("QR Code Data:", setup.qrCodeData);
   console.log("Backup Codes:", setup.backupCodes);
   ```
2. Verify:
   - Secret generated
   - QR code data generated (otpauth:// URL)
   - 10 backup codes generated

**B. Login with MFA:**
1. Login with email/password
2. Should return: `{ requiresMFA: true }`
3. Get current TOTP code:
   ```typescript
   const code = await mfaService.getCurrentTOTPCode(userId);
   console.log("TOTP Code:", code);
   ```
4. Login with MFA code:
   ```typescript
   const result = await authService.login(email, password, mfaCode);
   ```
5. Should succeed if code is valid

**C. Login with Backup Code:**
1. Use one of the backup codes instead of TOTP
2. Should succeed
3. Backup code should be removed after use

**Expected Results:**
- ✅ MFA can be enabled
- ✅ QR code generated for authenticator apps
- ✅ Backup codes generated
- ✅ Login requires MFA code if enabled
- ✅ TOTP codes work
- ✅ Backup codes work (one-time use)
- ✅ Invalid MFA code rejected

**Files to Check:**
- `src/services/mfaService.ts`
- `src/utils/authService.ts` - MFA check in login

**Manual Test:**
```typescript
// Enable MFA
const setup = await mfaService.enableMFA(userId, "user@example.com");
console.log("Setup:", setup);

// Check if enabled
const enabled = await mfaService.isMFAEnabled(userId);
console.log("MFA Enabled:", enabled);

// Get current code
const code = await mfaService.getCurrentTOTPCode(userId);
console.log("Current TOTP:", code);

// Verify code
const valid = await mfaService.verifyMFACode(userId, code);
console.log("Code Valid:", valid);

// Disable MFA
await mfaService.disableMFA(userId);
```

---

### Test 11: Data Encryption at Rest ✅

**Objective:** Verify credentials are encrypted before storage

**Steps:**
1. Register new user
2. Check stored credentials:
   ```typescript
   const encrypted = await SecureStore.getItemAsync("app_credentials");
   console.log("Encrypted data:", encrypted);
   ```
3. Try to parse as JSON (should fail - it's encrypted)
4. Decrypt:
   ```typescript
   const decrypted = await decryptJSON(encrypted);
   console.log("Decrypted:", decrypted);
   ```

**Expected Results:**
- ✅ Credentials encrypted before storage
- ✅ Cannot read credentials without decryption
- ✅ Decryption works correctly
- ✅ Legacy unencrypted data still works (backward compatible)

**Files to Check:**
- `src/utils/encryption.ts`
- `src/utils/authService.ts` - Encryption on save, decryption on load

**Manual Test:**
```typescript
// Register user
await authService.register("test@example.com", "TestPassword123!", "Test");

// Check storage (should be encrypted string, not JSON)
const stored = await SecureStore.getItemAsync("app_credentials");
console.log("Stored (encrypted):", stored);

// Try to decrypt
const decrypted = await decryptJSON(stored);
console.log("Decrypted:", decrypted);
```

---

### Test 12: Share Code Hashing ✅

**Objective:** Verify group share codes are hashed

**Steps:**
1. Create a new group
2. Check group data:
   ```typescript
   const group = useGroupStore.getState().groups[0];
   console.log("Share Code:", group.shareCode); // Plain code
   console.log("Share Code Hash:", group.shareCodeHash); // Hashed
   ```
3. Join group with share code
4. Verify join works with plain code (hashed internally)

**Expected Results:**
- ✅ Share code generated (plain, for display)
- ✅ Share code hash stored (SHA256)
- ✅ Join works with plain code
- ✅ Hash comparison works correctly
- ✅ Legacy groups without hash still work

**Files to Check:**
- `src/state/groupStore.ts` - `addGroup()`, `joinGroupWithCode()`
- `src/types/index.ts` - Group interface

**Manual Test:**
```typescript
// Create group
useGroupStore.getState().addGroup({
  name: "Test Group",
  description: "Test",
  teacherId: userId,
  studentIds: [],
});

// Check group
const group = useGroupStore.getState().groups[0];
console.log("Plain Code:", group.shareCode);
console.log("Hash:", group.shareCodeHash);

// Join with code
const result = await useGroupStore.getState().joinGroupWithCode(
  group.shareCode,
  studentId,
  studentId
);
console.log("Join Result:", result);
```

---

### Test 13: Chat Rate Limiting ✅

**Objective:** Verify chat message rate limiting

**Steps:**
1. Join a study room
2. Send 10 messages quickly (within 1 minute)
3. Try to send 11th message
4. Should be blocked: "Rate limit exceeded"

**Expected Results:**
- ✅ Can send up to 10 messages per minute
- ✅ 11th message blocked
- ✅ Rate limit resets after 1 minute
- ✅ Rate limit per user (not global)

**Files to Check:**
- `src/state/chatStore.ts` - `sendMessage()` function

**Manual Test:**
```typescript
// Send 10 messages quickly
for (let i = 0; i < 10; i++) {
  useChatStore.getState().sendMessage(roomId, userId, "User", `Message ${i}`);
}

// 11th should fail
const result = useChatStore.getState().sendMessage(roomId, userId, "User", "Message 11");
console.log("11th message result:", result); // Should be false
```

---

## 🔍 Comprehensive Test Script

Create a test file to run all tests programmatically:

```typescript
// test-security.ts
import { authService } from "./src/utils/authService";
import { sessionService } from "./src/services/sessionService";
import { mfaService } from "./src/services/mfaService";
import { decryptJSON } from "./src/utils/encryption";
import * as SecureStore from "expo-secure-store";

async function runSecurityTests() {
  console.log("🧪 Starting Security Tests...\n");

  // Test 1: Password Requirements
  console.log("Test 1: Password Requirements");
  const weakPasswords = ["123", "password", "Password123"];
  for (const pwd of weakPasswords) {
    const result = await authService.register("test@test.com", pwd, "Test");
    console.log(`  ${pwd}: ${result.success ? "❌ FAIL" : "✅ PASS"}`);
  }

  // Test 2: Rate Limiting
  console.log("\nTest 2: Rate Limiting");
  for (let i = 0; i < 6; i++) {
    const result = await authService.login("test@test.com", "wrong");
    console.log(`  Attempt ${i + 1}: ${result.error || "Success"}`);
  }

  // Test 3: Token Expiration
  console.log("\nTest 3: Token Expiration");
  const tokenData = await SecureStore.getItemAsync("auth_token");
  if (tokenData) {
    const data = JSON.parse(tokenData);
    const expired = Date.now() >= data.expiresAt;
    console.log(`  Token expired: ${expired ? "✅" : "❌"}`);
  }

  // Test 4: Encryption
  console.log("\nTest 4: Data Encryption");
  const encrypted = await SecureStore.getItemAsync("app_credentials");
  try {
    JSON.parse(encrypted!); // Should fail if encrypted
    console.log("  ❌ FAIL: Data not encrypted");
  } catch {
    console.log("  ✅ PASS: Data is encrypted");
  }

  // Test 5: Session Management
  console.log("\nTest 5: Session Management");
  const sessions = await sessionService.getUserSessions("test-user-id");
  console.log(`  Active sessions: ${sessions.length}`);

  // Test 6: MFA
  console.log("\nTest 6: MFA");
  const mfaEnabled = await mfaService.isMFAEnabled("test-user-id");
  console.log(`  MFA enabled: ${mfaEnabled}`);

  console.log("\n✅ Security Tests Complete!");
}

// Run tests
runSecurityTests().catch(console.error);
```

---

## 📊 Test Results Template

Use this template to track test results:

```
## Security Test Results

**Date:** [Date]
**Tester:** [Name]
**Environment:** [iOS/Android/Web]

### Phase 1: Critical Fixes
- [ ] Test 1: Password Requirements - ✅ PASS / ❌ FAIL
- [ ] Test 2: Rate Limiting (Login) - ✅ PASS / ❌ FAIL
- [ ] Test 3: Rate Limiting (Reset) - ✅ PASS / ❌ FAIL
- [ ] Test 4: Token Expiration - ✅ PASS / ❌ FAIL
- [ ] Test 5: Password Salt & Hashing - ✅ PASS / ❌ FAIL
- [ ] Test 6: SecureStore Migration - ✅ PASS / ❌ FAIL
- [ ] Test 7: Email Enumeration Fix - ✅ PASS / ❌ FAIL
- [ ] Test 8: Strong Reset Tokens - ✅ PASS / ❌ FAIL

### Phase 2: High-Priority Enhancements
- [ ] Test 9: Session Management - ✅ PASS / ❌ FAIL
- [ ] Test 10: Multi-Factor Authentication - ✅ PASS / ❌ FAIL
- [ ] Test 11: Data Encryption at Rest - ✅ PASS / ❌ FAIL
- [ ] Test 12: Share Code Hashing - ✅ PASS / ❌ FAIL
- [ ] Test 13: Chat Rate Limiting - ✅ PASS / ❌ FAIL

### Issues Found:
1. [Issue description]
2. [Issue description]

### Notes:
[Any additional notes]
```

---

## 🐛 Troubleshooting

### Issue: SecureStore not working
**Solution:** Check if running on physical device (SecureStore requires native modules)

### Issue: MFA codes not working
**Solution:** Check clock synchronization (TOTP requires accurate time)

### Issue: Rate limiting not resetting
**Solution:** Clear app data or wait for cooldown period

### Issue: Encryption errors
**Solution:** Check if encryption key exists, regenerate if needed

---

## ✅ Success Criteria

All tests should pass with:
- ✅ No security vulnerabilities exposed
- ✅ All rate limits working
- ✅ All encryption working
- ✅ All hashing working
- ✅ All sessions tracked
- ✅ MFA functional

---

**Last Updated:** January 2025  
**Status:** Ready for Testing

