import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from "@react-native-community/datetimepicker";
import useTaskStore from "../state/taskStore";
import useStatsStore from "../state/statsStore";
import { useTranslation } from "../utils/translations";
import { getTheme } from "../utils/themes";
import { Task, TaskCategory } from "../types";
import { cn } from "../utils/cn";
import CelebrationModal from "../components/CelebrationModal";
import StudyPal from "../components/StudyPal";
import ClickableCompanion from "../components/ClickableCompanion";
import { scheduleTaskReminderAtTime, cancelNotification } from "../services/notificationService";
import { useGlobalToast } from "../context/ToastContext";
import { useCurrentUser, useUserTheme, useUserLanguage, useAllTasks } from "../hooks/useStoreSelectors";

const TasksScreen = () => {
  const user = useCurrentUser();
  const themeColor = useUserTheme();
  const language = useUserLanguage();
  const tasks = useAllTasks();
  const addTask = useTaskStore((s) => s.addTask);
  const updateTask = useTaskStore((s) => s.updateTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const toggleTaskStatus = useTaskStore((s) => s.toggleTaskStatus);
  const incrementTasksCompleted = useStatsStore((s) => s.incrementTasksCompleted);
  const toast = useGlobalToast();

  const [modalVisible, setModalVisible] = useState(false);
  const [celebrationVisible, setCelebrationVisible] = useState(false);
  const [completedTaskTitle, setCompletedTaskTitle] = useState("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TaskCategory>("homework");
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [reminderDate, setReminderDate] = useState<Date | null>(null);
  const [showReminderDatePicker, setShowReminderDatePicker] = useState(false);
  const [showReminderTimePicker, setShowReminderTimePicker] = useState(false);
  const [filterCategory, setFilterCategory] = useState<TaskCategory | "all">("all");
  const [taskNotificationIds, setTaskNotificationIds] = useState<Record<string, string>>({});

  const { t } = useTranslation(language || "en");
  const theme = getTheme(themeColor);

  const openAddModal = () => {
    setEditingTask(null);
    setTitle("");
    setDescription("");
    setCategory("homework");
    setDueDate(new Date());
    setReminderDate(null);
    setModalVisible(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setCategory(task.category);
    setDueDate(new Date(task.dueDate));
    setReminderDate(task.reminder ? new Date(task.reminder) : null);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Please enter a task title");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDateAtMidnight = new Date(dueDate);
    dueDateAtMidnight.setHours(0, 0, 0, 0);

    if (dueDateAtMidnight < today) {
      toast.error("Due date cannot be in the past. Please select today or a future date.");
      return;
    }

    let taskId = editingTask?.id || Date.now().toString() + Math.random().toString(36);

    // Cancel old notification if editing existing reminder
    if (editingTask?.reminder && taskNotificationIds[editingTask.id]) {
      await cancelNotification(taskNotificationIds[editingTask.id]);
    }

    // Schedule new notification if reminder is set
    if (reminderDate) {
      const notificationId = await scheduleTaskReminderAtTime(
        taskId,
        title,
        reminderDate
      );
      if (notificationId) {
        setTaskNotificationIds(prev => ({
          ...prev,
          [taskId]: notificationId
        }));
        const reminderTime = new Date(reminderDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const reminderDate_formatted = new Date(reminderDate).toLocaleDateString();
        toast.success(`Reminder set for ${reminderDate_formatted} at ${reminderTime}`);
      }
    }

    if (editingTask) {
      const success = updateTask(editingTask.id, user?.id || "default", {
        title,
        description,
        category,
        dueDate,
        reminder: reminderDate || undefined,
      });
      if (success) {
        toast.success("Task updated successfully");
      } else {
        toast.error("Failed to update task");
        return;
      }
    } else {
      addTask({
        userId: user?.id || "default",
        title,
        description,
        category,
        dueDate,
        reminder: reminderDate || undefined,
      });
      toast.success("Task created successfully");
    }

    setModalVisible(false);
  };

  const handleDelete = async (taskId: string) => {
    if (!user?.id) return;

    // Cancel notification if exists
    if (taskNotificationIds[taskId]) {
      await cancelNotification(taskNotificationIds[taskId]);
      setTaskNotificationIds(prev => {
        const updated = { ...prev };
        delete updated[taskId];
        return updated;
      });
    }
    const success = deleteTask(taskId, user.id);
    if (success) {
      toast.success("Task deleted");
    } else {
      toast.error("Failed to delete task");
    }
  };

  const handleToggle = async (task: Task) => {
    toggleTaskStatus(task.id);
    if (task.status === "pending") {
      incrementTasksCompleted();
      setCompletedTaskTitle(task.title);
      setCelebrationVisible(true);

      // Cancel reminder notification when task is completed
      if (taskNotificationIds[task.id]) {
        await cancelNotification(taskNotificationIds[task.id]);
        setTaskNotificationIds(prev => {
          const updated = { ...prev };
          delete updated[task.id];
          return updated;
        });
      }
    }
  };

  const getCategoryIcon = (cat: TaskCategory): keyof typeof Ionicons.glyphMap => {
    switch (cat) {
      case "homework":
        return "book";
      case "project":
        return "folder";
      case "exam":
        return "school";
      case "other":
        return "ellipsis-horizontal";
      default:
        return "document";
    }
  };

  const getCategoryColor = (cat: TaskCategory) => {
    switch (cat) {
      case "homework":
        return "#3B82F6";
      case "project":
        return "#8B5CF6";
      case "exam":
        return "#EF4444";
      case "other":
        return "#6B7280";
      default:
        return "#6B7280";
    }
  };

  // Filter tasks by current user first, then by category
  const userTasks = tasks.filter((t) => t.userId === user?.id);

  const filteredTasks = filterCategory === "all"
    ? userTasks
    : userTasks.filter((t) => t.category === filterCategory);

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === "pending" ? -1 : 1;
    }
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  return (
    <View style={{ flex: 1, backgroundColor: theme.backgroundGradient[0] }}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header with Poppins */}
        <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Text style={{
              fontSize: 32,
              fontFamily: 'Poppins_700Bold',
              color: theme.textPrimary
            }}>
              {t("tasks")}
            </Text>
            {user && (
              <View style={{ marginLeft: 16 }}>
                <ClickableCompanion
                  animal={user.studyPalConfig.animal}
                  name={user.studyPalConfig.name}
                  animationsEnabled={false}
                  size={35}
                  showName={false}
                  showMessage={false}
                  customAvatar={user.studyPalConfig.avatar}
                />
              </View>
            )}
          </View>
          <Pressable
            onPress={openAddModal}
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: theme.primary,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 3
            }}
          >
            <Ionicons name="add" size={28} color="white" />
          </Pressable>
        </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ paddingHorizontal: 24, paddingVertical: 12 }}
        contentContainerStyle={{ gap: 12 }}
      >
        <Pressable
          onPress={() => setFilterCategory("all")}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 12,
            backgroundColor: filterCategory === "all" ? theme.primary : 'white',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 1
          }}
        >
          <Text
            style={{
              color: filterCategory === "all" ? "white" : theme.textSecondary,
              fontFamily: 'Poppins_500Medium',
              fontSize: 14
            }}
          >
            All
          </Text>
        </Pressable>
        {(["homework", "project", "exam", "other"] as TaskCategory[]).map((cat) => (
          <Pressable
            key={cat}
            onPress={() => setFilterCategory(cat)}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 12,
              backgroundColor: filterCategory === cat ? theme.primary : 'white',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 1
            }}
          >
            <Text
              style={{
                color: filterCategory === cat ? "white" : theme.textSecondary,
                fontFamily: 'Poppins_500Medium',
                fontSize: 14,
                textTransform: 'capitalize'
              }}
            >
              {t(cat)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Tasks List */}
      <ScrollView style={{ flex: 1, paddingHorizontal: 24 }} showsVerticalScrollIndicator={false}>
        {sortedTasks.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80 }}>
            <Ionicons name="clipboard-outline" size={80} color={theme.textSecondary} />
            <Text style={{ fontSize: 18, fontFamily: 'Poppins_500Medium', marginTop: 16, color: theme.textSecondary }}>
              No tasks yet
            </Text>
            <Text style={{ fontSize: 14, fontFamily: 'Poppins_400Regular', marginTop: 8, color: theme.textSecondary }}>
              Tap the + button to add a task
            </Text>
          </View>
        ) : (
          <View style={{ paddingVertical: 8, paddingBottom: 32 }}>
            {sortedTasks.map((task) => (
              <View
                key={task.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: 20,
                  padding: 16,
                  marginBottom: 12,
                  opacity: task.status === "completed" ? 0.6 : 1,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.06,
                  shadowRadius: 8,
                  elevation: 2
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <Pressable
                    onPress={() => handleToggle(task)}
                    style={{ marginRight: 12, marginTop: 4 }}
                  >
                    <Ionicons
                      name={
                        task.status === "completed"
                          ? "checkmark-circle"
                          : "ellipse-outline"
                      }
                      size={28}
                      color={
                        task.status === "completed"
                          ? theme.secondary
                          : theme.textSecondary
                      }
                    />
                  </Pressable>

                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 17,
                        fontFamily: 'Poppins_600SemiBold',
                        color: theme.textPrimary,
                        textDecorationLine: task.status === "completed" ? 'line-through' : 'none'
                      }}
                    >
                      {task.title}
                    </Text>
                    {task.description && (
                      <Text style={{ fontSize: 14, fontFamily: 'Poppins_400Regular', marginTop: 4, color: theme.textSecondary }}>
                        {task.description}
                      </Text>
                    )}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 12,
                          marginRight: 8,
                          backgroundColor: getCategoryColor(task.category) + "20"
                        }}
                      >
                        <Ionicons
                          name={getCategoryIcon(task.category)}
                          size={14}
                          color={getCategoryColor(task.category)}
                        />
                        <Text
                          style={{
                            fontSize: 12,
                            fontFamily: 'Poppins_500Medium',
                            marginLeft: 4,
                            textTransform: 'capitalize',
                            color: getCategoryColor(task.category)
                          }}
                        >
                          {t(task.category)}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                        <Ionicons name="calendar-outline" size={14} color={theme.textSecondary} />
                        <Text style={{ fontSize: 12, fontFamily: 'Poppins_400Regular', marginLeft: 4, color: theme.textSecondary }}>
                          {new Date(task.dueDate).toLocaleDateString()}
                        </Text>
                        <Ionicons name="time-outline" size={14} color={theme.textSecondary} style={{ marginLeft: 12 }} />
                        <Text style={{ fontSize: 12, fontFamily: 'Poppins_400Regular', marginLeft: 4, color: theme.textSecondary }}>
                          {new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </View>
                      {task.reminder && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                          <Ionicons name="notifications" size={14} color={theme.primary} />
                          <Text style={{ fontSize: 12, fontFamily: 'Poppins_400Regular', marginLeft: 4, color: theme.primary }}>
                            Reminder: {new Date(task.reminder).toLocaleDateString()} {new Date(task.reminder).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', marginLeft: 8 }}>
                    <Pressable
                      onPress={() => openEditModal(task)}
                      style={{ padding: 8 }}
                    >
                      <Ionicons name="create-outline" size={20} color={theme.textSecondary} />
                    </Pressable>
                    <Pressable
                      onPress={() => handleDelete(task.id)}
                      style={{ padding: 8 }}
                    >
                      <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1"
          >
            {/* Modal Header */}
            <View className="px-6 py-4 flex-row items-center justify-between border-b border-gray-200 dark:border-gray-700">
              <Pressable onPress={() => setModalVisible(false)}>
                <Text className="text-blue-500 text-lg">{t("cancel")}</Text>
              </Pressable>
              <Text className="text-xl font-bold text-gray-800 dark:text-gray-100">
                {editingTask ? t("editTask") : t("addTask")}
              </Text>
              <Pressable onPress={handleSave}>
                <Text className="text-blue-500 text-lg font-semibold">
                  {t("save")}
                </Text>
              </Pressable>
            </View>

            <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
              {/* Title */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("taskTitle")}
                </Text>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder={t("taskTitle")}
                  placeholderTextColor="#9CA3AF"
                  className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-xl px-4 py-3 text-base"
                />
              </View>

              {/* Description */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("taskDescription")}
                </Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder={t("taskDescription")}
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-xl px-4 py-3 text-base min-h-[100px]"
                />
              </View>

              {/* Category */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("category")}
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {(["homework", "project", "exam", "other"] as TaskCategory[]).map((cat) => (
                    <Pressable
                      key={cat}
                      onPress={() => setCategory(cat)}
                      className={cn(
                        "px-4 py-2 rounded-xl",
                        category === cat
                          ? "bg-blue-500"
                          : "bg-white dark:bg-gray-800"
                      )}
                    >
                      <Text
                        className={cn(
                          "font-medium capitalize",
                          category === cat
                            ? "text-white"
                            : "text-gray-700 dark:text-gray-300"
                        )}
                      >
                        {t(cat)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Due Date */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("dueDate")}
                </Text>
                <Pressable
                  onPress={() => setShowDatePicker(true)}
                  className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3 flex-row items-center justify-between"
                >
                  <Text className="text-gray-800 dark:text-gray-100 text-base">
                    {dueDate.toLocaleDateString()}
                  </Text>
                  <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                </Pressable>
              </View>

              {/* Due Time */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Due Time
                </Text>
                <Pressable
                  onPress={() => setShowTimePicker(true)}
                  className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3 flex-row items-center justify-between"
                >
                  <Text className="text-gray-800 dark:text-gray-100 text-base">
                    {dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  <Ionicons name="time-outline" size={20} color="#6B7280" />
                </Pressable>
              </View>

              {/* Set Reminder */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Set Reminder
                </Text>
                <Pressable
                  onPress={() => setShowReminderDatePicker(true)}
                  style={{
                    backgroundColor: reminderDate ? theme.primary + "15" : "white",
                    borderWidth: reminderDate ? 2 : 1,
                    borderColor: reminderDate ? theme.primary : "#E5E7EB",
                  }}
                  className="dark:bg-gray-800 rounded-xl px-4 py-3 flex-row items-center justify-between"
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <Ionicons
                      name="time"
                      size={20}
                      color={reminderDate ? theme.primary : "#9CA3AF"}
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={{
                        fontSize: 16,
                        color: reminderDate ? theme.textPrimary : "#9CA3AF",
                      }}
                    >
                      {reminderDate
                        ? `${reminderDate.toLocaleDateString()} ${reminderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                        : "Add a reminder to stay on track"
                      }
                    </Text>
                  </View>
                  {reminderDate && (
                    <Pressable
                      onPress={() => setReminderDate(null)}
                      style={{ padding: 4 }}
                    >
                      <Ionicons name="close-circle" size={20} color={theme.primary} />
                    </Pressable>
                  )}
                </Pressable>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={dueDate}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      // Preserve the time when changing the date
                      const newDate = new Date(selectedDate);
                      newDate.setHours(dueDate.getHours());
                      newDate.setMinutes(dueDate.getMinutes());
                      setDueDate(newDate);
                    }
                  }}
                />
              )}

              {showTimePicker && (
                <DateTimePicker
                  value={dueDate}
                  mode="time"
                  display="default"
                  onChange={(event, selectedTime) => {
                    setShowTimePicker(false);
                    if (selectedTime) {
                      // Preserve the date when changing the time
                      const newDate = new Date(dueDate);
                      newDate.setHours(selectedTime.getHours());
                      newDate.setMinutes(selectedTime.getMinutes());
                      setDueDate(newDate);
                    }
                  }}
                />
              )}

              {showReminderDatePicker && (
                <DateTimePicker
                  value={reminderDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowReminderDatePicker(false);
                    if (selectedDate) {
                      const newDate = new Date(selectedDate);
                      if (reminderDate) {
                        newDate.setHours(reminderDate.getHours());
                        newDate.setMinutes(reminderDate.getMinutes());
                      }
                      setReminderDate(newDate);
                      setShowReminderTimePicker(true);
                    }
                  }}
                />
              )}

              {showReminderTimePicker && (
                <DateTimePicker
                  value={reminderDate || new Date()}
                  mode="time"
                  display="default"
                  onChange={(event, selectedTime) => {
                    setShowReminderTimePicker(false);
                    if (selectedTime && reminderDate) {
                      const newDate = new Date(reminderDate);
                      newDate.setHours(selectedTime.getHours());
                      newDate.setMinutes(selectedTime.getMinutes());
                      setReminderDate(newDate);
                    }
                  }}
                />
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      {/* Celebration Modal */}
      <CelebrationModal
        visible={celebrationVisible}
        onClose={() => setCelebrationVisible(false)}
        taskTitle={completedTaskTitle}
      />
      </SafeAreaView>
    </View>
  );
};

export default TasksScreen;
