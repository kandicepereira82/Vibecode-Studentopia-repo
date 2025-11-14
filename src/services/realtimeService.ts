/**
 * REAL-TIME SYNCHRONIZATION SERVICE
 *
 * WebSocket-based real-time updates for:
 * - Friend requests and status
 * - Group updates and messages
 * - Live session timer and participants
 * - User presence and activity
 *
 * Alternative: Can be replaced with Firebase Realtime Database or Firestore
 */

import { getAuthToken } from "../api/backend";

const WS_URL = process.env.EXPO_PUBLIC_WS_URL || "ws://localhost:3000";

// Event types
export type RealtimeEvent =
  | "connected"
  | "friend_request"
  | "friend_accepted"
  | "friend_online"
  | "friend_offline"
  | "group_updated"
  | "group_message"
  | "group_member_joined"
  | "group_member_left"
  | "room_created"
  | "room_updated"
  | "room_participant_joined"
  | "room_participant_left"
  | "room_timer_updated"
  | "room_message"
  | "room_invitation"
  | "presence_updated"
  | "activity_posted";

export interface RealtimeMessage {
  type: RealtimeEvent;
  data: any;
  timestamp: string;
  userId?: string;
}

type EventCallback = (data: any) => void;

class RealtimeSyncService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectTimeoutId: NodeJS.Timeout | null = null;
  private connectionTimeout: NodeJS.Timeout | null = null;
  private listeners: Map<RealtimeEvent, Set<EventCallback>> = new Map();
  private isConnecting = false;
  private userId: string | null = null;

  /**
   * Initialize and connect to WebSocket server
   */
  async connect(userId: string): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log("WebSocket already connected");
      return;
    }

    if (this.isConnecting) {
      console.log("WebSocket connection in progress");
      return;
    }

    this.userId = userId;
    this.isConnecting = true;

    try {
      const token = await getAuthToken();
      const url = `${WS_URL}?userId=${userId}&token=${token}`;

      this.ws = new WebSocket(url);

      // Set connection timeout (10 seconds)
      this.connectionTimeout = setTimeout(() => {
        if (this.ws?.readyState === WebSocket.CONNECTING) {
          console.warn("WebSocket connection timeout");
          this.ws.close();
          this.isConnecting = false;
          this.attemptReconnect();
        }
      }, 10000);

      this.ws.onopen = () => {
        console.log("WebSocket connected");
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
          this.connectionTimeout = null;
        }
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        this.startHeartbeat();

        // Notify listeners
        this.emit("connected", { userId });
      };

      this.ws.onmessage = (event) => {
        try {
          const message: RealtimeMessage = JSON.parse(event.data);
          console.log("WebSocket message:", message.type, message.data);
          this.handleMessage(message);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
          this.connectionTimeout = null;
        }
        this.isConnecting = false;
      };

      this.ws.onclose = () => {
        console.log("WebSocket disconnected");
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
          this.connectionTimeout = null;
        }
        this.isConnecting = false;
        this.stopHeartbeat();
        this.attemptReconnect();
      };
    } catch (error) {
      console.error("Failed to connect WebSocket:", error);
      this.isConnecting = false;
      this.attemptReconnect();
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.stopHeartbeat();
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent reconnect
  }

  /**
   * Subscribe to real-time events
   */
  on(event: RealtimeEvent, callback: EventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  /**
   * Emit event to all listeners
   */
  private emit(event: RealtimeEvent, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  /**
   * Handle incoming WebSocket message
   */
  private handleMessage(message: RealtimeMessage): void {
    this.emit(message.type, message.data);
  }

  /**
   * Send message through WebSocket
   */
  send(type: RealtimeEvent, data: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const message: RealtimeMessage = {
        type,
        data,
        timestamp: new Date().toISOString(),
        userId: this.userId || undefined,
      };
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket not connected. Cannot send message:", type);
    }
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(): void {
    if (
      this.reconnectAttempts >= this.maxReconnectAttempts ||
      !this.userId
    ) {
      console.log("Max reconnect attempts reached or no userId");
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(
      `Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );

    this.reconnectTimeoutId = setTimeout(() => {
      this.reconnectTimeoutId = null;
      if (this.userId) {
        this.connect(this.userId);
      }
    }, delay);
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: "ping" }));
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Get connection state
   */
  getState(): "connecting" | "open" | "closing" | "closed" {
    switch (this.ws?.readyState) {
      case WebSocket.CONNECTING:
        return "connecting";
      case WebSocket.OPEN:
        return "open";
      case WebSocket.CLOSING:
        return "closing";
      case WebSocket.CLOSED:
      default:
        return "closed";
    }
  }
}

// Singleton instance
export const realtimeService = new RealtimeSyncService();

// =============================================================================
// FIREBASE ALTERNATIVE
// =============================================================================

/**
 * Alternative implementation using Firebase Realtime Database
 * Uncomment and configure if you prefer Firebase over WebSocket
 */

/*
import { getDatabase, ref, onValue, set, push, off } from "firebase/database";

class FirebaseRealtimeService {
  private db: any;
  private listeners: Map<string, any> = new Map();

  connect(userId: string): void {
    this.db = getDatabase();
  }

  on(event: RealtimeEvent, callback: EventCallback): () => void {
    const eventRef = ref(this.db, `events/${event}`);
    const listener = onValue(eventRef, (snapshot) => {
      const data = snapshot.val();
      if (data) callback(data);
    });

    this.listeners.set(event, listener);

    return () => {
      off(eventRef);
      this.listeners.delete(event);
    };
  }

  send(type: RealtimeEvent, data: any): void {
    const eventRef = ref(this.db, `events/${type}`);
    push(eventRef, {
      ...data,
      timestamp: Date.now(),
    });
  }

  disconnect(): void {
    this.listeners.forEach((listener, event) => {
      const eventRef = ref(this.db, `events/${event}`);
      off(eventRef);
    });
    this.listeners.clear();
  }
}

export const realtimeService = new FirebaseRealtimeService();
*/

export default realtimeService;
