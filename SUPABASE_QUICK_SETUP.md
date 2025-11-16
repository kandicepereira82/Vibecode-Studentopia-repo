# Quick Supabase Setup Guide

## ⚠️ Important: Don't Commit Credentials to GitHub

**Never commit `.env` files or API keys to GitHub!** They contain sensitive information.

---

## Step 1: Create Supabase Project (5 minutes)

1. Go to **https://supabase.com**
2. Sign up (free account)
3. Click **"New Project"**
   - Name: `vibecode` (or your choice)
   - Database Password: **Save this password!**
   - Region: Choose closest to you
   - Wait 2-3 minutes for setup

---

## Step 2: Get Your Credentials

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (long string)

---

## Step 3: Add Credentials Locally (On Your Mac)

1. **Create `.env` file** in your project root:
   ```bash
   cd /Users/kanda82/Documents/Vibecode-Studentopia-repo
   touch .env
   ```

2. **Add your credentials** to `.env`:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```
   Replace with your actual values from Step 2.

3. **Make sure `.env` is in `.gitignore`** (should already be there):
   ```bash
   # Check if .env is ignored
   cat .gitignore | grep .env
   ```

---

## Step 4: Enable Email Authentication in Supabase

1. In Supabase dashboard: **Authentication** → **Providers**
2. Find **Email** provider
3. Click **Enable**
4. (Optional) Enable "Confirm email" for extra security

---

## Step 5: Restart Expo

```bash
# Stop current server (Ctrl+C if running)
rm -rf node_modules/.cache .expo ~/.expo
npx expo start --clear
```

---

## Step 6: Test the App

1. Open Expo Go on your iPad
2. Scan the QR code
3. Try creating an account - it should now use Supabase!

---

## ✅ Verification

After adding credentials, the app will automatically:
- ✅ Use Supabase authentication (instead of local)
- ✅ Store data in the cloud
- ✅ Enable multi-device sync
- ✅ Provide server-side password hashing

---

## 🔒 Security Notes

- ✅ `.env` file is already in `.gitignore` (won't be committed)
- ✅ Never share your Supabase keys publicly
- ✅ The `anon` key is safe for client-side use (it's public)
- ✅ Supabase handles security rules server-side

---

## Need Help?

- **Supabase Docs**: https://supabase.com/docs
- **Setup Guide**: See `SUPABASE_SETUP.md` for detailed instructions

