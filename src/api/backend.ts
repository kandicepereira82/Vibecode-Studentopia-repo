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
import { Friend, Group, StudyRoom, User } from "../types";

// API Configuration
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";

// Auth token management
let authToken: string | null = null;

export const setAuthToken = async (token: string) => {
  authToken = token;
  await AsyncStorage.setItem("auth_token", token);
};

export const getAuthToken = async (): Promise<string | null> => {
  if (authToken) return authToken;
  authToken = await AsyncStorage.getItem("auth_token");
  return authToken;
};

export const clearAuthToken = async () => {
  authToken = null;
  await AsyncStorage.removeItem("auth_token");
};

// Generic API request helper
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
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
