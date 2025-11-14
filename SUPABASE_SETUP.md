# Supabase Setup Guide

**Quick Start:** Get Supabase authentication working in 15 minutes!

---

## Step 1: Create Supabase Project (5 minutes)

1. **Go to https://supabase.com**
2. **Sign up** (free account)
3. **Create New Project**
   - Project name: `studentopia` (or your choice)
   - Database password: **Save this!** (you'll need it)
   - Region: Choose closest to your users
   - Wait 2-3 minutes for setup

4. **Get Your Credentials**
   - Go to **Settings** → **API**
   - Copy:
     - **Project URL** (e.g., `https://xxxxx.supabase.co`)
     - **anon/public key** (starts with `eyJ...`)

---

## Step 2: Configure Environment Variables (2 minutes)

1. **Create/Update `.env` file** in project root:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

2. **Replace placeholders** with your actual values from Step 1

3. **Restart Expo** (if running):
   ```bash
   # Stop current server (Ctrl+C)
   bun start
   ```

---

## Step 3: Enable Email Authentication (3 minutes)

1. **Go to Authentication** → **Providers** in Supabase dashboard
2. **Enable Email provider**
   - ✅ Enable "Confirm email" (optional, recommended)
   - ✅ Enable "Secure email change" (recommended)
3. **Configure Email Templates** (optional)
   - Customize welcome emails
   - Customize password reset emails

---

## Step 4: Set Up Database Schema (5 minutes)

1. **Go to SQL Editor** in Supabase dashboard
2. **Run this SQL** to create user profiles table:

```sql
-- Create profiles table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
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
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call function on new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## Step 5: Update Your Code (Optional - Migration)

### Option A: Use New Supabase Auth Service

Update `src/screens/AuthenticationScreen.tsx`:

```typescript
// Change this:
import { authService } from "../utils/authService";

// To this:
import { authServiceSupabase as authService } from "../utils/authServiceSupabase";
```

### Option B: Keep Existing (Hybrid Approach)

The existing `authService` will continue to work for offline mode.  
Supabase auth will work when online.

---

## Step 6: Test Authentication

1. **Start your app:**
   ```bash
   bun start
   ```

2. **Test Registration:**
   - Go to Sign Up screen
   - Enter email, password, username
   - Should create account in Supabase

3. **Check Supabase Dashboard:**
   - Go to **Authentication** → **Users**
   - You should see your test user!

4. **Test Login:**
   - Logout
   - Login with same credentials
   - Should work!

---

## Step 7: Configure Email (Optional)

### For Development:
- Supabase sends emails automatically
- Check **Authentication** → **Users** → **Email Logs** in dashboard

### For Production:
1. **Set up custom SMTP** (Settings → Auth → SMTP Settings)
   - Use SendGrid, Mailgun, or AWS SES
   - Configure SMTP credentials
   - Customize email templates

---

## Security Features Enabled

✅ **Server-side password hashing** (bcrypt)  
✅ **Session management** (automatic)  
✅ **Token refresh** (automatic)  
✅ **Rate limiting** (built-in)  
✅ **Email verification** (optional)  
✅ **Password reset emails** (automatic)  
✅ **Row Level Security** (database policies)  

---

## Next Steps

1. ✅ **Test authentication** - Register and login
2. ✅ **Add MFA** - Enable TOTP in Supabase
3. ✅ **Add content moderation** - Use Supabase Edge Functions
4. ✅ **Add real-time features** - Use Supabase Realtime
5. ✅ **Add database tables** - For groups, tasks, etc.

---

## Troubleshooting

### "Supabase credentials not found"
- Check `.env` file exists
- Verify variable names: `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Restart Expo server

### "Email already registered"
- User exists in Supabase
- Check Authentication → Users in dashboard
- Delete test user if needed

### "Invalid email or password"
- Check password meets requirements (12+ chars, complexity)
- Verify email is correct
- Check Supabase logs in dashboard

### "Network error"
- Check internet connection
- Verify Supabase URL is correct
- Check Supabase project is active (not paused)

---

## Database Schema for Future Features

When ready, add these tables:

```sql
-- Tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Groups table
CREATE TABLE public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  share_code TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study rooms table
CREATE TABLE public.study_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

**Ready to go!** 🚀

Your app now has secure, server-side authentication with Supabase!

