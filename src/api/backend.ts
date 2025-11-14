/**
 * BACKEND API SERVICE
 *
 * Production-ready backend integration for Studentopia
 * Handles Friends, Groups, and Live Sessions with real-time sync
 *
 * Setup:
 * 1. Add your backend API URL to .env:
 *    EXPO_PUBLIC_API_URL=https://api.studentopia.com
 * 2. Configure authentication token storage
 * 3. Set up WebSocket/Firebase for real-time updates
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Friend, Group, StudyRoom, User } from "../types";

// API Configuration
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";

// SECURITY FIX: Token expiration and refresh mechanism
interface TokenData {
  token: string;
  refreshToken?: string;
  expiresAt: number;
}

// Auth token management
let authToken: string | null = null;

// SECURITY FIX: Use SecureStore for sensitive token data
export const setAuthToken = async (token: string, expiresInSeconds: number = 3600) => {
  authToken = token;
  const tokenData: TokenData = {
    token,
    expiresAt: Date.now() + (expiresInSeconds * 1000),
  };
  
  try {
    await SecureStore.setItemAsync("auth_token", JSON.stringify(tokenData));
  } catch (error) {
    console.error("Failed to store auth token securely:", error);
    // Fallback to AsyncStorage if SecureStore fails (e.g., on web)
    await AsyncStorage.setItem("auth_token", JSON.stringify(tokenData));
  }
};

export const getAuthToken = async (): Promise<string | null> => {
  if (authToken) return authToken;
  
  try {
    // Try SecureStore first
    let tokenDataStr: string | null = null;
    try {
      tokenDataStr = await SecureStore.getItemAsync("auth_token");
    } catch {
      // Fallback to AsyncStorage if SecureStore not available
      tokenDataStr = await AsyncStorage.getItem("auth_token");
    }
    
    if (!tokenDataStr) return null;
    
    const tokenData: TokenData = JSON.parse(tokenDataStr);
    
    // SECURITY FIX: Check token expiration
    if (Date.now() >= tokenData.expiresAt) {
      console.warn("Auth token expired");
      await clearAuthToken();
      return null;
    }
    
    authToken = tokenData.token;
    return authToken;
  } catch (error) {
    console.error("Failed to retrieve auth token:", error);
    return null;
  }
};

export const clearAuthToken = async () => {
  authToken = null;
  try {
    await SecureStore.deleteItemAsync("auth_token");
  } catch {
    await AsyncStorage.removeItem("auth_token");
  }
};

// Generic API request helper with timeout and better error handling
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  timeout: number = 15000
): Promise<T> {
  const token = await getAuthToken();

  // Ensure critical headers aren't overridden by user-provided headers
  const headers: HeadersInit = {
    ...options.headers,
    "Content-Type": "application/json", // Always set
    ...(token ? { Authorization: `Bearer ${token}` } : {}), // Always set if token exists
  };

  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let error: any = {};
      try {
        const text = await response.text();
        error = text ? JSON.parse(text) : {};
      } catch {
        error = { message: `HTTP ${response.status}: ${response.statusText}` };
      }
      throw new Error(error.message || `API Error: ${response.status}`);
    }

    // Read response as text first, then parse as JSON
    // This allows us to provide better error messages if JSON parsing fails
    try {
      const text = await response.text();
      if (!text) {
        throw new Error("Empty response body");
      }
      return JSON.parse(text) as T;
    } catch (jsonError: any) {
      // If JSON parsing fails, provide the text in error message for debugging
      const errorMessage = jsonError.message || "Invalid JSON response";
      throw new Error(`${errorMessage}. Response: ${jsonError.message?.includes("Empty") ? "empty" : "non-JSON"}`);
    }
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    // Handle timeout errors
    if (error.name === 'AbortError') {
      const timeoutError = new Error("Request timeout - please check your connection");
      timeoutError.name = 'TimeoutError';
      console.error(`API Request timeout: ${endpoint}`);
      throw timeoutError;
    }
    
    // Handle network/connection errors
    if (
      error.message?.includes('network') ||
      error.message?.includes('fetch') ||
      error.message?.includes('Failed to fetch') ||
      error.message?.includes('NetworkError') ||
      error.message?.includes('ECONNREFUSED') ||
      error.message?.includes('ETIMEDOUT') ||
      error.message?.includes('ENOTFOUND')
    ) {
      const networkError = new Error("Network error - please check your internet connection");
      networkError.name = 'NetworkError';
      console.error(`API Network error: ${endpoint}`, error);
      throw networkError;
    }
    
    console.error(`API Request failed: ${endpoint}`, error);
    throw error;
  }
}

// =============================================================================
// FRIENDS API
// =============================================================================

export const friendsApi = {
  /**
   * Search for users by email or username
   */
  searchUsers: async (query: string): Promise<User[]> => {
    return apiRequest<User[]>(`/users/search?q=${encodeURIComponent(query)}`);
  },

  /**
   * Get user's friends list
   */
  getFriends: async (userId: string): Promise<Friend[]> => {
    return apiRequest<Friend[]>(`/friends/${userId}`);
  },

  /**
   * Get pending friend requests
   */
  getPendingRequests: async (userId: string): Promise<Friend[]> => {
    return apiRequest<Friend[]>(`/friends/${userId}/requests/pending`);
  },

  /**
   * Get sent friend requests
   */
  getSentRequests: async (userId: string): Promise<Friend[]> => {
    return apiRequest<Friend[]>(`/friends/${userId}/requests/sent`);
  },

  /**
   * Send friend request
   */
  sendFriendRequest: async (
    userId: string,
    friendUserId: string
  ): Promise<Friend> => {
    return apiRequest<Friend>(`/friends/request`, {
      method: "POST",
      body: JSON.stringify({ userId, friendUserId }),
    });
  },

  /**
   * Accept friend request
   */
  acceptFriendRequest: async (friendId: string): Promise<Friend> => {
    return apiRequest<Friend>(`/friends/${friendId}/accept`, {
      method: "PUT",
    });
  },

  /**
   * Reject friend request
   */
  rejectFriendRequest: async (friendId: string): Promise<void> => {
    return apiRequest<void>(`/friends/${friendId}/reject`, {
      method: "PUT",
    });
  },

  /**
   * Remove friend
   */
  removeFriend: async (friendId: string): Promise<void> => {
    return apiRequest<void>(`/friends/${friendId}`, {
      method: "DELETE",
    });
  },
};

