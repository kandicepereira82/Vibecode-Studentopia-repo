import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, Switch, Modal, TextInput, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import useUserStore from "../state/userStore";
import useCalendarStore from "../state/calendarStore";
import { getTheme } from "../utils/themes";
import {
  getOrCreateStudentopiaCalendar,
  getAllStudentopiaCalendars,
  deleteStudentopiaCalendar,
  requestCalendarPermissions,
} from "../services/calendarService";
import { CalendarConnection } from "../types";
import CustomAlert from "../components/CustomAlert";
import { useGlobalToast } from "../context/ToastContext";

interface AlertState {
  visible: boolean;
  title: string;
  message: string;
  buttons?: { text: string; onPress?: () => void; style?: "default" | "cancel" | "destructive" }[];
}

interface CalendarConnectionsScreenProps {
  navigation: any;
}

const CalendarConnectionsScreen = ({ navigation }: CalendarConnectionsScreenProps) => {
  const user = useUserStore((s) => s.user);
  const connections: CalendarConnection[] = useCalendarStore((s) => s.connections);
  const addConnection = useCalendarStore((s) => s.addConnection);
  const removeConnection = useCalendarStore((s) => s.removeConnection);
  const toggleConnectionVisibility = useCalendarStore((s) => s.toggleConnectionVisibility);
  const toggleConnectionSync = useCalendarStore((s) => s.toggleConnectionSync);

  const theme = getTheme(user?.themeColor);
  const toast = useGlobalToast();

  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [childName, setChildName] = useState(user?.username || "");
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
    const loadData = async () => {
      await loadExistingConnections();
    };
    loadData();
  }, []);

  const loadExistingConnections = async () => {
    if (!user) return;

    try {
      const studentopiaCalendars = await getAllStudentopiaCalendars();

      // Check if any existing connections need to be synced
      for (const calendar of studentopiaCalendars) {
        const existingConnection = connections.find((c) => c.calendarId === calendar.id);
        if (!existingConnection) {
          // Calendar exists but not tracked, add it
          const childNameFromTitle = calendar.title.replace("Studentopia – ", "");
          const newConnection: CalendarConnection = {
            id: Date.now().toString(),
            userId: user.id,
            childName: childNameFromTitle,
            calendarId: calendar.id,
            calendarName: calendar.title,
            provider: "device",
            isVisible: true,
            syncEnabled: true,
            createdAt: new Date(),
          };
          addConnection(newConnection);
        }
      }
    } catch (error) {
      console.error("Error loading existing connections:", error);
    }
  };

  const handleAddConnection = async () => {
    if (!user || !childName.trim()) {
      showAlert("Missing Information", "Please enter a child's name.");
      return;
    }

    setLoading(true);
    try {
      // Request permissions
      const hasPermission = await requestCalendarPermissions();
      if (!hasPermission) {
        showAlert(
          "Permission Required",
          "Calendar access is required to create a synced calendar. Please enable it in Settings."
        );
        setLoading(false);
        return;
      }

      // Create calendar
      const calendarId = await getOrCreateStudentopiaCalendar(childName.trim());
      if (!calendarId) {
        showAlert("Error", "Failed to create calendar. Please try again.");
        setLoading(false);
        return;
      }

      // Add connection
      const newConnection: CalendarConnection = {
        id: Date.now().toString(),
        userId: user.id,
        childName: childName.trim(),
        calendarId,
        calendarName: `Studentopia – ${childName.trim()}`,
        provider: "device",
        isVisible: true,
        syncEnabled: true,
        createdAt: new Date(),
      };

      addConnection(newConnection);
      setShowAddModal(false);
      setChildName(user.username);
      toast?.show(`Calendar "${newConnection.calendarName}" created successfully!`, "success");
    } catch (error) {
      console.error("Error adding connection:", error);
      showAlert("Error", "Failed to create calendar connection. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConnection = (connection: CalendarConnection) => {
    showAlert(
      "Delete Calendar Connection",
      `Are you sure you want to delete "${connection.calendarName}"? This will also remove the calendar from your device.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // Delete from device
              await deleteStudentopiaCalendar(connection.calendarId);
              // Remove from store
              removeConnection(connection.id);
              toast?.show("Calendar connection deleted", "success");
            } catch (error) {
              console.error("Error deleting connection:", error);
              showAlert("Error", "Failed to delete calendar connection. Please try again.");
            }
          },
        },
      ]
    );
  };

  const userConnections = connections.filter((c) => c.userId === user?.id);

  return (
    <View style={{ flex: 1, backgroundColor: "#E8F5E9" }}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View className="px-6 pt-4 pb-2 flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
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
            <View className="flex-1">
              <Text className="text-3xl font-bold" style={{ color: theme.textPrimary }}>
                Calendar Sync
              </Text>
              <Text className="text-sm mt-1" style={{ color: theme.textSecondary }}>
                Manage calendar connections
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => setShowAddModal(true)}
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: theme.primary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="add" size={28} color="white" />
          </Pressable>
        </View>

        <ScrollView className="flex-1 px-6 py-2" showsVerticalScrollIndicator={false}>
          {/* Info Card */}
          <View className="rounded-2xl p-4 mb-6" style={{ backgroundColor: theme.primary + "15" }}>
            <View className="flex-row items-start gap-3">
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: theme.primary + "30",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="information-circle" size={22} color={theme.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold mb-1" style={{ color: theme.textPrimary }}>
                  About Calendar Sync
                </Text>
                <Text className="text-xs leading-5" style={{ color: theme.textSecondary }}>
                  Create labeled calendars like &ldquo;Studentopia – Emma&rdquo; that sync with Google, Apple, or Outlook.
                  Perfect for parents managing multiple children!
                </Text>
              </View>
            </View>
          </View>

          {/* Connections List */}
          {userConnections.length === 0 ? (
            <View className="items-center justify-center py-12">
              <Ionicons name="calendar-outline" size={64} color={theme.textSecondary + "60"} />
              <Text className="text-base font-semibold mt-4" style={{ color: theme.textPrimary }}>
                No Calendars Connected
              </Text>
              <Text className="text-sm mt-2 text-center px-8" style={{ color: theme.textSecondary }}>
                Tap the + button to create your first synced calendar
              </Text>
            </View>
          ) : (
            <View>
              {userConnections.map((connection) => (
                <View
                  key={connection.id}
                  className="rounded-2xl p-4 mb-3"
                  style={{ backgroundColor: theme.cardBackground }}
                >
                  {/* Header */}
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center flex-1">
                      <View
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 22,
                          backgroundColor: theme.primary + "20",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 12,
                        }}
                      >
                        <Ionicons name="calendar" size={24} color={theme.primary} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-bold" style={{ color: theme.textPrimary }}>
                          {connection.calendarName}
                        </Text>
                        <Text className="text-xs mt-0.5" style={{ color: theme.textSecondary }}>
                          Device Calendar • {connection.provider}
                        </Text>
                      </View>
                    </View>
                    <Pressable
                      onPress={() => handleDeleteConnection(connection)}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: "#EF444420",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    </Pressable>
                  </View>

                  {/* Controls */}
                  <View className="border-t pt-3" style={{ borderTopColor: theme.textSecondary + "20" }}>
                    {/* Visibility Toggle */}
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center flex-1">
                        <Ionicons name="eye" size={18} color={theme.textSecondary} />
                        <Text className="text-sm ml-2" style={{ color: theme.textPrimary }}>
                          Show calendar events
                        </Text>
                      </View>
                      <Switch
                        value={connection.isVisible}
                        onValueChange={() => toggleConnectionVisibility(connection.id)}
                        trackColor={{ false: theme.textSecondary + "30", true: theme.primary }}
                        thumbColor="white"
                      />
                    </View>

                    {/* Sync Toggle */}
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center flex-1">
                        <Ionicons name="sync" size={18} color={theme.textSecondary} />
                        <Text className="text-sm ml-2" style={{ color: theme.textPrimary }}>
                          Auto-sync tasks
                        </Text>
                      </View>
                      <Switch
                        value={connection.syncEnabled}
                        onValueChange={() => toggleConnectionSync(connection.id)}
                        trackColor={{ false: theme.textSecondary + "30", true: theme.secondary }}
                        thumbColor="white"
                      />
                    </View>
                  </View>

                  {/* Last Synced */}
                  {connection.lastSyncedAt && (
                    <View className="mt-3 pt-3 border-t" style={{ borderTopColor: theme.textSecondary + "20" }}>
                      <Text className="text-xs" style={{ color: theme.textSecondary }}>
                        Last synced: {new Date(connection.lastSyncedAt).toLocaleString()}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Bottom Spacing */}
          <View className="h-6" />
        </ScrollView>
      </SafeAreaView>

      {/* Add Connection Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
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
              <Text style={{ fontSize: 20, fontWeight: "bold", color: theme.textPrimary }}>
                Add Calendar Connection
              </Text>
              <Pressable onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={theme.textPrimary} />
              </Pressable>
            </View>

            {/* Child Name Input */}
            <View className="mb-6">
              <Text className="text-sm font-semibold mb-2" style={{ color: theme.textPrimary }}>
                Child&apos;s Name
              </Text>
              <TextInput
                value={childName}
                onChangeText={setChildName}
                placeholder="Enter child's name (e.g., Emma, Jordan)"
                placeholderTextColor={theme.textSecondary}
                style={{
                  backgroundColor: theme.primary + "10",
                  borderRadius: 16,
                  padding: 16,
                  fontSize: 16,
                  color: theme.textPrimary,
                  borderWidth: 2,
                  borderColor: theme.primary + "30",
                }}
              />
              <Text className="text-xs mt-2" style={{ color: theme.textSecondary }}>
                This will create a calendar named &ldquo;Studentopia – {childName || "[Child's Name]"}&rdquo;
              </Text>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setShowAddModal(false)}
                disabled={loading}
                className="flex-1 rounded-2xl py-4 items-center justify-center"
                style={{ backgroundColor: theme.textSecondary + "20" }}
              >
                <Text style={{ fontSize: 16, fontWeight: "600", color: theme.textPrimary }}>
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                onPress={handleAddConnection}
                disabled={loading || !childName.trim()}
                className="flex-1 rounded-2xl py-4 items-center justify-center"
                style={{
                  backgroundColor: loading || !childName.trim() ? theme.textSecondary + "40" : theme.primary,
                }}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={{ fontSize: 16, fontWeight: "600", color: "white" }}>
                    Create Calendar
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Custom Alert */}
      <CustomAlert
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        buttons={alertState.buttons}
        onClose={hideAlert}
        theme={theme}
      />
    </View>
  );
};

export default CalendarConnectionsScreen;
