# How to Get Expo Access Token for EAS Build

## Quick Steps

### Step 1: Go to Expo Dashboard

1. **Open:** https://expo.dev
2. **Login** to your Expo account
3. **Go to:** Your Account → Settings → Access Tokens
   - Direct link: https://expo.dev/accounts/[your-username]/settings/access-tokens

### Step 2: Create New Token

1. **Click:** "Create Token"
2. **Name it:** "EAS Build Token" (or any name)
3. **Select permissions:** 
   - ✅ Build (required)
   - ✅ Read (optional, but recommended)
4. **Click:** "Create"
5. **Copy the token** (you'll only see it once!)

### Step 3: Use the Token

**Option A: Login with token**
```bash
npx eas-cli login --access-token YOUR_TOKEN_HERE
```

**Option B: Set as environment variable**
```bash
export EXPO_TOKEN=YOUR_TOKEN_HERE
npx eas-cli build --platform android --profile preview
```

---

## Security Note

⚠️ **Never commit tokens to git!**
- Tokens are sensitive credentials
- Keep them in `.env` file (add to `.gitignore`)
- Or use environment variables

---

## After Login

Once logged in, you can run:
```bash
npx eas-cli build --platform android --profile preview
```

---

## Need Help?

If you don't have an Expo account yet:
1. **Sign up:** https://expo.dev/signup
2. **Verify email**
3. **Then follow steps above**

