import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions from the user
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.warn("Notification permission not granted");
      return false;
    }

    // Configure notification channel for Android
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "StudyPal Reminders",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#4CAF50",
        sound: "default",
      });

      // Create additional channels for different types
      await Notifications.setNotificationChannelAsync("tasks", {
        name: "Task Reminders",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#2196F3",
        sound: "default",
      });

      await Notifications.setNotificationChannelAsync("study", {
        name: "Study Sessions",
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250],
        lightColor: "#FF9800",
        sound: "default",
      });
    }

    return true;
  } catch (error) {
    console.error("Error requesting notification permissions:", error);
    return false;
  }
};

/**
 * Schedule a task reminder notification
 */
export const scheduleTaskReminder = async (
  taskId: string,
  taskTitle: string,
  dueDate: Date,
  reminderMinutesBefore: number = 60
): Promise<string | null> => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    const reminderDate = new Date(dueDate.getTime() - reminderMinutesBefore * 60 * 1000);

    // Don't schedule if the reminder time is in the past
    if (reminderDate.getTime() <= Date.now()) {
      console.warn("Reminder time is in the past, not scheduling");
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "📚 Task Reminder",
        body: `"${taskTitle}" is due soon!`,
        data: { taskId, type: "task_reminder" },
        sound: "default",
      },
      trigger: {
        date: reminderDate,
        channelId: "tasks",
      },
    });

    return notificationId;
  } catch (error) {
    console.error("Error scheduling task reminder:", error);
    return null;
  }
};

/**
 * Schedule a daily study reminder
 */
export const scheduleDailyStudyReminder = async (
  hour: number,
  minute: number,
  message: string = "Time to study! 📖"
): Promise<string | null> => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Study Time!",
        body: message,
        data: { type: "daily_reminder" },
        sound: "default",
      },
      trigger: {
        hour,
        minute,
        repeats: true,
        channelId: "study",
      },
    });

    return notificationId;
  } catch (error) {
    console.error("Error scheduling daily study reminder:", error);
    return null;
  }
};

/**
 * Cancel a specific notification
 */
export const cancelNotification = async (notificationId: string): Promise<boolean> => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    return true;
  } catch (error) {
    console.error("Error canceling notification:", error);
    return false;
  }
};

/**
 * Cancel all scheduled notifications
 */
export const cancelAllNotifications = async (): Promise<boolean> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    return true;
  } catch (error) {
    console.error("Error canceling all notifications:", error);
    return false;
  }
};

/**
 * Get all scheduled notifications
 */
export const getAllScheduledNotifications = async () => {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    return notifications;
  } catch (error) {
    console.error("Error getting scheduled notifications:", error);
    return [];
  }
};

/**
 * Show an immediate notification (for testing or instant alerts)
 */
export const showImmediateNotification = async (
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<string | null> => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: "default",
      },
      trigger: null, // Show immediately
    });

    return notificationId;
  } catch (error) {
    console.error("Error showing immediate notification:", error);
    return null;
  }
};

/**
 * Schedule a study session completion notification
 */
export const scheduleStudySessionComplete = async (
  sessionDurationMinutes: number
): Promise<string | null> => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "🎉 Study Session Complete!",
        body: `Great job! You studied for ${sessionDurationMinutes} minutes.`,
        data: { type: "session_complete" },
        sound: "default",
      },
      trigger: {
        seconds: sessionDurationMinutes * 60,
        channelId: "study",
      },
    });

    return notificationId;
  } catch (error) {
    console.error("Error scheduling session complete notification:", error);
    return null;
  }
};

/**
 * Schedule a break reminder during study session
 */
export const scheduleBreakReminder = async (
  minutes: number
): Promise<string | null> => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "☕ Time for a Break!",
        body: "Take a short break to refresh your mind.",
        data: { type: "break_reminder" },
        sound: "default",
      },
      trigger: {
        seconds: minutes * 60,
        channelId: "study",
      },
    });

    return notificationId;
  } catch (error) {
    console.error("Error scheduling break reminder:", error);
    return null;
  }
};

/**
 * Add notification listener for when notifications are received
 */
export const addNotificationReceivedListener = (
  handler: (notification: Notifications.Notification) => void
) => {
  return Notifications.addNotificationReceivedListener(handler);
};

/**
 * Add notification response listener for when user interacts with notification
 */
export const addNotificationResponseListener = (
  handler: (response: Notifications.NotificationResponse) => void
) => {
  return Notifications.addNotificationResponseReceivedListener(handler);
};
