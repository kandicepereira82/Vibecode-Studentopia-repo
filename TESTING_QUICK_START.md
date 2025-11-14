# Security Testing Quick Start

**Quick reference for testing security fixes**

---

## 🚀 Quick Test Commands

### In Your App (Development Mode)

Add this to any screen component for quick testing:

```typescript
import { runAllSecurityTests } from "../utils/testSecurity";
import { useUserStore } from "../state/userStore";

// In your component
const user = useUserStore((s) => s.user);

// Run all tests
const handleTestSecurity = async () => {
  await runAllSecurityTests(user?.id, user?.email);
};
```

### Individual Tests

```typescript
import testSecurity from "../utils/testSecurity";

// Test password requirements
await testSecurity.testPasswordRequirements();

// Test rate limiting
await testSecurity.testRateLimiting();

// Test token expiration
await testSecurity.testTokenExpiration();

// Test data encryption
await testSecurity.testDataEncryption();

// Test session management
await testSecurity.testSessionManagement(userId);

// Test MFA
await testSecurity.testMFA(userId, email);
```

---

## 📱 Manual Testing Checklist

### Quick Manual Tests (5 minutes)

1. **Password Requirements** ✅
   - Try signing up with weak password → Should fail
   - Try signing up with strong password → Should succeed

2. **Rate Limiting** ✅
   - Try 5 wrong passwords → Should lock account
   - Try password reset 3 times → Should lock reset

3. **Token Expiration** ✅
   - Login → Check token has expiry time
   - Wait 1 hour → Token should expire

4. **SecureStore** ✅
   - Login → Check if data in SecureStore (not AsyncStorage)
   - Check credentials are encrypted

5. **MFA** ✅
   - Enable MFA → Get QR code
   - Login → Should require MFA code

---

## 🔍 Verification Commands

### Check Token Expiration
```typescript
import * as SecureStore from "expo-secure-store";

const tokenData = await SecureStore.getItemAsync("auth_token");
const data = JSON.parse(tokenData);
console.log("Expires at:", new Date(data.expiresAt));
console.log("Expires in:", Math.floor((data.expiresAt - Date.now()) / 1000 / 60), "minutes");
```

### Check Data Encryption
```typescript
import { decryptJSON } from "./src/utils/encryption";
import * as SecureStore from "expo-secure-store";

const encrypted = await SecureStore.getItemAsync("app_credentials");
try {
  const decrypted = await decryptJSON(encrypted);
  console.log("✅ Encrypted and decrypts correctly");
} catch {
  console.log("❌ Encryption issue");
}
```

### Check Sessions
```typescript
import { sessionService } from "./src/services/sessionService";

const sessions = await sessionService.getUserSessions(userId);
console.log("Active sessions:", sessions.length);
sessions.forEach(s => {
  console.log(`- ${s.deviceName} (${s.platform})`);
});
```

### Check MFA Status
```typescript
import { mfaService } from "./src/services/mfaService";

const enabled = await mfaService.isMFAEnabled(userId);
console.log("MFA Enabled:", enabled);

if (enabled) {
  const code = await mfaService.getCurrentTOTPCode(userId);
  console.log("Current TOTP:", code);
}
```

---

## ✅ Expected Results

### All Tests Should Show:

- ✅ Password requirements enforced
- ✅ Rate limiting working (5 attempts = lockout)
- ✅ Tokens expire after 1 hour
- ✅ Data encrypted in storage
- ✅ Sessions tracked per device
- ✅ MFA can be enabled/disabled
- ✅ Share codes hashed
- ✅ Chat rate limited (10/min)

---

## 🐛 Common Issues

**Issue:** SecureStore not working  
**Fix:** Run on physical device (not simulator/emulator)

**Issue:** Tests fail  
**Fix:** Make sure you're logged in and have test data

**Issue:** MFA codes don't work  
**Fix:** Check device clock is accurate (TOTP requires sync)

---

**For detailed testing instructions, see:** `SECURITY_TESTING_GUIDE.md`

