/**
 * SESSION MANAGEMENT SERVICE
 * 
 * Tracks active user sessions across devices
 * Allows users to see and manage their active sessions
 * Implements "logout from all devices" functionality
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import * as Device from "expo-device";
import * as Crypto from "expo-crypto";

export interface Session {
  sessionId: string;
  deviceId: string;
  deviceName: string;
  platform: string;
  createdAt: number;
  lastActive: number;
  ipAddress?: string;
}

class SessionService {
  private currentSessionId: string | null = null;
  private deviceId: string | null = null;

  /**
   * Initialize session service and get/create device ID
   */
  async initialize(): Promise<string> {
    if (this.deviceId) return this.deviceId;

    // Get or create device ID
    let deviceId: string | null = null;
    try {
      deviceId = await SecureStore.getItemAsync("device_id");
    } catch {
      deviceId = await AsyncStorage.getItem("device_id");
    }

    if (!deviceId) {
      // Generate unique device ID
      const bytes = await Crypto.getRandomBytesAsync(16);
      deviceId = Array.from(bytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      try {
        await SecureStore.setItemAsync("device_id", deviceId);
      } catch {
        await AsyncStorage.setItem("device_id", deviceId);
      }
    }

    this.deviceId = deviceId;
    return deviceId;
  }

  /**
   * Create a new session for a user
   */
  async createSession(userId: string): Promise<Session> {
    const deviceId = await this.initialize();
    
    // Generate session ID
    const sessionBytes = await Crypto.getRandomBytesAsync(16);
    const sessionId = Array.from(sessionBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const deviceName = Device.modelName || Device.deviceName || "Unknown Device";
    const platform = Device.osName || "Unknown";

    const session: Session = {
      sessionId,
      deviceId,
      deviceName,
      platform,
      createdAt: Date.now(),
      lastActive: Date.now(),
    };

    // Store current session ID
    this.currentSessionId = sessionId;
    try {
      await SecureStore.setItemAsync("current_session_id", sessionId);
    } catch {
      await AsyncStorage.setItem("current_session_id", sessionId);
    }

    // Add to user's sessions
    await this.addUserSession(userId, session);

    return session;
  }

  /**
   * Get current session ID
   */
  async getCurrentSessionId(): Promise<string | null> {
    if (this.currentSessionId) return this.currentSessionId;

    try {
      this.currentSessionId = await SecureStore.getItemAsync("current_session_id");
    } catch {
      this.currentSessionId = await AsyncStorage.getItem("current_session_id");
    }

    return this.currentSessionId;
  }

  /**
   * Update session last active timestamp
   */
  async updateLastActive(userId: string): Promise<void> {
    const sessionId = await this.getCurrentSessionId();
    if (!sessionId) return;

    const sessions = await this.getUserSessions(userId);
    const session = sessions.find(s => s.sessionId === sessionId);
    
    if (session) {
      session.lastActive = Date.now();
      await this.saveUserSessions(userId, sessions);
    }
  }

  /**
   * Get all sessions for a user
   */
  async getUserSessions(userId: string): Promise<Session[]> {
    try {
      let sessionsData: string | null = null;
      try {
        sessionsData = await SecureStore.getItemAsync(`sessions_${userId}`);
      } catch {
        sessionsData = await AsyncStorage.getItem(`sessions_${userId}`);
      }

      if (!sessionsData) return [];
      return JSON.parse(sessionsData);
    } catch {
      return [];
    }
  }

  /**
   * Add session to user's session list
   */
  private async addUserSession(userId: string, session: Session): Promise<void> {
    const sessions = await this.getUserSessions(userId);
    
    // Remove old sessions (older than 90 days)
    const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);
    const activeSessions = sessions.filter(s => s.createdAt > ninetyDaysAgo);
    
    // Add new session
    activeSessions.push(session);
    
    await this.saveUserSessions(userId, activeSessions);
  }

  /**
   * Save user sessions
   */
  private async saveUserSessions(userId: string, sessions: Session[]): Promise<void> {
    const sessionsStr = JSON.stringify(sessions);
    try {
      await SecureStore.setItemAsync(`sessions_${userId}`, sessionsStr);
    } catch {
      await AsyncStorage.setItem(`sessions_${userId}`, sessionsStr);
    }
  }

  /**
   * Revoke a specific session
   */
  async revokeSession(userId: string, sessionId: string): Promise<boolean> {
    const sessions = await this.getUserSessions(userId);
    const filtered = sessions.filter(s => s.sessionId !== sessionId);
    
    if (filtered.length === sessions.length) {
      return false; // Session not found
    }

    await this.saveUserSessions(userId, filtered);

    // If revoking current session, clear it
    const currentSessionId = await this.getCurrentSessionId();
    if (currentSessionId === sessionId) {
      this.currentSessionId = null;
      try {
        await SecureStore.deleteItemAsync("current_session_id");
      } catch {
        await AsyncStorage.removeItem("current_session_id");
      }
    }

    return true;
  }

  /**
   * Revoke all sessions except current
   */
  async revokeAllOtherSessions(userId: string): Promise<number> {
    const currentSessionId = await this.getCurrentSessionId();
    if (!currentSessionId) return 0;

    const sessions = await this.getUserSessions(userId);
    const currentSession = sessions.find(s => s.sessionId === currentSessionId);
    
    await this.saveUserSessions(userId, currentSession ? [currentSession] : []);

    return sessions.length - (currentSession ? 1 : 0);
  }

  /**
   * Revoke all sessions (logout from all devices)
   */
  async revokeAllSessions(userId: string): Promise<void> {
    await this.saveUserSessions(userId, []);
    
    this.currentSessionId = null;
    try {
      await SecureStore.deleteItemAsync("current_session_id");
    } catch {
      await AsyncStorage.removeItem("current_session_id");
    }
  }

  /**
   * Check if session is valid
   */
  async isSessionValid(userId: string, sessionId: string): Promise<boolean> {
    const sessions = await this.getUserSessions(userId);
    const session = sessions.find(s => s.sessionId === sessionId);
    
    if (!session) return false;

    // Check if session is expired (90 days)
    const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);
    if (session.createdAt < ninetyDaysAgo) {
      // Remove expired session
      await this.revokeSession(userId, sessionId);
      return false;
    }

    return true;
  }

  /**
   * Get device ID
   */
  async getDeviceId(): Promise<string> {
    return await this.initialize();
  }
}

export const sessionService = new SessionService();
export default sessionService;

