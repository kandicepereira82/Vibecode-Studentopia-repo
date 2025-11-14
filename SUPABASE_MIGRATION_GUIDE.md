# Supabase Migration Guide

**Status:** Ready to migrate  
**Time Required:** 15-30 minutes

---

## Quick Migration Steps

### Step 1: Set Up Supabase (5 min)

Follow `SUPABASE_SETUP.md` to:
1. Create Supabase project
2. Get credentials
3. Add to `.env` file

### Step 2: Choose Migration Strategy

#### Option A: **Gradual Migration** (Recommended)
Keep existing auth, add Supabase alongside:
- ✅ No breaking changes
- ✅ Test Supabase before switching
- ✅ Can rollback easily

#### Option B: **Full Migration**
Switch to Supabase immediately:
- ✅ Cleaner codebase
- ✅ Server-side security immediately
- ⚠️ Requires testing

---

## Option A: Gradual Migration (Recommended)

### 1. Update Authentication Screen

Edit `src/screens/AuthenticationScreen.tsx`:

```typescript
// Add at top of file
import { authServiceSupabase } from "../utils/authServiceSupabase";

// Add feature flag (or use environment variable)
const USE_SUPABASE_AUTH = process.env.EXPO_PUBLIC_SUPABASE_URL ? true : false;

// In handleSignup function, replace:
const result = await authService.register(email, password, username);

// With:
const result = USE_SUPABASE_AUTH
  ? await authServiceSupabase.register(email, password, username)
  : await authService.register(email, password, username);

// In handleLogin function, replace:
const result = await authService.login(email, password, mfaCode);

// With:
const result = USE_SUPABASE_AUTH
  ? await authServiceSupabase.login(email, password, mfaCode)
  : await authService.login(email, password, mfaCode);
```

### 2. Test Both Systems

- **Without Supabase:** Remove `.env` variables → Uses local auth
- **With Supabase:** Add `.env` variables → Uses Supabase auth

---

## Option B: Full Migration

### 1. Replace Auth Service Import

Edit `src/screens/AuthenticationScreen.tsx`:

```typescript
// Change this:
import { authService } from "../utils/authService";

// To this:
import { authServiceSupabase as authService } from "../utils/authServiceSupabase";
```

### 2. Update Other Files Using Auth

Search for `authService` imports:
```bash
grep -r "from.*authService" src/
```

Update each file to use `authServiceSupabase`.

---

## Testing Checklist

After migration, test:

- [ ] **Registration**
  - [ ] Create new account
  - [ ] Check Supabase dashboard → Users
  - [ ] Verify username stored in metadata

- [ ] **Login**
  - [ ] Login with new account
  - [ ] Verify session created
  - [ ] Check token stored securely

- [ ] **Password Reset**
  - [ ] Request password reset
  - [ ] Check email (or Supabase logs)
  - [ ] Reset password with token

- [ ] **Logout**
  - [ ] Logout works
  - [ ] Session cleared
  - [ ] Token removed

- [ ] **Token Refresh**
  - [ ] App stays logged in
  - [ ] Token refreshes automatically

---

## Rollback Plan

If something breaks:

1. **Remove Supabase variables** from `.env`
2. **Revert import** in `AuthenticationScreen.tsx`
3. **App uses local auth** again

---

## Next Steps After Migration

1. ✅ **Enable MFA** in Supabase
2. ✅ **Add content moderation** API
3. ✅ **Add database tables** for groups/tasks
4. ✅ **Add real-time subscriptions**

---

## Support

- **Supabase Docs:** https://supabase.com/docs
- **Supabase Discord:** https://discord.supabase.com
- **Setup Guide:** See `SUPABASE_SETUP.md`

