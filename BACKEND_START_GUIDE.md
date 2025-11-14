# Backend Implementation Start Guide

**Recommended Starting Point:** Authentication APIs  
**Why:** Everything else depends on authentication, highest security priority

---

## 🎯 Quick Start Recommendation

### Option 1: **Start Simple** (Recommended for MVP)
Use **Supabase** or **Firebase** - they provide authentication APIs out of the box:
- ✅ Built-in auth (email/password, MFA)
- ✅ Session management
- ✅ No backend code needed initially
- ✅ Can add custom APIs later

**Time to implement:** 1-2 hours

### Option 2: **Custom Backend** (Recommended for Production)
Build Node.js/Express backend with:
- ✅ Full control
- ✅ Custom business logic
- ✅ Better for scaling
- ✅ More work upfront

**Time to implement:** 1-2 days

---

## 🚀 Recommended: Start with Supabase (Fastest Path)

### Why Supabase?
1. **Free tier** - Perfect for development
2. **Built-in auth** - Email/password, MFA, sessions
3. **PostgreSQL database** - Real database, not just auth
4. **Real-time subscriptions** - For WebSocket features
5. **Auto-generated APIs** - REST endpoints ready
6. **TypeScript support** - Matches your frontend

### Step 1: Set Up Supabase (15 minutes)

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Create new project
   - Note your project URL and anon key

2. **Install Supabase Client**
   ```bash
   cd /home/user/workspace
   bun add @supabase/supabase-js
   ```

3. **Create Supabase Client**
   Create `src/api/supabase.ts`:
   ```typescript
   import { createClient } from '@supabase/supabase-js';
   
   const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
   const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
   
   export const supabase = createClient(supabaseUrl, supabaseAnonKey);
   ```

4. **Add to .env**
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

### Step 2: Integrate with Existing Auth (30 minutes)

Update `src/utils/authService.ts` to use Supabase:

```typescript
import { supabase } from '../api/supabase';
import * as SecureStore from 'expo-secure-store';

export const authService = {
  async register(email: string, password: string, username: string) {
    // Supabase handles password hashing automatically
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username, // Stored in user metadata
        }
      }
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // Store session token
    if (data.session) {
      await SecureStore.setItemAsync('auth_token', data.session.access_token);
    }

    return {
      success: true,
      userId: data.user?.id,
      token: data.session?.access_token,
    };
  },

  async login(email: string, password: string, mfaCode?: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // Store session
    if (data.session) {
      await SecureStore.setItemAsync('auth_token', data.session.access_token);
    }

    return {
      success: true,
      userId: data.user?.id,
      username: data.user?.user_metadata?.username,
      token: data.session?.access_token,
    };
  },

  async logout() {
    await supabase.auth.signOut();
    await SecureStore.deleteItemAsync('auth_token');
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { success: !error, error: error?.message };
  },
};
```

**Benefits:**
- ✅ Server-side password hashing (bcrypt)
- ✅ Session management built-in
- ✅ Token refresh automatic
- ✅ Email verification support
- ✅ Password reset emails

---

## 🔧 Alternative: Custom Node.js Backend (More Control)

If you prefer full control, here's a minimal starter:

### Step 1: Create Backend Directory

```bash
mkdir backend
cd backend
npm init -y
```

### Step 2: Install Dependencies

```bash
npm install express cors dotenv
npm install jsonwebtoken bcrypt
npm install express-rate-limit helmet
npm install --save-dev typescript @types/node @types/express @types/bcrypt @types/jsonwebtoken
npm install --save-dev nodemon ts-node
```

### Step 3: Create Minimal Auth API

Create `backend/src/routes/auth.ts`:

```typescript
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many login attempts, please try again later',
});

// POST /api/auth/register
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // Validation
    if (!email || !password || !username) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Content moderation for username
    // TODO: Add content moderation check

    // Hash password (server-side)
    const hashedPassword = await bcrypt.hash(password, 10);

    // TODO: Save to database
    // const user = await db.users.create({ email, password: hashedPassword, username });

    // Generate token
    const token = jwt.sign(
      { userId: 'user-id', email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      userId: 'user-id',
      token,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/login
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password, mfaCode } = req.body;

    // TODO: Get user from database
    // const user = await db.users.findByEmail(email);
    // if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    // Verify password
    // const isValid = await bcrypt.compare(password, user.password);
    // if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

    // TODO: Check MFA if enabled
    // if (user.mfaEnabled && !mfaCode) {
    //   return res.json({ requiresMFA: true });
    // }

    // Generate token
    const token = jwt.sign(
      { userId: 'user-id', email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      userId: 'user-id',
      username: 'username',
      token,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

### Step 4: Create Server Entry Point

Create `backend/src/index.ts`:

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRouter from './routes/auth';

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## 📋 My Recommendation: **Start with Supabase**

### Why?
1. **Faster** - 1-2 hours vs 1-2 days
2. **Secure** - Built-in security best practices
3. **Scalable** - Can handle production traffic
4. **Less code** - Focus on your app, not infrastructure
5. **Free tier** - Perfect for development

### Implementation Plan:

**Week 1:**
- ✅ Set up Supabase (Day 1)
- ✅ Integrate auth with existing code (Day 2)
- ✅ Test authentication flow (Day 3)
- ✅ Add MFA support (Day 4-5)

**Week 2:**
- ✅ Add content moderation API (Supabase Edge Functions)
- ✅ Add chat message storage
- ✅ Add group/room persistence

**Week 3:**
- ✅ Add real-time subscriptions
- ✅ Add analytics
- ✅ Production deployment

---

## 🎯 Next Steps

1. **Choose your path:**
   - 🟢 **Supabase** (Recommended) - Fastest, easiest
   - 🟡 **Custom Backend** - More control, more work

2. **If Supabase:**
   - Create account
   - Install client library
   - Update authService.ts

3. **If Custom:**
   - Set up Node.js project
   - Implement auth routes
   - Add database (PostgreSQL recommended)

4. **Test:**
   - Register new user
   - Login
   - Verify token storage
   - Test password reset

---

## 📚 Resources

- **Supabase Docs:** https://supabase.com/docs
- **Supabase Auth:** https://supabase.com/docs/guides/auth
- **Express.js:** https://expressjs.com/
- **JWT:** https://jwt.io/

---

**Ready to start?** Let me know which path you prefer and I'll help you implement it!

