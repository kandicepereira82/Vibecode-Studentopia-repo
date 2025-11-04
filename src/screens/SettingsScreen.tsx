import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, Alert, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import useUserStore from "../state/userStore";
import { getTheme } from "../utils/themes";
import { useTranslation } from "../utils/translations";
import {
  requestNotificationPermissions,
  scheduleDailyStudyReminder,
  cancelAllNotifications,
  getAllScheduledNotifications,
} from "../services/notificationService";
import {
  requestCalendarPermissions,
  hasCalendarPermissions,
  getDeviceCalendars,
} from "../services/calendarService";

const SettingsScreen = () => {
  const user = useUserStore((s) => s.user);
  const theme = getTheme(user?.themeColor);
  const { t } = useTranslation(user?.language || "en");

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [calendarSyncEnabled, setCalendarSyncEnabled] = useState(false);
  const [dailyReminderEnabled, setDailyReminderEnabled] = useState(false);
  const [scheduledNotificationsCount, setScheduledNotificationsCount] = useState(0);
  const [availableCalendars, setAvailableCalendars] = useState<number>(0);

  useEffect(() => {
    checkPermissions();
    loadScheduledNotifications();
  }, []);

  const checkPermissions = async () => {
    const calPerms = await hasCalendarPermissions();
    setCalendarSyncEnabled(calPerms);
  };

  const loadScheduledNotifications = async () => {
    const notifications = await getAllScheduledNotifications();
    setScheduledNotificationsCount(notifications.length);
  };

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermissions();
    if (granted) {
      setNotificationsEnabled(true);
      Alert.alert(
        "Notifications Enabled",
        "You will now receive reminders for your tasks and study sessions."
      );
    } else {
      Alert.alert(
        "Permission Denied",
        "Please enable notifications in your device settings to receive reminders."
      );
    }
  };

  const handleEnableCalendarSync = async () => {
    const granted = await requestCalendarPermissions();
    if (granted) {
      setCalendarSyncEnabled(true);
      const calendars = await getDeviceCalendars();
      setAvailableCalendars(calendars.length);
      Alert.alert(
        "Calendar Sync Enabled",
        `StudyPal can now sync with your device calendar. Found ${calendars.length} calendars on your device.`
      );
    } else {
      Alert.alert(
        "Permission Denied",
        "Please enable calendar access in your device settings to sync events."
      );
    }
  };

  const handleToggleDailyReminder = async (value: boolean) => {
    if (value) {
      const notificationId = await scheduleDailyStudyReminder(
        9,
        0,
        "Good morning! Time to plan your study session 📚"
      );
      if (notificationId) {
        setDailyReminderEnabled(true);
        loadScheduledNotifications();
        Alert.alert(
          "Daily Reminder Set",
          "You will receive a reminder at 9:00 AM every day."
        );
      }
    } else {
      await cancelAllNotifications();
      setDailyReminderEnabled(false);
      loadScheduledNotifications();
    }
  };

  const handleTestNotification = async () => {
    const { showImmediateNotification } = await import("../services/notificationService");
    const notificationId = await showImmediateNotification(
      "Test Notification",
      "This is a test notification from StudyPal! 🎉"
    );
    if (notificationId) {
      Alert.alert("Success", "Test notification sent!");
    }
  };

  const handleClearAllNotifications = async () => {
    Alert.alert(
      "Clear All Notifications",
      "Are you sure you want to cancel all scheduled notifications?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            await cancelAllNotifications();
            loadScheduledNotifications();
            Alert.alert("Success", "All scheduled notifications cleared.");
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#E8F5E9" }}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View className="px-6 pt-4 pb-2">
          <Text className="text-3xl font-bold" style={{ color: theme.textPrimary }}>
            Settings
          </Text>
          <Text className="text-sm mt-1" style={{ color: theme.textSecondary }}>
            Notifications & Calendar Sync
          </Text>
        </View>

        <ScrollView className="flex-1 px-6 py-2" showsVerticalScrollIndicator={false}>
          {/* Notifications Section */}
          <View className="mb-6">
            <Text className="text-lg font-bold mb-3" style={{ color: theme.textPrimary }}>
              Notifications
            </Text>

            {/* Enable Notifications */}
            <View className="rounded-2xl p-4 mb-3" style={{ backgroundColor: theme.cardBackground }}>
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center flex-1">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: theme.primary + "20" }}
                  >
                    <Ionicons name="notifications" size={20} color={theme.primary} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold" style={{ color: theme.textPrimary }}>
                      Enable Notifications
                    </Text>
                    <Text className="text-xs mt-0.5" style={{ color: theme.textSecondary }}>
                      Get reminders for tasks and study sessions
                    </Text>
                  </View>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={(value) => {
                    if (value) handleEnableNotifications();
                    else setNotificationsEnabled(false);
                  }}
                  trackColor={{ false: theme.textSecondary + "30", true: theme.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            {/* Daily Reminder */}
            <View className="rounded-2xl p-4 mb-3" style={{ backgroundColor: theme.cardBackground }}>
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center flex-1">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: theme.secondary + "20" }}
                  >
                    <Ionicons name="alarm" size={20} color={theme.secondary} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold" style={{ color: theme.textPrimary }}>
                      Daily Study Reminder
                    </Text>
                    <Text className="text-xs mt-0.5" style={{ color: theme.textSecondary }}>
                      9:00 AM daily reminder
                    </Text>
                  </View>
                </View>
                <Switch
                  value={dailyReminderEnabled}
                  onValueChange={handleToggleDailyReminder}
                  trackColor={{ false: theme.textSecondary + "30", true: theme.secondary }}
                  thumbColor="#FFFFFF"
                  disabled={!notificationsEnabled}
                />
              </View>
            </View>

            {/* Scheduled Notifications Info */}
            <View className="rounded-2xl p-4 mb-3" style={{ backgroundColor: theme.cardBackground }}>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: theme.accentColor + "20" }}
                  >
                    <Ionicons name="list" size={20} color={theme.accentColor} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold" style={{ color: theme.textPrimary }}>
                      Scheduled Notifications
                    </Text>
                    <Text className="text-xs mt-0.5" style={{ color: theme.textSecondary }}>
                      {scheduledNotificationsCount} active reminders
                    </Text>
                  </View>
                </View>
                {scheduledNotificationsCount > 0 && (
                  <Pressable
                    onPress={handleClearAllNotifications}
                    className="px-3 py-1.5 rounded-lg"
                    style={{ backgroundColor: "#EF4444" }}
                  >
                    <Text className="text-xs font-semibold text-white">Clear All</Text>
                  </Pressable>
                )}
              </View>
            </View>

            {/* Test Notification */}
            <Pressable
              onPress={handleTestNotification}
              disabled={!notificationsEnabled}
              className="rounded-2xl p-4 flex-row items-center justify-center"
              style={{
                backgroundColor: notificationsEnabled
                  ? theme.primary
                  : theme.textSecondary + "30",
              }}
            >
              <Ionicons name="send" size={18} color="white" />
              <Text className="text-white font-semibold ml-2">Send Test Notification</Text>
            </Pressable>
          </View>

          {/* Calendar Sync Section */}
          <View className="mb-6">
            <Text className="text-lg font-bold mb-3" style={{ color: theme.textPrimary }}>
              Calendar Integration
            </Text>

            {/* Enable Calendar Sync */}
            <View className="rounded-2xl p-4 mb-3" style={{ backgroundColor: theme.cardBackground }}>
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center flex-1">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: theme.primary + "20" }}
                  >
                    <Ionicons name="calendar" size={20} color={theme.primary} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold" style={{ color: theme.textPrimary }}>
                      Calendar Sync
                    </Text>
                    <Text className="text-xs mt-0.5" style={{ color: theme.textSecondary }}>
                      Sync tasks with device calendar
                    </Text>
                  </View>
                </View>
                <Switch
                  value={calendarSyncEnabled}
                  onValueChange={(value) => {
                    if (value) handleEnableCalendarSync();
                    else setCalendarSyncEnabled(false);
                  }}
                  trackColor={{ false: theme.textSecondary + "30", true: theme.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            {calendarSyncEnabled && (
              <View className="rounded-2xl p-4" style={{ backgroundColor: theme.cardBackground }}>
                <View className="flex-row items-center mb-2">
                  <Ionicons name="checkmark-circle" size={18} color={theme.secondary} />
                  <Text className="text-sm font-semibold ml-2" style={{ color: theme.textPrimary }}>
                    Calendar Access Granted
                  </Text>
                </View>
                <Text className="text-xs" style={{ color: theme.textSecondary }}>
                  Tasks and study sessions will be automatically synced to your device calendar.
                </Text>
              </View>
            )}
          </View>

          {/* API Integrations Section */}
          <View className="mb-6">
            <Text className="text-lg font-bold mb-3" style={{ color: theme.textPrimary }}>
              AI Integrations
            </Text>

            {/* OpenAI/ChatGPT */}
            <View className="rounded-2xl p-4 mb-3" style={{ backgroundColor: theme.cardBackground }}>
              <View className="flex-row items-center">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: "#10A37F20" }}
                >
                  <Ionicons name="chatbubbles" size={20} color="#10A37F" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold" style={{ color: theme.textPrimary }}>
                    ChatGPT (OpenAI)
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <View className="w-2 h-2 rounded-full bg-green-500 mr-1.5" />
                    <Text className="text-xs" style={{ color: theme.textSecondary }}>
                      Connected & Active
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Claude */}
            <View className="rounded-2xl p-4 mb-3" style={{ backgroundColor: theme.cardBackground }}>
              <View className="flex-row items-center">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: "#D4925420" }}
                >
                  <Ionicons name="sparkles" size={20} color="#D49254" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold" style={{ color: theme.textPrimary }}>
                    Claude (Anthropic)
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <View className="w-2 h-2 rounded-full bg-green-500 mr-1.5" />
                    <Text className="text-xs" style={{ color: theme.textSecondary }}>
                      Connected & Active
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Grok */}
            <View className="rounded-2xl p-4" style={{ backgroundColor: theme.cardBackground }}>
              <View className="flex-row items-center">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: "#1DA1F220" }}
                >
                  <Ionicons name="flash" size={20} color="#1DA1F2" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold" style={{ color: theme.textPrimary }}>
                    Grok (xAI)
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <View className="w-2 h-2 rounded-full bg-green-500 mr-1.5" />
                    <Text className="text-xs" style={{ color: theme.textSecondary }}>
                      Connected & Active
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Bottom Spacing */}
          <View className="h-6" />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default SettingsScreen;
