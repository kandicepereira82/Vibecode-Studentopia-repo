import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, Switch, Modal } from "react-native";
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
import CustomAlert from "../components/CustomAlert";

interface AlertState {
  visible: boolean;
  title: string;
  message: string;
  buttons?: Array<{ text: string; onPress?: () => void; style?: "default" | "cancel" | "destructive" }>;
}

const SettingsScreen = () => {
  const user = useUserStore((s) => s.user);
  const logout = useUserStore((s) => s.logout);
  const updateDailyReminderTime = useUserStore((s) => s.updateDailyReminderTime);
  const theme = getTheme(user?.themeColor);
  const { t } = useTranslation(user?.language || "en");

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [calendarSyncEnabled, setCalendarSyncEnabled] = useState(false);
  const [dailyReminderEnabled, setDailyReminderEnabled] = useState(false);
  const [scheduledNotificationsCount, setScheduledNotificationsCount] = useState(0);
  const [availableCalendars, setAvailableCalendars] = useState<number>(0);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [reminderHour, setReminderHour] = useState(user?.dailyReminderTime?.hour || 9);
  const [reminderMinute, setReminderMinute] = useState(user?.dailyReminderTime?.minute || 0);
  const [alertState, setAlertState] = useState<AlertState>({
    visible: false,
    title: "",
    message: "",
    buttons: [],
  });

  const showAlert = (title: string, message: string, buttons?: AlertState["buttons"]) => {
    setAlertState({
      visible: true,
      title,
      message,
      buttons: buttons || [{ text: "OK", style: "default" }],
    });
  };

  const hideAlert = () => {
    setAlertState({ visible: false, title: "", message: "", buttons: [] });
  };

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
      showAlert(
        "Notifications Enabled",
        "You will now receive reminders for your tasks and study sessions."
      );
    } else {
      showAlert(
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
      showAlert(
        "Calendar Sync Enabled",
        `StudyPal can now sync with your device calendar. Found ${calendars.length} calendars on your device.`
      );
    } else {
      showAlert(
        "Permission Denied",
        "Please enable calendar access in your device settings to sync events."
      );
    }
  };

  const handleToggleDailyReminder = async (value: boolean) => {
    if (value) {
      const notificationId = await scheduleDailyStudyReminder(
        reminderHour,
        reminderMinute,
        "Good morning! Time to plan your study session 📚"
      );
      if (notificationId) {
        setDailyReminderEnabled(true);
        updateDailyReminderTime(reminderHour, reminderMinute);
        loadScheduledNotifications();
        showAlert(
          "Daily Reminder Set",
          `You will receive a reminder at ${String(reminderHour).padStart(2, "0")}:${String(reminderMinute).padStart(2, "0")} every day.`
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
      showAlert("Success", "Test notification sent!");
    }
  };

  const handleSaveReminderTime = async () => {
    updateDailyReminderTime(reminderHour, reminderMinute);
    setShowTimePicker(false);

    // If daily reminder is already enabled, reschedule with new time
    if (dailyReminderEnabled) {
      await cancelAllNotifications();
      const notificationId = await scheduleDailyStudyReminder(
        reminderHour,
        reminderMinute,
        "Good morning! Time to plan your study session 📚"
      );
      if (notificationId) {
        loadScheduledNotifications();
        showAlert(
          "Reminder Time Updated",
          `Daily reminder updated to ${String(reminderHour).padStart(2, "0")}:${String(reminderMinute).padStart(2, "0")}.`
        );
      }
    } else {
      showAlert(
        "Time Saved",
        `Reminder time set to ${String(reminderHour).padStart(2, "0")}:${String(reminderMinute).padStart(2, "0")}.`
      );
    }
  };

  const handleClearAllNotifications = async () => {
    showAlert(
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
            showAlert("Success", "All scheduled notifications cleared.");
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    showAlert(
      "Logout",
      "Are you sure you want to logout? You will need to set up your profile again.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => {
            logout();
            // Navigation will be handled automatically by App.tsx when user becomes null
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
            <Pressable
              onPress={() => setShowTimePicker(true)}
              disabled={!notificationsEnabled}
              className="rounded-2xl p-4 mb-3 flex-row items-center justify-between"
              style={{ backgroundColor: notificationsEnabled ? theme.cardBackground : theme.textSecondary + "20" }}
            >
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
                    {String(reminderHour).padStart(2, "0")}:{String(reminderMinute).padStart(2, "0")} daily reminder
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center gap-2">
                <Text style={{ color: theme.primary, fontWeight: "600" }}>
                  {String(reminderHour).padStart(2, "0")}:{String(reminderMinute).padStart(2, "0")}
                </Text>
                <Switch
                  value={dailyReminderEnabled}
                  onValueChange={handleToggleDailyReminder}
                  trackColor={{ false: theme.textSecondary + "30", true: theme.secondary }}
                  thumbColor="#FFFFFF"
                  disabled={!notificationsEnabled}
                />
              </View>
            </Pressable>

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

          {/* Logout Section */}
          <View className="mb-6">
            <Pressable
              onPress={handleLogout}
              className="rounded-2xl p-4 flex-row items-center justify-center"
              style={{ backgroundColor: "#EF444420" }}
            >
              <Ionicons name="log-out" size={20} color="#EF4444" />
              <Text className="text-red-500 font-semibold ml-2">Logout</Text>
            </Pressable>
          </View>

          {/* Bottom Spacing */}
          <View className="h-6" />
        </ScrollView>
      </SafeAreaView>

      {/* Custom Alert Modal */}
      <CustomAlert
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        buttons={alertState.buttons}
        onClose={hideAlert}
        theme={theme}
      />

      {/* Time Picker Modal */}
      <Modal
        visible={showTimePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
          <View
            style={{
              backgroundColor: theme.cardBackground,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              paddingBottom: 32,
            }}
          >
            {/* Header */}
            <View className="flex-row items-center justify-between mb-6">
              <Text style={{ fontSize: 20, fontFamily: "Poppins_700Bold", color: theme.textPrimary }}>
                Set Reminder Time
              </Text>
              <Pressable onPress={() => setShowTimePicker(false)}>
                <Ionicons name="close" size={24} color={theme.textPrimary} />
              </Pressable>
            </View>

            {/* Hour and Minute Picker */}
            <View className="flex-row items-center justify-center gap-4 mb-6">
              {/* Hour */}
              <View className="items-center">
                <Text style={{ fontSize: 12, color: theme.textSecondary, marginBottom: 8 }}>Hour</Text>
                <View className="flex-row items-center gap-3">
                  <Pressable
                    onPress={() => setReminderHour((h) => (h === 0 ? 23 : h - 1))}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: theme.primary + "20",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="chevron-up" size={24} color={theme.primary} />
                  </Pressable>

                  <View
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 16,
                      backgroundColor: theme.primary + "10",
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 2,
                      borderColor: theme.primary,
                    }}
                  >
                    <Text style={{ fontSize: 40, fontFamily: "Poppins_700Bold", color: theme.primary }}>
                      {String(reminderHour).padStart(2, "0")}
                    </Text>
                  </View>

                  <Pressable
                    onPress={() => setReminderHour((h) => (h === 23 ? 0 : h + 1))}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: theme.primary + "20",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="chevron-down" size={24} color={theme.primary} />
                  </Pressable>
                </View>
              </View>

              {/* Separator */}
              <Text style={{ fontSize: 40, fontFamily: "Poppins_700Bold", color: theme.textPrimary }}>:</Text>

              {/* Minute */}
              <View className="items-center">
                <Text style={{ fontSize: 12, color: theme.textSecondary, marginBottom: 8 }}>Minute</Text>
                <View className="flex-row items-center gap-3">
                  <Pressable
                    onPress={() => setReminderMinute((m) => (m === 0 ? 59 : m - 1))}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: theme.secondary + "20",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="chevron-up" size={24} color={theme.secondary} />
                  </Pressable>

                  <View
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 16,
                      backgroundColor: theme.secondary + "10",
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 2,
                      borderColor: theme.secondary,
                    }}
                  >
                    <Text style={{ fontSize: 40, fontFamily: "Poppins_700Bold", color: theme.secondary }}>
                      {String(reminderMinute).padStart(2, "0")}
                    </Text>
                  </View>

                  <Pressable
                    onPress={() => setReminderMinute((m) => (m === 59 ? 0 : m + 1))}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: theme.secondary + "20",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="chevron-down" size={24} color={theme.secondary} />
                  </Pressable>
                </View>
              </View>
            </View>

            {/* Preview */}
            <View
              className="rounded-2xl p-4 mb-6"
              style={{
                backgroundColor: theme.primary + "10",
                borderWidth: 1,
                borderColor: theme.primary + "30",
              }}
            >
              <Text style={{ fontSize: 12, color: theme.textSecondary, textAlign: "center", marginBottom: 4 }}>
                Reminder at
              </Text>
              <Text
                style={{
                  fontSize: 24,
                  fontFamily: "Poppins_700Bold",
                  color: theme.primary,
                  textAlign: "center",
                }}
              >
                {String(reminderHour).padStart(2, "0")}:{String(reminderMinute).padStart(2, "0")}
              </Text>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setShowTimePicker(false)}
                className="flex-1 rounded-2xl py-4 items-center justify-center"
                style={{ backgroundColor: theme.textSecondary + "20" }}
              >
                <Text style={{ fontSize: 16, fontFamily: "Poppins_600SemiBold", color: theme.textPrimary }}>
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                onPress={handleSaveReminderTime}
                className="flex-1 rounded-2xl py-4 items-center justify-center"
                style={{ backgroundColor: theme.primary }}
              >
                <Text style={{ fontSize: 16, fontFamily: "Poppins_600SemiBold", color: "white" }}>
                  Save
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SettingsScreen;
