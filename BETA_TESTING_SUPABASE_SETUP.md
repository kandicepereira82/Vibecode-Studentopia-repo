# Beta Testing: Complete Supabase Setup

**Goal:** Get Supabase ready for beta testing  
**Time:** 15-20 minutes  
**Status:** Step-by-step guide

---

## ✅ Step-by-Step Setup

### Step 1: Create Supabase Project (5 min)

1. **Go to https://supabase.com**
2. **Sign up** (or log in if you have an account)
3. **Click "New Project"**
4. **Fill in details:**
   - **Organization:** Create new or select existing
   - **Project Name:** `studentopia-beta` (or your choice)
   - **Database Password:** ⚠️ **SAVE THIS!** You'll need it
   - **Region:** Choose closest to your beta testers
   - **Pricing Plan:** Free tier is fine for beta

5. **Click "Create new project"**
6. **Wait 2-3 minutes** for setup to complete

---

### Step 2: Get Your Credentials (2 min)

1. **In Supabase dashboard**, go to **Settings** (gear icon) → **API**
2. **Copy these values:**
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public key** (starts with `eyJhbGc...` - very long)

3. **Save them** - you'll add them to `.env` next

---

### Step 3: Configure Environment Variables (2 min)

1. **Check if `.env` file exists** in project root:
   ```bash
   ls -la .env
   ```

2. **Create or update `.env` file:**
   ```bash
   # If file doesn't exist, create it
   touch .env
   ```

3. **Add Supabase credentials:**
   ```env
   # Supabase Configuration
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. **Replace placeholders** with your actual values from Step 2

---

### Step 4: Enable Email Authentication (2 min)

1. **In Supabase dashboard**, go to **Authentication** → **Providers**
2. **Find "Email" provider** and click to expand
3. **Enable Email:**
   - ✅ Toggle "Enable Email provider" to ON
   - ✅ **Disable "Confirm email"** for beta testing (easier)
     - (You can enable it later for production)
   - ✅ Enable "Secure email change" (recommended)

4. **Click "Save"**

---

### Step 5: Set Up Database Schema (5 min)

1. **In Supabase dashboard**, go to **SQL Editor**
2. **Click "New query"**
3. **Copy and paste this SQL:**

```sql
-- Create profiles table (extends Supabase auth.users)
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

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running)
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Create policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Create policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create function to auto-create profile on signup
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

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to call function on new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

4. **Click "Run"** (or press Ctrl+Enter)
5. **Verify success** - Should see "Success. No rows returned"

---

### Step 6: Update Your Code to Use Supabase (3 min)

1. **Edit `src/screens/AuthenticationScreen.tsx`:**

Find this line (around line 10):
```typescript
import { authService } from "../utils/authService";
```

Replace with:
```typescript
import { authServiceSupabase as authService } from "../utils/authServiceSupabase";
```

2. **Save the file**

---

### Step 7: Restart Expo and Test (3 min)

1. **Stop Expo** (if running): Press `Ctrl+C` in terminal

2. **Restart Expo:**
   ```bash
   bun start
   ```

3. **Test Registration:**
   - Open app
   - Go to Sign Up screen
   - Enter:
     - Email: `test@example.com`
     - Password: `Test1234!@#$` (must meet requirements)
     - Username: `testuser`
   - Click Sign Up
   - Should create account!

4. **Verify in Supabase:**
   - Go to Supabase dashboard
   - **Authentication** → **Users**
   - You should see your test user!
   - **Table Editor** → **profiles**
   - You should see profile created automatically!

5. **Test Login:**
   - Logout
   - Login with same credentials
   - Should work!

---

## ✅ Verification Checklist

After setup, verify:

- [ ] **Supabase project created**
- [ ] **Credentials in `.env` file**
- [ ] **Email auth enabled**
- [ ] **Database schema created**
- [ ] **Code updated to use Supabase**
- [ ] **Test registration works**
- [ ] **Test user appears in Supabase dashboard**
- [ ] **Profile created automatically**
- [ ] **Test login works**

---

## 🐛 Troubleshooting

### "Supabase credentials not found"
- ✅ Check `.env` file exists
- ✅ Verify variable names exactly: `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- ✅ Restart Expo server

### "Email already registered"
- ✅ User exists in Supabase
- ✅ Check Authentication → Users
- ✅ Delete test user if needed

### "Invalid email or password"
- ✅ Check password meets requirements (12+ chars, complexity)
- ✅ Verify email is correct
- ✅ Check Supabase logs (Authentication → Logs)

### "Network error"
- ✅ Check internet connection
- ✅ Verify Supabase URL is correct (no trailing slash)
- ✅ Check Supabase project is active (not paused)

### SQL Errors
- ✅ Make sure you're in SQL Editor
- ✅ Run each statement separately if needed
- ✅ Check for typos in SQL

---

## 🎯 Next Steps After Setup

1. ✅ **Test with multiple users** (simulate beta testers)
2. ✅ **Set up email templates** (optional, for better UX)
3. ✅ **Add more database tables** (tasks, groups, etc.)
4. ✅ **Configure password reset emails**
5. ✅ **Set up monitoring** (Supabase dashboard)

---

## 📊 Beta Testing Checklist

Before inviting beta testers:

- [ ] Supabase set up and tested
- [ ] Registration works
- [ ] Login works
- [ ] Password reset works (test it)
- [ ] Content moderation working
- [ ] App stable
- [ ] Error handling tested
- [ ] Ready for beta testers!

---

**Ready to start?** Follow the steps above! 🚀

