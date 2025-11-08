# Production Deployment Guide for Live Sessions, Groups & Friends

## Overview

This guide covers deploying Studentopia's collaborative features (Friends, Groups, Live Sessions) to production with real-time synchronization, push notifications, and multi-device support.

## Architecture

### Tech Stack

**Frontend:**
- React Native + Expo SDK 53
- Zustand for state management
- WebSocket for real-time sync
- Expo Notifications for push

**Backend Options:**

**Option 1: Node.js + Express + Socket.io (Recommended)**
- REST API for CRUD operations
- WebSocket for real-time updates
- PostgreSQL/MongoDB for database
- Redis for session management
- Firebase Cloud Messaging for push notifications

**Option 2: Firebase (Easier Setup)**
- Firebase Authentication
- Firestore for database
- Firebase Realtime Database for live data
- Firebase Cloud Messaging for push
- Cloud Functions for backend logic

**Option 3: Supabase (Open Source Alternative)**
- PostgreSQL database with real-time subscriptions
- Built-in authentication
- REST API auto-generated
- Real-time updates via WebSocket
- Storage for files

## Setup Instructions

### Option 1: Node.js Backend

#### 1. Backend Setup

```bash
# Create backend directory
mkdir studentopia-backend
cd studentopia-backend

# Initialize project
npm init -y

# Install dependencies
npm install express cors dotenv
npm install socket.io jsonwebtoken bcrypt
npm install pg sequelize  # For PostgreSQL
npm install redis ioredis # For caching
npm install expo-server-sdk # For push notifications
npm install express-rate-limit helmet # Security

# Install dev dependencies
npm install --save-dev typescript @types/node @types/express
npm install --save-dev nodemon ts-node
```

#### 2. Environment Variables

Create `.env` file:

```env
# Server
PORT=3000
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/studentopia

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

# Firebase Cloud Messaging (for push notifications)
FCM_SERVER_KEY=your-fcm-server-key

# Expo
EXPO_ACCESS_TOKEN=your-expo-access-token

# CORS
ALLOWED_ORIGINS=https://yourdomain.com,exp://localhost:8081
```

#### 3. Database Schema

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'student',
  language VARCHAR(10) DEFAULT 'en',
  theme_color VARCHAR(50) DEFAULT 'nature',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Friends table
CREATE TABLE friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  friend_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending',
  requested_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  accepted_at TIMESTAMP,
  UNIQUE(user_id, friend_user_id)
);

-- Groups table
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  group_code VARCHAR(10) UNIQUE NOT NULL,
  teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_private BOOLEAN DEFAULT false,
  school_name VARCHAR(255),
  class_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Group members table
CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Study rooms table
CREATE TABLE study_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  host_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_private BOOLEAN DEFAULT false,
  max_participants INTEGER DEFAULT 10,
  timer_running BOOLEAN DEFAULT false,
  timer_mode VARCHAR(50) DEFAULT 'study',
  timer_minutes INTEGER DEFAULT 25,
  timer_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Room participants table
CREATE TABLE room_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES study_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_host BOOLEAN DEFAULT false,
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

-- Room invitations table
CREATE TABLE room_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES study_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  invited_by UUID REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

-- Chat messages table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES study_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  username VARCHAR(255),
  content TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Activity feed table
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Device tokens for push notifications
CREATE TABLE device_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) NOT NULL,
  platform VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, token)
);

-- Indexes for performance
CREATE INDEX idx_friends_user_id ON friends(user_id);
CREATE INDEX idx_friends_status ON friends(status);
CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_group_members_user_id ON group_members(user_id);
CREATE INDEX idx_room_participants_room_id ON room_participants(room_id);
CREATE INDEX idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_device_tokens_user_id ON device_tokens(user_id);
```

#### 4. Backend API Implementation

Create `src/index.ts`:

```typescript
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import routes
import friendsRouter from './routes/friends';
import groupsRouter from './routes/groups';
import studyRoomsRouter from './routes/studyRooms';
import activityRouter from './routes/activity';
import notificationsRouter from './routes/notifications';

// Import WebSocket handlers
import { setupWebSocket } from './websocket';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true,
  },
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/friends', friendsRouter);
app.use('/api/groups', groupsRouter);
app.use('/api/study-rooms', studyRoomsRouter);
app.use('/api/activity', activityRouter);
app.use('/api/notifications', notificationsRouter);

