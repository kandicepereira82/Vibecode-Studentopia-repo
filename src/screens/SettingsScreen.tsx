import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, Switch, Modal, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ProfileStackParamList } from "../navigation/ProfileStack";
import useUserStore from "../state/userStore";
import { getTheme } from "../utils/themes";
import { useTranslation } from "../utils/translations";
import { getStudyTimeMessage12Hour } from "../utils/engagementMessages";
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
import { useGlobalToast } from "../context/ToastContext";

type SettingsScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, "Settings">;

interface SettingsScreenProps {
  navigation?: SettingsScreenNavigationProp;
}

interface AlertState {
  visible: boolean;
  title: string;
  message: string;
  buttons?: Array<{ text: string; onPress?: () => void; style?: "default" | "cancel" | "destructive" }>;
}

const SettingsScreen = ({ navigation }: SettingsScreenProps) => {
  const user = useUserStore((s) => s.user);
  const logout = useUserStore((s) => s.logout);
  const updateDailyReminderTime = useUserStore((s) => s.updateDailyReminderTime);
  const theme = getTheme(user?.themeColor);
  const { t } = useTranslation(user?.language || "en");
  const toast = useGlobalToast();

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationSoundEnabled, setNotificationSoundEnabled] = useState(user?.notificationSound ?? true);
  const [notificationVibrationEnabled, setNotificationVibrationEnabled] = useState(user?.notificationVibration ?? true);
  const [mindfulnessBreakEnabled, setMindfulnessBreakEnabled] = useState(user?.mindfulnessBreakEnabled ?? true);
  const [calendarSyncEnabled, setCalendarSyncEnabled] = useState(false);
  const [dailyReminderEnabled, setDailyReminderEnabled] = useState(false);
  const [scheduledNotificationsCount, setScheduledNotificationsCount] = useState(0);
  const [availableCalendars, setAvailableCalendars] = useState<number>(0);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showCalendarInstructions, setShowCalendarInstructions] = useState(false);

  // Convert 24-hour format to 12-hour format
  const userHour24 = user?.dailyReminderTime?.hour || 9;
  const userMinute = user?.dailyReminderTime?.minute || 0;
  const [reminderHour, setReminderHour] = useState(userHour24 === 0 ? 12 : userHour24 > 12 ? userHour24 - 12 : userHour24);
  const [reminderMinute, setReminderMinute] = useState(userMinute);
  const [reminderPeriod, setReminderPeriod] = useState<"AM" | "PM">(userHour24 >= 12 ? "PM" : "AM");

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
      // Convert 12-hour format to 24-hour format
      let hour24 = reminderHour;
      if (reminderPeriod === "AM" && reminderHour === 12) {
        hour24 = 0; // 12 AM = 00:00
      } else if (reminderPeriod === "PM" && reminderHour !== 12) {
        hour24 = reminderHour + 12; // Convert PM to 24-hour (except 12 PM)
      }

      // Get time-appropriate greeting message
      const timeBasedMessage = getStudyTimeMessage12Hour(reminderHour, reminderPeriod);

      const notificationId = await scheduleDailyStudyReminder(
        hour24,
        reminderMinute,
        timeBasedMessage
      );
      if (notificationId) {
        setDailyReminderEnabled(true);
        updateDailyReminderTime(hour24, reminderMinute);
        loadScheduledNotifications();
        showAlert(
          "Daily Reminder Set",
          `You will receive a reminder at ${String(reminderHour).padStart(2, "0")}:${String(reminderMinute).padStart(2, "0")} ${reminderPeriod} every day.\n\nMessage: "${timeBasedMessage}"`
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
    // Convert 12-hour format to 24-hour format
    let hour24 = reminderHour;
    if (reminderPeriod === "AM" && reminderHour === 12) {
      hour24 = 0; // 12 AM = 00:00
    } else if (reminderPeriod === "PM" && reminderHour !== 12) {
      hour24 = reminderHour + 12; // Convert PM to 24-hour (except 12 PM)
    }

    updateDailyReminderTime(hour24, reminderMinute);
    setShowTimePicker(false);

    // Get time-appropriate greeting message
    const timeBasedMessage = getStudyTimeMessage12Hour(reminderHour, reminderPeriod);

    // If daily reminder is already enabled, reschedule with new time
    if (dailyReminderEnabled) {
      await cancelAllNotifications();
      const notificationId = await scheduleDailyStudyReminder(
        hour24,
        reminderMinute,
        timeBasedMessage
      );
      if (notificationId) {
        loadScheduledNotifications();
        showAlert(
          "Reminder Time Updated",
          `Daily reminder updated to ${String(reminderHour).padStart(2, "0")}:${String(reminderMinute).padStart(2, "0")} ${reminderPeriod}.\n\nMessage: "${timeBasedMessage}"`
        );
      }
    } else {
      showAlert(
        "Time Saved",
        `Reminder time set to ${String(reminderHour).padStart(2, "0")}:${String(reminderMinute).padStart(2, "0")} ${reminderPeriod}.\n\nMessage: "${timeBasedMessage}"`
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
        <View className="px-6 pt-4 pb-2 flex-row items-center">
          {navigation && (
            <Pressable
              onPress={() => navigation.goBack()}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: theme.textSecondary + "20",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
            </Pressable>
          )}
          <View className="flex-1">
            <Text className="text-3xl font-bold" style={{ color: theme.textPrimary }}>
              Settings
            </Text>
            <Text className="text-sm mt-1" style={{ color: theme.textSecondary }}>
              Notifications & Calendar Sync
            </Text>
          </View>
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
                    {String(reminderHour).padStart(2, "0")}:{String(reminderMinute).padStart(2, "0")} {reminderPeriod} daily reminder
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center gap-2">
                <Text style={{ color: theme.primary, fontWeight: "600" }}>
                  {String(reminderHour).padStart(2, "0")}:{String(reminderMinute).padStart(2, "0")} {reminderPeriod}
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

            {/* Sound Toggle */}
            <View className="rounded-2xl p-4 mb-3" style={{ backgroundColor: theme.cardBackground }}>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: theme.primary + "20" }}
                  >
                    <Ionicons name={notificationSoundEnabled ? "volume-high" : "volume-mute"} size={20} color={theme.primary} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold" style={{ color: theme.textPrimary }}>
                      Notification Sounds
                    </Text>
                    <Text className="text-xs mt-0.5" style={{ color: theme.textSecondary }}>
                      Play sound when notifications arrive
                    </Text>
                  </View>
                </View>
                <Switch
                  value={notificationSoundEnabled}
                  onValueChange={(value) => {
                    setNotificationSoundEnabled(value);
                    useUserStore.getState().updateNotificationSound(value);
                  }}
                  trackColor={{ false: theme.textSecondary + "30", true: theme.primary }}
                  thumbColor="#FFFFFF"
                  disabled={!notificationsEnabled}
                />
              </View>
            </View>

            {/* Vibration Toggle */}
            <View className="rounded-2xl p-4 mb-3" style={{ backgroundColor: theme.cardBackground }}>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: theme.primary + "20" }}
                  >
                    <Ionicons name={notificationVibrationEnabled ? "phone-portrait" : "phone-portrait-outline"} size={20} color={theme.primary} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold" style={{ color: theme.textPrimary }}>
                      Vibration
                    </Text>
                    <Text className="text-xs mt-0.5" style={{ color: theme.textSecondary }}>
                      Vibrate when notifications arrive
                    </Text>
                  </View>
                </View>
                <Switch
                  value={notificationVibrationEnabled}
                  onValueChange={(value) => {
                    setNotificationVibrationEnabled(value);
                    useUserStore.getState().updateNotificationVibration(value);
                  }}
                  trackColor={{ false: theme.textSecondary + "30", true: theme.primary }}
                  thumbColor="#FFFFFF"
                  disabled={!notificationsEnabled}
                />
              </View>
            </View>

            {/* Mindfulness Break Toggle */}
            <View className="rounded-2xl p-4 mb-3" style={{ backgroundColor: theme.cardBackground }}>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: theme.secondary + "20" }}
                  >
                    <Ionicons name="leaf" size={20} color={theme.secondary} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold" style={{ color: theme.textPrimary }}>
                      Mindfulness Breaks
                    </Text>
                    <Text className="text-xs mt-0.5" style={{ color: theme.textSecondary }}>
                      Remind to take breaks after 45-60 min of focus
                    </Text>
                  </View>
                </View>
                <Switch
                  value={mindfulnessBreakEnabled}
                  onValueChange={(value) => {
                    setMindfulnessBreakEnabled(value);
                    useUserStore.getState().updateMindfulnessBreak(value);
                  }}
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
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold" style={{ color: theme.textPrimary }}>
                Calendar Integration
              </Text>
              <Pressable
                onPress={() => setShowCalendarInstructions(true)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: theme.primary + "20",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="help-circle" size={20} color={theme.primary} />
              </Pressable>
            </View>

            {/* Enable Calendar Sync */}
            {navigation ? (
              <Pressable
                onPress={() => navigation.navigate("CalendarConnections")}
                className="rounded-2xl p-4 mb-3"
                style={{ backgroundColor: theme.cardBackground }}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: theme.primary + "20" }}
                    >
                      <Ionicons name="calendar" size={20} color={theme.primary} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-semibold" style={{ color: theme.textPrimary }}>
                        Manage Calendars
                      </Text>
                      <Text className="text-xs mt-0.5" style={{ color: theme.textSecondary }}>
                        Connect and sync multiple calendars
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                </View>
              </Pressable>
            ) : (
              <View className="rounded-2xl p-4 mb-3" style={{ backgroundColor: theme.cardBackground }}>
                <View className="flex-row items-center justify-between">
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
                        Basic calendar sync enabled
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Legacy Toggle - Keep for backward compatibility */}
            <View className="rounded-2xl p-4 mb-3" style={{ backgroundColor: theme.cardBackground }}>
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center flex-1">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: theme.secondary + "20" }}
                  >
                    <Ionicons name="sync" size={20} color={theme.secondary} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold" style={{ color: theme.textPrimary }}>
                      Quick Calendar Sync
                    </Text>
                    <Text className="text-xs mt-0.5" style={{ color: theme.textSecondary }}>
                      Enable basic calendar sync
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
                    onPress={() => setReminderHour((h) => (h === 1 ? 12 : h - 1))}
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

                  <TextInput
                    style={{
                      width: 70,
                      height: 70,
                      borderRadius: 16,
                      backgroundColor: theme.primary + "10",
                      borderWidth: 2,
                      borderColor: theme.primary,
                      textAlign: "center",
                      fontSize: 36,
                      fontFamily: "Poppins_700Bold",
                      color: theme.primary,
                    }}
                    value={String(reminderHour).padStart(2, "0")}
                    onChangeText={(text) => {
                      const num = parseInt(text) || 0;
                      if (num >= 1 && num <= 12) {
                        setReminderHour(num);
                      }
                    }}
                    keyboardType="number-pad"
                    maxLength={2}
                  />

                  <Pressable
                    onPress={() => setReminderHour((h) => (h === 12 ? 1 : h + 1))}
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

                  <TextInput
                    style={{
                      width: 70,
                      height: 70,
                      borderRadius: 16,
                      backgroundColor: theme.secondary + "10",
                      borderWidth: 2,
                      borderColor: theme.secondary,
                      textAlign: "center",
                      fontSize: 36,
                      fontFamily: "Poppins_700Bold",
                      color: theme.secondary,
                    }}
                    value={String(reminderMinute).padStart(2, "0")}
                    onChangeText={(text) => {
                      const num = parseInt(text) || 0;
                      if (num >= 0 && num <= 59) {
                        setReminderMinute(num);
                      }
                    }}
                    keyboardType="number-pad"
                    maxLength={2}
                  />

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

            {/* AM/PM Toggle */}
            <View className="flex-row gap-3 mb-6 justify-center">
              <Pressable
                onPress={() => setReminderPeriod("AM")}
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: reminderPeriod === "AM" ? theme.primary : theme.textSecondary + "20",
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: "Poppins_600SemiBold",
                    color: reminderPeriod === "AM" ? "white" : theme.textPrimary,
                  }}
                >
                  AM
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setReminderPeriod("PM")}
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: reminderPeriod === "PM" ? theme.primary : theme.textSecondary + "20",
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: "Poppins_600SemiBold",
                    color: reminderPeriod === "PM" ? "white" : theme.textPrimary,
                  }}
                >
                  PM
                </Text>
              </Pressable>
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
                {String(reminderHour).padStart(2, "0")}:{String(reminderMinute).padStart(2, "0")} {reminderPeriod}
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

      {/* Calendar Sync Instructions Modal */}
      <Modal
        visible={showCalendarInstructions}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCalendarInstructions(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
          <View
            style={{
              flex: 1,
              backgroundColor: theme.cardBackground,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              marginTop: 60,
            }}
          >
            {/* Header */}
            <View className="flex-row items-center justify-between p-6 border-b" style={{ borderBottomColor: theme.textSecondary + "20" }}>
              <Text style={{ fontSize: 20, fontFamily: "Poppins_700Bold", color: theme.textPrimary }}>
                How to Sync Calendar
              </Text>
              <Pressable onPress={() => setShowCalendarInstructions(false)}>
                <Ionicons name="close" size={24} color={theme.textPrimary} />
              </Pressable>
            </View>

            {/* Instructions Content */}
            <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
              {/* What is Calendar Sync */}
              <View className="mb-6">
                <Text style={{ fontSize: 16, fontFamily: "Poppins_700Bold", color: theme.primary, marginBottom: 8 }}>
                  📅 What is Calendar Sync?
                </Text>
                <Text style={{ fontSize: 14, fontFamily: "Poppins_400Regular", color: theme.textSecondary, lineHeight: 20 }}>
                  Calendar Sync automatically adds your Studentopia tasks to your device&rsquo;s calendar. This helps you see all your study sessions and deadlines in one place.
                </Text>
              </View>

              {/* Step by Step Instructions */}
              <View className="mb-6">
                <Text style={{ fontSize: 16, fontFamily: "Poppins_700Bold", color: theme.primary, marginBottom: 12 }}>
                  📋 Step-by-Step Instructions
                </Text>

                {/* Step 1 */}
                <View className="mb-5 pb-5 border-b" style={{ borderBottomColor: theme.textSecondary + "20" }}>
                  <View className="flex-row items-start gap-3 mb-2">
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: theme.primary,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ color: "white", fontFamily: "Poppins_700Bold" }}>1</Text>
                    </View>
                    <View className="flex-1">
                      <Text style={{ fontSize: 14, fontFamily: "Poppins_600SemiBold", color: theme.textPrimary }}>
                        Enable Calendar Sync
                      </Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 13, fontFamily: "Poppins_400Regular", color: theme.textSecondary, lineHeight: 18, marginLeft: 35 }}>
                    Toggle the &ldquo;Calendar Sync&rdquo; switch ON in this settings screen. Your phone will ask for calendar access permission.
                  </Text>
                </View>

                {/* Step 2 */}
                <View className="mb-5 pb-5 border-b" style={{ borderBottomColor: theme.textSecondary + "20" }}>
                  <View className="flex-row items-start gap-3 mb-2">
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: theme.primary,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ color: "white", fontFamily: "Poppins_700Bold" }}>2</Text>
                    </View>
                    <View className="flex-1">
                      <Text style={{ fontSize: 14, fontFamily: "Poppins_600SemiBold", color: theme.textPrimary }}>
                        Grant Permission
                      </Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 13, fontFamily: "Poppins_400Regular", color: theme.textSecondary, lineHeight: 18, marginLeft: 35 }}>
                    When prompted, select &ldquo;Allow&rdquo; to let Studentopia access your device calendar. This gives the app permission to add events.
                  </Text>
                </View>

                {/* Step 3 */}
                <View className="mb-5 pb-5 border-b" style={{ borderBottomColor: theme.textSecondary + "20" }}>
                  <View className="flex-row items-start gap-3 mb-2">
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: theme.primary,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ color: "white", fontFamily: "Poppins_700Bold" }}>3</Text>
                    </View>
                    <View className="flex-1">
                      <Text style={{ fontSize: 14, fontFamily: "Poppins_600SemiBold", color: theme.textPrimary }}>
                        Create or Edit Tasks
                      </Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 13, fontFamily: "Poppins_400Regular", color: theme.textSecondary, lineHeight: 18, marginLeft: 35 }}>
                    When you create a new task or edit an existing one, add a due date. Tasks with due dates will automatically sync to your calendar.
                  </Text>
                </View>

                {/* Step 4 */}
                <View className="mb-5">
                  <View className="flex-row items-start gap-3 mb-2">
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: theme.primary,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ color: "white", fontFamily: "Poppins_700Bold" }}>4</Text>
                    </View>
                    <View className="flex-1">
                      <Text style={{ fontSize: 14, fontFamily: "Poppins_600SemiBold", color: theme.textPrimary }}>
                        View in Calendar
                      </Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 13, fontFamily: "Poppins_400Regular", color: theme.textSecondary, lineHeight: 18, marginLeft: 35 }}>
                    Open your device&rsquo;s calendar app to see all your Studentopia tasks displayed alongside your other events.
                  </Text>
                </View>
              </View>

              {/* Tips Section */}
              <View className="mb-6 rounded-2xl p-4" style={{ backgroundColor: theme.primary + "10" }}>
                <Text style={{ fontSize: 14, fontFamily: "Poppins_600SemiBold", color: theme.primary, marginBottom: 8 }}>
                  💡 Tips
                </Text>
                <Text style={{ fontSize: 13, fontFamily: "Poppins_400Regular", color: theme.textPrimary, lineHeight: 18, marginBottom: 6 }}>
                  • Tasks are synced in real-time whenever you create or update them
                </Text>
                <Text style={{ fontSize: 13, fontFamily: "Poppins_400Regular", color: theme.textPrimary, lineHeight: 18, marginBottom: 6 }}>
                  • You can edit tasks from either Studentopia or your calendar—changes sync both ways
                </Text>
                <Text style={{ fontSize: 13, fontFamily: "Poppins_400Regular", color: theme.textPrimary, lineHeight: 18 }}>
                  • Toggle calendar sync off any time in settings to stop syncing
                </Text>
              </View>

              {/* Close Button */}
              <Pressable
                onPress={() => setShowCalendarInstructions(false)}
                className="rounded-2xl py-4 items-center justify-center mb-6"
                style={{ backgroundColor: theme.primary }}
              >
                <Text style={{ fontSize: 16, fontFamily: "Poppins_600SemiBold", color: "white" }}>
                  Got it!
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SettingsScreen;