// =============================================================================
// GROUPS API
// =============================================================================

export const groupsApi = {
  /**
   * Get user's groups
   */
  getUserGroups: async (userId: string): Promise<Group[]> => {
    return apiRequest<Group[]>(`/groups/user/${userId}`);
  },

  /**
   * Get public groups
   */
  getPublicGroups: async (): Promise<Group[]> => {
    return apiRequest<Group[]>(`/groups/public`);
  },

  /**
   * Get group by ID
   */
  getGroup: async (groupId: string): Promise<Group> => {
    return apiRequest<Group>(`/groups/${groupId}`);
  },

  /**
   * Create new group
   */
  createGroup: async (groupData: {
    name: string;
    description: string;
    isPrivate: boolean;
    teacherEmail: string;
    teacherName: string;
    schoolName?: string;
    className?: string;
  }): Promise<Group> => {
    return apiRequest<Group>(`/groups`, {
      method: "POST",
      body: JSON.stringify(groupData),
    });
  },

  /**
   * Join group with code
   */
  joinGroup: async (groupCode: string, userId: string): Promise<Group> => {
    return apiRequest<Group>(`/groups/join`, {
      method: "POST",
      body: JSON.stringify({ groupCode, userId }),
    });
  },

  /**
   * Leave group
   */
  leaveGroup: async (groupId: string, userId: string): Promise<void> => {
    return apiRequest<void>(`/groups/${groupId}/members/${userId}`, {
      method: "DELETE",
    });
  },

  /**
   * Update group
   */
  updateGroup: async (
    groupId: string,
    updates: Partial<Group>
  ): Promise<Group> => {
    return apiRequest<Group>(`/groups/${groupId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },

  /**
   * Delete group
   */
  deleteGroup: async (groupId: string): Promise<void> => {
    return apiRequest<void>(`/groups/${groupId}`, {
      method: "DELETE",
    });
  },

  /**
   * Invite member to group
   */
  inviteMember: async (
    groupId: string,
    email: string
  ): Promise<{ success: boolean }> => {
    return apiRequest<{ success: boolean }>(`/groups/${groupId}/invite`, {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  /**
   * Get group analytics
   */
  getGroupAnalytics: async (groupId: string): Promise<any> => {
    return apiRequest<any>(`/groups/${groupId}/analytics`);
  },
};

// =============================================================================
// LIVE SESSIONS (STUDY ROOMS) API
// =============================================================================

export const studyRoomsApi = {
  /**
   * Get public study rooms
   */
  getPublicRooms: async (): Promise<StudyRoom[]> => {
    return apiRequest<StudyRoom[]>(`/study-rooms/public`);
  },

  /**
   * Get user's active rooms
   */
  getUserRooms: async (userId: string): Promise<StudyRoom[]> => {
    return apiRequest<StudyRoom[]>(`/study-rooms/user/${userId}`);
  },

  /**
   * Get invited rooms
   */
  getInvitedRooms: async (userId: string): Promise<StudyRoom[]> => {
    return apiRequest<StudyRoom[]>(`/study-rooms/invited/${userId}`);
  },

  /**
   * Create new study room
   */
  createRoom: async (roomData: {
    name: string;
    hostUserId: string;
    hostUsername: string;
    isPrivate: boolean;
    maxParticipants?: number;
  }): Promise<StudyRoom> => {
    return apiRequest<StudyRoom>(`/study-rooms`, {
      method: "POST",
      body: JSON.stringify(roomData),
    });
  },

  /**
   * Join study room
   */
  joinRoom: async (roomId: string, userId: string, username: string): Promise<StudyRoom> => {
    return apiRequest<StudyRoom>(`/study-rooms/${roomId}/join`, {
      method: "POST",
      body: JSON.stringify({ userId, username }),
    });
  },

  /**
   * Leave study room
   */
  leaveRoom: async (roomId: string, userId: string): Promise<void> => {
    return apiRequest<void>(`/study-rooms/${roomId}/leave`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
  },

  /**
   * Invite friend to room
   */
  inviteFriend: async (
    roomId: string,
    friendUserId: string
  ): Promise<{ success: boolean }> => {
    return apiRequest<{ success: boolean }>(`/study-rooms/${roomId}/invite`, {
      method: "POST",
      body: JSON.stringify({ friendUserId }),
    });
  },

  /**
   * Update timer state (host only)
   */
  updateTimer: async (
    roomId: string,
    timerState: {
      running: boolean;
      mode: "study" | "break";
      minutes: number;
      seconds: number;
    }
  ): Promise<StudyRoom> => {
    return apiRequest<StudyRoom>(`/study-rooms/${roomId}/timer`, {
      method: "PUT",
      body: JSON.stringify(timerState),
    });
  },

  /**
   * Send chat message
   */
  sendMessage: async (
    roomId: string,
    userId: string,
    username: string,
    content: string
  ): Promise<{ success: boolean; messageId: string }> => {
    return apiRequest<{ success: boolean; messageId: string }>(
      `/study-rooms/${roomId}/messages`,
      {
        method: "POST",
        body: JSON.stringify({ userId, username, content }),
      }
    );
  },

  /**
   * Get room messages
   */
  getMessages: async (roomId: string, limit: number = 50): Promise<any[]> => {
    return apiRequest<any[]>(`/study-rooms/${roomId}/messages?limit=${limit}`);
  },
};

// =============================================================================
// ACTIVITY FEED API
// =============================================================================

export const activityApi = {
  /**
   * Get user's activity feed
   */
  getActivityFeed: async (
    userId: string,
    limit: number = 20
  ): Promise<any[]> => {
    return apiRequest<any[]>(`/activity/${userId}?limit=${limit}`);
  },

  /**
   * Get friend activity feed
   */
  getFriendActivity: async (
    userId: string,
    limit: number = 20
  ): Promise<any[]> => {
    return apiRequest<any[]>(`/activity/${userId}/friends?limit=${limit}`);
  },

  /**
   * Post activity
   */
  postActivity: async (activity: {
    userId: string;
    type: string;
    description: string;
    metadata?: any;
  }): Promise<{ success: boolean }> => {
    return apiRequest<{ success: boolean }>(`/activity`, {
      method: "POST",
      body: JSON.stringify(activity),
    });
  },
};

// =============================================================================
// USER PRESENCE API
// =============================================================================

export const presenceApi = {
  /**
   * Update user presence
   */
  updatePresence: async (
    userId: string,
    status: "online" | "studying" | "break" | "offline",
    currentActivity?: string
  ): Promise<{ success: boolean }> => {
    return apiRequest<{ success: boolean }>(`/presence/${userId}`, {
      method: "PUT",
      body: JSON.stringify({ status, currentActivity }),
    });
  },

  /**
   * Get friend presences
   */
  getFriendPresences: async (userId: string): Promise<any[]> => {
    return apiRequest<any[]>(`/presence/${userId}/friends`);
  },
};

// =============================================================================
// NOTIFICATIONS API
// =============================================================================

export const notificationsApi = {
  /**
   * Register device for push notifications
   */
  registerDevice: async (
    userId: string,
    deviceToken: string,
    platform: "ios" | "android"
  ): Promise<{ success: boolean }> => {
    return apiRequest<{ success: boolean }>(`/notifications/register`, {
      method: "POST",
      body: JSON.stringify({ userId, deviceToken, platform }),
    });
  },

  /**
   * Send push notification
   */
  sendNotification: async (notification: {
    userId: string;
    title: string;
    body: string;
    data?: any;
  }): Promise<{ success: boolean }> => {
    return apiRequest<{ success: boolean }>(`/notifications/send`, {
      method: "POST",
      body: JSON.stringify(notification),
    });
  },

  /**
   * Get user notifications
   */
  getNotifications: async (
    userId: string,
    limit: number = 50
  ): Promise<any[]> => {
    return apiRequest<any[]>(`/notifications/${userId}?limit=${limit}`);
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (notificationId: string): Promise<void> => {
    return apiRequest<void>(`/notifications/${notificationId}/read`, {
      method: "PUT",
    });
  },
};

// =============================================================================
// ERROR HANDLING
// =============================================================================

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public data?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// =============================================================================
// HEALTH CHECK
// =============================================================================

export const healthCheck = async (): Promise<{
  status: string;
  timestamp: string;
}> => {
  try {
    return await apiRequest<{ status: string; timestamp: string }>("/health");
  } catch {
    return { status: "offline", timestamp: new Date().toISOString() };
  }
};

export default {
  friendsApi,
  groupsApi,
  studyRoomsApi,
  activityApi,
  presenceApi,
  notificationsApi,
  setAuthToken,
  getAuthToken,
  clearAuthToken,
  healthCheck,
};
