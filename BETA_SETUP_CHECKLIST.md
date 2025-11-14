# Beta Testing Setup Checklist

**Status:** Code Ready ✅ | Supabase Setup Needed ⏳  
**Time:** 15-20 minutes

---

## ✅ Code Status

- ✅ **Supabase client installed** (`@supabase/supabase-js`)
- ✅ **Auth service created** (`authServiceSupabase.ts`)
- ✅ **AuthenticationScreen updated** (auto-detects Supabase)
- ✅ **Backend integration ready** (uses Supabase tokens)
- ✅ **All documentation created**

**Your code will automatically use Supabase once you add credentials!**

---

## 📋 Setup Steps (Do These Now)

### Step 1: Create Supabase Project (5 min)

1. **Go to:** https://supabase.com
2. **Sign up/Login**
3. **Click "New Project"**
4. **Fill in:**
   - Name: `studentopia-beta`
   - Password: **Save this!** (you'll need it)
   - Region: Choose closest
5. **Wait 2-3 minutes** for setup

---

### Step 2: Get Credentials (2 min)

1. **Dashboard** → **Settings** (⚙️) → **API**
2. **Copy:**
   - **Project URL** → `https://xxxxx.supabase.co`
   - **anon public key** → `eyJhbGc...` (long string)

---

### Step 3: Add to .env File (2 min)

1. **Open `.env` file** in project root
2. **Add these lines:**
   ```env
   # Supabase Configuration (for beta testing)
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```
3. **Replace** with your actual values from Step 2
4. **Save file**

---

### Step 4: Enable Email Auth (2 min)

1. **Supabase Dashboard** → **Authentication** → **Providers**
2. **Click "Email"**
3. **Enable:**
   - ✅ Toggle "Enable Email provider" ON
   - ⚠️ **Disable "Confirm email"** (for easier beta testing)
   - ✅ Enable "Secure email change"
4. **Click "Save"**

---

### Step 5: Create Database Schema (5 min)

1. **Supabase Dashboard** → **SQL Editor**
2. **Click "New query"**
3. **Copy SQL from `SUPABASE_SETUP.md` Step 4** (or see below)
4. **Paste and Run**
5. **Verify:** Should see "Success. No rows returned"

**Quick SQL:**
```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT,
  role TEXT DEFAULT 'student',
  language TEXT DEFAULT 'en',
  theme_color TEXT DEFAULT 'nature',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

### Step 6: Restart & Test (3 min)

1. **Stop Expo** (Ctrl+C if running)

2. **Restart:**
   ```bash
   bun start
   ```

3. **Test Registration:**
   - Open app
   - Sign Up
   - Email: `test@example.com`
   - Password: `Test1234!@#$` (meets requirements)
   - Username: `testuser`
   - Should create account!

4. **Verify in Supabase:**
   - Dashboard → **Authentication** → **Users**
   - See your test user ✅
   - **Table Editor** → **profiles**
   - See profile created ✅

5. **Test Login:**
   - Logout
   - Login with same credentials
   - Should work! ✅

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Supabase project created
- [ ] Credentials added to `.env`
- [ ] Email auth enabled
- [ ] Database schema created
- [ ] Test registration works
- [ ] Test user in Supabase dashboard
- [ ] Profile auto-created
- [ ] Test login works

---

## 🎯 Ready for Beta Testing!

Once all checkboxes are ✅, you're ready to:

1. ✅ **Invite beta testers**
2. ✅ **Share app** (APK/IPA)
3. ✅ **Monitor users** in Supabase dashboard
4. ✅ **Track registrations**
5. ✅ **View user profiles**

---

## 🆘 Quick Troubleshooting

**"Supabase credentials not found"**
- Check `.env` file exists
- Verify variable names exactly
- Restart Expo

**"Email already registered"**
- Check Supabase → Authentication → Users
- Delete test user if needed

**"Network error"**
- Check internet connection
- Verify Supabase URL (no trailing slash)
- Check project is active

---

## 📚 Detailed Guides

- **Quick Start:** `QUICK_START_SUPABASE.md`
- **Full Setup:** `SUPABASE_SETUP.md`
- **Migration:** `SUPABASE_MIGRATION_GUIDE.md`

---

**Ready?** Follow the steps above! 🚀

