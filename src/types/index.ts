// Core type definitions for StudyPal app

export type TaskCategory = "homework" | "project" | "exam" | "other";
export type TaskStatus = "pending" | "completed";
export type UserRole = "student" | "teacher";
export type Language =
  | "en"  // English
  | "es"  // Spanish
  | "fr"  // French
  | "de"  // German
  | "zh"  // Simplified Chinese (Mandarin)
  | "ja"  // Japanese
  | "ar"  // Arabic
  | "ko"  // Korean
  | "pt"  // Portuguese (Brazilian)
  | "hi"  // Hindi
  | "it"  // Italian
  | "tr"  // Turkish
  | "ru"  // Russian
  | "id"; // Indonesian
export type StudyPalAnimal =
  | "cat"
  | "redpanda"
  | "owl"
  | "penguin"
  | "horse"
  | "dog"
  | "chick"
  | "bear"
  | "hedgehog"
  | "tiger"
  | "turtle"
  | "bunny"
  | "giraffe"
  | "pig"
  | "alpaca"
  | "lion"
  | "frog"
  | "koala"
  | "sloth"
  | "monkey"
  | "hamster"
  | "reindeer"
  | "chipmunk"
  | "elephant"
  | "goldfish";
export type StudyPalMood = "happy" | "focused" | "celebrating" | "relaxed" | "neutral";
export type TimerMode = "study" | "break";
export type AIChatMode = "chat" | "grammar";
export type ThemeColor =
  | "nature"
  | "ocean"
  | "galaxy"
  | "rainbow"
  | "sunset"
  | "arctic"
  | "golden"
  | "cherry";

export interface Task {
  id: string;
  userId: string;
  groupId?: string;
  title: string;
  description: string;
  category: TaskCategory;
  dueDate: Date;
  reminder?: Date;
  reminderSound?: string;
  status: TaskStatus;
  createdAt: Date;
  completedAt?: Date;
  assignedBy?: string; // teacher userId if assigned
}

export interface User {
  id: string;
  username: string;
  email?: string;
  role: UserRole;
  language: Language;
  themeColor: ThemeColor;
  studyPalConfig: StudyPalConfig;
  notificationEnabled: boolean;
  notificationSound: boolean; // Sound enabled for notifications
  notificationVibration: boolean; // Vibration enabled for notifications
  mindfulnessBreakEnabled: boolean; // Mindfulness break reminders after focus sessions
  dailyReminderTime?: { hour: number; minute: number }; // Daily study reminder time (24-hour format)
  createdAt: Date;
}

export interface StudyPalConfig {
  name: string;
  animal: StudyPalAnimal;
  animationsEnabled: boolean;
  mood?: StudyPalMood;
  avatar?: AvatarCustomization;
}

export interface AvatarCustomization {
  hairStyle?: string;
  hairColor?: string;
  furColor?: string;
  outfit?: string;
  accessory?: string;
  glasses?: boolean;
  headphones?: boolean;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  teacherId: string;
  studentIds: string[];
  shareCode: string;
  school?: string;
  className?: string;
  teacherEmail?: string;
  createdAt: Date;
}

export interface StudySession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  studyDuration: number; // minutes
  breakDuration: number; // minutes
  completed: boolean;
}

// Social & Collaboration Types
export type FriendRequestStatus = "pending" | "accepted" | "rejected";
export type UserPresenceStatus = "online" | "offline" | "studying" | "break";
export type ActivityType = "task_completed" | "achievement_unlocked" | "streak_milestone" | "friend_added";

export interface Friend {
  id: string;
  userId: string; // Current user's ID
  friendUserId: string; // Friend's user ID
  friendUsername: string;
  friendEmail?: string;
  friendAnimal: StudyPalAnimal;
  friendTheme: ThemeColor;
  status: FriendRequestStatus;
  requestedBy: string; // Who sent the friend request
  createdAt: Date;
  acceptedAt?: Date;
}

export interface UserPresence {
  userId: string;
  username: string;
  status: UserPresenceStatus;
  lastSeen: Date;
  currentActivity?: string; // e.g., "Studying Math" or "On break"
  studyRoomId?: string; // If in a study room
}

export interface StudyRoom {
  id: string;
  name: string;
  hostUserId: string;
  hostUsername: string;
  participantIds: string[]; // All user IDs in the room
  participants: StudyRoomParticipant[];
  isPrivate: boolean; // If true, only invited friends can join
  invitedFriendIds: string[]; // Friend IDs who are invited
  timerRunning: boolean;
  timerMode: TimerMode;
  timerMinutes: number;
  timerSeconds: number;
  timerStartedAt?: Date;
  createdAt: Date;
  maxParticipants: number; // Default 10
}

export interface StudyRoomParticipant {
  userId: string;
  username: string;
  animal: StudyPalAnimal;
  joinedAt: Date;
  isHost: boolean;
}

export interface ChatMessage {
  id: string;
  studyRoomId: string;
  userId: string;
  username: string;
  content: string;
  timestamp: Date;
  type: "text" | "system"; // system for "User joined", "Timer started", etc.
}

export interface ActivityFeedItem {
  id: string;
  userId: string;
  username: string;
  animal: StudyPalAnimal;
  type: ActivityType;
  description: string;
  metadata?: {
    taskTitle?: string;
    achievementName?: string;
    streakCount?: number;
    friendUsername?: string;
  };
  timestamp: Date;
  isVisible: boolean; // User can hide items
}

export interface AIChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface MotivationalQuote {
  id: string;
  text: string;
  author: string;
  language: Language;
}

export interface StudyTip {
  id: string;
  title: string;
  description: string;
  category: string;
  language: Language;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
}

export interface UserStats {
  userId: string;
  totalTasksCompleted: number;
  currentStreak: number;
  longestStreak: number;
  totalStudyMinutes: number;
  achievements: Achievement[];
}