// WebSocket setup
setupWebSocket(io);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server ready`);
});
```

#### 5. WebSocket Implementation

Create `src/websocket.ts`:

```typescript
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export function setupWebSocket(io: Server) {
  // Authentication middleware
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;

    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      socket.userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join user's personal room
    socket.join(`user:${socket.userId}`);

    // Handle friend events
    socket.on('friend:request', async (data) => {
      // Emit to target user
      io.to(`user:${data.friendUserId}`).emit('friend_request', data);
    });

    socket.on('friend:accept', async (data) => {
      io.to(`user:${data.userId}`).emit('friend_accepted', data);
    });

    // Handle group events
    socket.on('group:join', async (data) => {
      socket.join(`group:${data.groupId}`);
      io.to(`group:${data.groupId}`).emit('group_member_joined', data);
    });

    socket.on('group:leave', async (data) => {
      socket.leave(`group:${data.groupId}`);
      io.to(`group:${data.groupId}`).emit('group_member_left', data);
    });

    socket.on('group:message', async (data) => {
      io.to(`group:${data.groupId}`).emit('group_message', data);
    });

    // Handle study room events
    socket.on('room:join', async (data) => {
      socket.join(`room:${data.roomId}`);
      io.to(`room:${data.roomId}`).emit('room_participant_joined', data);
    });

    socket.on('room:leave', async (data) => {
      socket.leave(`room:${data.roomId}`);
      io.to(`room:${data.roomId}`).emit('room_participant_left', data);
    });

    socket.on('room:timer', async (data) => {
      io.to(`room:${data.roomId}`).emit('room_timer_updated', data);
    });

    socket.on('room:message', async (data) => {
      io.to(`room:${data.roomId}`).emit('room_message', data);
    });

    socket.on('room:invite', async (data) => {
      io.to(`user:${data.userId}`).emit('room_invitation', data);
    });

    // Handle presence
    socket.on('presence:update', async (data) => {
      // Broadcast to all friends
      socket.broadcast.emit('presence_updated', {
        userId: socket.userId,
        ...data,
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });

    // Heartbeat
    socket.on('ping', () => {
      socket.emit('pong');
    });
  });
}
```

### Option 2: Firebase Setup (Easier)

#### 1. Firebase Project Setup

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase project
firebase init

# Select: Firestore, Functions, Hosting
# Choose existing project or create new one
```

#### 2. Firebase Configuration

Add to `app.json`:

```json
{
  "expo": {
    "plugins": [
      "@react-native-firebase/app",
      "@react-native-firebase/auth",
      "@react-native-firebase/firestore",
      "@react-native-firebase/messaging"
    ]
  }
}
```

#### 3. Install Firebase Dependencies

```bash
expo install @react-native-firebase/app
expo install @react-native-firebase/auth
expo install @react-native-firebase/firestore
expo install @react-native-firebase/database
expo install @react-native-firebase/messaging
```

#### 4. Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    // Friends
    match /friends/{friendId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid in resource.data.userIds;
    }

    // Groups
    match /groups/{groupId} {
      allow read: if request.auth.uid in resource.data.memberIds || !resource.data.isPrivate;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.teacherId;
    }

    // Study Rooms
    match /studyRooms/{roomId} {
      allow read: if request.auth.uid in resource.data.participantIds || !resource.data.isPrivate;
      allow create: if request.auth != null;
      allow update: if request.auth.uid in resource.data.participantIds;
      allow delete: if request.auth.uid == resource.data.hostUserId;
    }
  }
}
```

## Frontend Integration

### 1. Update Environment Variables

Add to `.env`:

```env
# Backend API
EXPO_PUBLIC_API_URL=https://api.studentopia.com
EXPO_PUBLIC_WS_URL=wss://api.studentopia.com

# Or for Firebase
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# Expo
EXPO_PUBLIC_PROJECT_ID=your-expo-project-id
```

### 2. Initialize Services

Update `App.tsx`:

```typescript
import { useEffect } from 'react';
import useUserStore from './src/state/userStore';
import { realtimeService } from './src/services/realtimeService';
import { pushNotificationService } from './src/services/pushNotificationService';
import { setAuthToken } from './src/api/backend';

function App() {
  const user = useUserStore((s) => s.user);

  useEffect(() => {
    if (user) {
      // Initialize real-time sync
      realtimeService.connect(user.id);

      // Initialize push notifications
      pushNotificationService.initialize(user.id);

      // Set auth token
      setAuthToken(user.authToken || '');

      return () => {
        realtimeService.disconnect();
        pushNotificationService.cleanup();
      };
    }
  }, [user?.id]);

  return <NavigationContainer>{/* Your app */}</NavigationContainer>;
}
```

