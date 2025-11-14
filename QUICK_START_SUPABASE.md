# Quick Start: Supabase Authentication

**Get Supabase auth working in 10 minutes!**

---

## 🚀 3-Step Setup

### Step 1: Create Supabase Project (3 min)

1. Go to **https://supabase.com**
2. **Sign up** (free)
3. **Create Project**
   - Name: `studentopia`
   - Password: Save it!
   - Region: Choose closest
4. Wait 2 minutes for setup

### Step 2: Get Credentials (1 min)

1. In Supabase dashboard → **Settings** → **API**
2. Copy:
   - **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
   - **anon public key** → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### Step 3: Add to .env (1 min)

Create `.env` file in project root:

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

**Done!** 🎉

---

## ✅ Test It

1. **Restart Expo:**
   ```bash
   bun start
   ```

2. **Try Sign Up:**
   - Open app
   - Go to Sign Up
   - Enter email, password, username
   - Should create account!

3. **Check Supabase:**
   - Dashboard → Authentication → Users
   - See your test user!

---

## 🔄 Switch to Supabase Auth

### Option 1: Gradual (Recommended)

Edit `src/screens/AuthenticationScreen.tsx`:

```typescript
// Add at top
import { authServiceSupabase } from "../utils/authServiceSupabase";
const USE_SUPABASE = !!process.env.EXPO_PUBLIC_SUPABASE_URL;

// In handleSignup:
const result = USE_SUPABASE
  ? await authServiceSupabase.register(email, password, username)
  : await authService.register(email, password, username);

// In handleLogin:
const result = USE_SUPABASE
  ? await authServiceSupabase.login(email, password, mfaCode)
  : await authService.login(email, password, mfaCode);
```

### Option 2: Full Switch

```typescript
// Change import:
import { authServiceSupabase as authService } from "../utils/authServiceSupabase";
```

---

## 🎯 What You Get

✅ **Server-side password hashing** (bcrypt)  
✅ **Automatic session management**  
✅ **Token refresh** (automatic)  
✅ **Email verification** (optional)  
✅ **Password reset emails** (automatic)  
✅ **Rate limiting** (built-in)  
✅ **Secure by default**  

---

## 📚 Next Steps

1. ✅ **Enable Email Auth** in Supabase dashboard
2. ✅ **Set up database** (see `SUPABASE_SETUP.md`)
3. ✅ **Add MFA** (optional)
4. ✅ **Add content moderation** API

---

## 🆘 Troubleshooting

**"Supabase credentials not found"**
- Check `.env` file exists
- Restart Expo server

**"Email already registered"**
- User exists in Supabase
- Delete from dashboard if needed

**"Network error"**
- Check internet connection
- Verify Supabase URL is correct

---

**Need help?** See `SUPABASE_SETUP.md` for detailed guide.

