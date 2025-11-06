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