### 3. Example: Friend Store Integration

Update `src/state/friendStore.ts`:

```typescript
import { friendsApi } from '../api/backend';
import { realtimeService } from '../services/realtimeService';
import { pushNotificationService, notificationTemplates } from '../services/pushNotificationService';

// Subscribe to real-time friend events
realtimeService.on('friend_request', (data) => {
  // Update store with new friend request
  const store = useFriendStore.getState();
  store.addPendingRequest(data.friend);

  // Show local notification
  pushNotificationService.sendLocalNotification(
    notificationTemplates.friendRequest(data.friend.username).title,
    notificationTemplates.friendRequest(data.friend.username).body,
    notificationTemplates.friendRequest(data.friend.username).data
  );
});

// Update send friend request to use API
sendFriendRequest: async (userId, friendUserId) => {
  try {
    const friend = await friendsApi.sendFriendRequest(userId, friendUserId);
    set((state) => ({ friends: [...state.friends, friend] }));

    // Notify via real-time
    realtimeService.send('friend_request', { friend });

    return friend;
  } catch (error) {
    console.error('Failed to send friend request:', error);
    throw error;
  }
},
```

## Deployment

### Deploy Backend (Node.js)

#### Option 1: Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize
railway init

# Add PostgreSQL
railway add postgresql

# Deploy
railway up
```

#### Option 2: Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create studentopia-api

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Add Redis
heroku addons:create heroku-redis:hobby-dev

# Deploy
git push heroku main
```

#### Option 3: DigitalOcean/AWS/GCP

Use Docker for containerization:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Deploy Frontend (Expo)

```bash
# Build for production
eas build --platform all

# Submit to app stores
eas submit --platform ios
eas submit --platform android
```

## Testing

### Load Testing

```bash
# Install Artillery
npm install -g artillery

# Create test scenario
artillery quick --count 100 --num 50 https://api.studentopia.com/api/health

# WebSocket load test
artillery run websocket-test.yml
```

### End-to-End Testing

```bash
# Install Detox
npm install -g detox-cli

# Run E2E tests
detox test --configuration ios.sim.release
```

## Monitoring

### Application Monitoring

- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **DataDog**: Performance monitoring
- **New Relic**: APM

### Infrastructure Monitoring

- **Prometheus + Grafana**: Metrics
- **ELK Stack**: Logs
- **PagerDuty**: Alerting

## Security Checklist

- [ ] Enable HTTPS/WSS
- [ ] Implement JWT authentication
- [ ] Rate limiting on all endpoints
- [ ] Input validation and sanitization
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CORS configuration
- [ ] Helmet.js security headers
- [ ] Environment variables secured
- [ ] Database backups configured
- [ ] DDoS protection (Cloudflare)
- [ ] Regular security audits

## Cost Estimation

### Backend (Node.js on Railway/Heroku)

- Server: $20-50/month
- Database: $9-50/month
- Redis: $5-20/month
- Total: **$35-120/month**

### Firebase

- Free tier: 50K reads, 20K writes/day
- Paid: $25-100/month for 1M operations

### Push Notifications

- Expo: Free up to 600/hour
- FCM: Free
- APNs: Free

### Total Estimated Cost

- Small (100-1000 users): **$50-150/month**
- Medium (1K-10K users): **$150-500/month**
- Large (10K+ users): **$500-2000/month**

## Performance Optimization

1. **Database Indexes**: Add indexes on frequently queried fields
2. **Redis Caching**: Cache user sessions, friend lists
3. **CDN**: Use Cloudflare for static assets
4. **Connection Pooling**: Limit database connections
5. **Message Queuing**: Use Bull/RabbitMQ for async tasks
6. **Load Balancing**: Multiple server instances
7. **WebSocket Scaling**: Use Redis adapter for Socket.io

## Support

For issues or questions:
- GitHub Issues: https://github.com/yourusername/studentopia
- Email: support@studentopia.com
- Documentation: https://docs.studentopia.com

---

**Last Updated**: 2025-11-08
**Version**: 1.0.0
