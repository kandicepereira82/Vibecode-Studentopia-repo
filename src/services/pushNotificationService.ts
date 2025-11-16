/**
 * PUSH NOTIFICATION SERVICE
 *
 * Handles push notifications for:
 * - Friend requests
 * - Group invitations
 * - Live session invites
 * - Task reminders
 * - Activity updates
 *
 * Uses Expo Notifications API
 * For production, integrate with Firebase Cloud Messaging (FCM) or Apple Push Notification service (APNs)
 */

import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { notificationsApi } from "../api/backend";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationData {
  type:
    | "friend_request"
    | "friend_accepted"
    | "group_invite"
    | "room_invite"
    | "task_reminder"
    | "activity_update";
  targetId?: string; // Friend ID, Group ID, Room ID, etc.
  actionUrl?: string;
  [key: string]: any;
}

class PushNotificationService {
  private expoPushToken: string | null = null;
  private notificationListener: any = null;
  private responseListener: any = null;

  /**
   * Initialize push notifications
   */
  async initialize(userId: string): Promise<string | null> {
    // Check if device supports push notifications
    if (!Device.isDevice) {
      console.warn("Push notifications are only supported on physical devices");
      return null;
    }

    try {
      // Request permissions
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.warn("Push notification permissions not granted");
        return null;
      }

      // Get push token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_PROJECT_ID, // Your Expo project ID
      });

      this.expoPushToken = tokenData.data;
      console.log("Expo Push Token:", this.expoPushToken);

      // Register device with backend
      await this.registerDevice(userId);

      // Set up notification listeners
      this.setupListeners();

      // Configure Android notification channel
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "Default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }

      return this.expoPushToken;
    } catch (error) {
      console.error("Failed to initialize push notifications:", error);
      return null;
    }
  }

  /**
   * Register device token with backend
   */
  private async registerDevice(userId: string): Promise<void> {
    if (!this.expoPushToken) return;

    try {
      await notificationsApi.registerDevice(
        userId,
        this.expoPushToken,
        Platform.OS as "ios" | "android"
      );
      console.log("Device registered for push notifications");
    } catch (error) {
      console.error("Failed to register device:", error);
    }
  }

  /**
   * Set up notification listeners
   */
  private setupListeners(): void {
    // Handle notification received while app is foregrounded
    this.notificationListener =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Notification received:", notification);
        // You can handle foreground notifications here
      });

    // Handle user tapping on notification
    this.responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification tapped:", response);
        const data = response.notification.request.content
          .data as NotificationData;
        this.handleNotificationTap(data);
      });
  }

  /**
   * Handle notification tap
   */
  private handleNotificationTap(data: NotificationData): void {
    // Navigate to appropriate screen based on notification type
    switch (data.type) {
      case "friend_request":
        // Navigate to Friends screen > Requests tab
        console.log("Navigate to friend requests");
        break;
      case "group_invite":
        // Navigate to Groups screen
        console.log("Navigate to groups");
        break;
      case "room_invite":
        // Navigate to Live Sessions screen
        console.log("Navigate to live sessions");
        break;
      case "task_reminder":
        // Navigate to Tasks screen
        console.log("Navigate to tasks");
        break;
      default:
        console.log("Unknown notification type:", data.type);
    }
  }

  /**
   * Send local notification (for testing or offline notifications)
   */
  async sendLocalNotification(
    title: string,
    body: string,
    data?: NotificationData
  ): Promise<string> {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: true,
      },
      trigger: null, // Show immediately
    });
  }

  /**
   * Schedule notification for later
   */
  async scheduleNotification(
    title: string,
    body: string,
    triggerDate: Date,
    data?: NotificationData
  ): Promise<string> {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      } as Notifications.DateTriggerInput,
    });
  }

  /**
   * Cancel scheduled notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  /**
   * Cancel all notifications
   */
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Get badge count
   */
  async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  }

  /**
   * Set badge count
   */
  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  /**
   * Clear badge
   */
  async clearBadge(): Promise<void> {
    await Notifications.setBadgeCountAsync(0);
  }

  /**
   * Cleanup listeners
   */
  cleanup(): void {
    if (this.notificationListener) {
      this.notificationListener.remove();
      this.notificationListener = null;
    }
    if (this.responseListener) {
      this.responseListener.remove();
      this.responseListener = null;
    }
  }

  /**
   * Get push token
   */
  getPushToken(): string | null {
    return this.expoPushToken;
  }
}

// =============================================================================
// NOTIFICATION TEMPLATES
// =============================================================================

export const notificationTemplates = {
  friendRequest: (username: string) => ({
    title: "Friend Request",
    body: `${username} wants to be friends!`,
    data: { type: "friend_request" as const },
  }),

  friendAccepted: (username: string) => ({
    title: "Friend Request Accepted",
    body: `${username} accepted your friend request!`,
    data: { type: "friend_accepted" as const },
  }),

  groupInvite: (groupName: string, inviterName: string) => ({
    title: "Group Invitation",
    body: `${inviterName} invited you to join "${groupName}"`,
    data: { type: "group_invite" as const },
  }),

  roomInvite: (roomName: string, hostName: string) => ({
    title: "Study Session Invite",
    body: `${hostName} invited you to "${roomName}"`,
    data: { type: "room_invite" as const },
  }),

  taskReminder: (taskTitle: string) => ({
    title: "Task Reminder",
    body: `Don't forget: ${taskTitle}`,
    data: { type: "task_reminder" as const },
  }),

  taskDue: (taskTitle: string) => ({
    title: "Task Due Soon",
    body: `"${taskTitle}" is due soon!`,
    data: { type: "task_reminder" as const },
  }),

  activityUpdate: (username: string, activity: string) => ({
    title: "Friend Activity",
    body: `${username} ${activity}`,
    data: { type: "activity_update" as const },
  }),

  studySessionStarted: (roomName: string) => ({
    title: "Session Started",
    body: `Study session "${roomName}" has started`,
    data: { type: "room_invite" as const },
  }),
};

// =============================================================================
// EXPO PUSH NOTIFICATION HELPER
// =============================================================================

/**
 * Send push notification via Expo Push API
 * This is typically done from your backend, but included for reference
 */
export async function sendExpoPushNotification(
  pushToken: string,
  title: string,
  body: string,
  data?: any
): Promise<void> {
  const message = {
    to: pushToken,
    sound: "default",
    title,
    body,
    data,
  };

  try {
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();
    console.log("Push notification sent:", result);
  } catch (error) {
    console.error("Failed to send push notification:", error);
  }
}

// Singleton instance
export const pushNotificationService = new PushNotificationService();

export default pushNotificationService;
