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
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from "@react-native-community/datetimepicker";
import useUserStore from "../state/userStore";
import useTaskStore from "../state/taskStore";
import useStatsStore from "../state/statsStore";
import { useTranslation } from "../utils/translations";
import { getTheme } from "../utils/themes";
import { Task, TaskCategory } from "../types";
import { cn } from "../utils/cn";
import CelebrationModal from "../components/CelebrationModal";

const TasksScreen = () => {
  const user = useUserStore((s) => s.user);
  const tasks = useTaskStore((s) => s.tasks);
  const addTask = useTaskStore((s) => s.addTask);
  const updateTask = useTaskStore((s) => s.updateTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const toggleTaskStatus = useTaskStore((s) => s.toggleTaskStatus);
  const incrementTasksCompleted = useStatsStore((s) => s.incrementTasksCompleted);

  const [modalVisible, setModalVisible] = useState(false);
  const [celebrationVisible, setCelebrationVisible] = useState(false);
  const [completedTaskTitle, setCompletedTaskTitle] = useState("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TaskCategory>("homework");
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [filterCategory, setFilterCategory] = useState<TaskCategory | "all">("all");

  const { t } = useTranslation(user?.language || "en");
  const theme = getTheme(user?.themeColor);

  const openAddModal = () => {
    setEditingTask(null);
    setTitle("");
    setDescription("");
    setCategory("homework");
    setDueDate(new Date());
    setModalVisible(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setCategory(task.category);
    setDueDate(new Date(task.dueDate));
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!title.trim()) {
      return;
    }

    if (editingTask) {
      updateTask(editingTask.id, {
        title,
        description,
        category,
        dueDate,
      });
    } else {
      addTask({
        userId: user?.id || "default",
        title,
        description,
        category,
        dueDate,
      });
    }

    setModalVisible(false);
  };

  const handleDelete = (taskId: string) => {
    deleteTask(taskId);
  };

  const handleToggle = (task: Task) => {
    toggleTaskStatus(task.id);
    if (task.status === "pending") {
      incrementTasksCompleted();
      setCompletedTaskTitle(task.title);
      setCelebrationVisible(true);
    }
  };

  const getCategoryIcon = (cat: TaskCategory) => {
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

  const filteredTasks = filterCategory === "all"
    ? tasks
    : tasks.filter((t) => t.category === filterCategory);

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === "pending" ? -1 : 1;
    }
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  console.log("[TasksScreen] Rendering. User:", user ? "exists" : "null", "Tasks count:", tasks.length);

  return (
    <View style={{ flex: 1, backgroundColor: theme.backgroundGradient[0] }}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header with Poppins */}
        <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{
            fontSize: 32,
            fontFamily: 'Poppins_700Bold',
            color: theme.textPrimary
          }}>
            {t("tasks")}
          </Text>
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
      >
        <Pressable
          onPress={() => setFilterCategory("all")}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 20,
            marginRight: 8,
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
              paddingVertical: 10,
              borderRadius: 20,
              marginRight: 8,
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
                          name={getCategoryIcon(task.category) as any}
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
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="calendar-outline" size={14} color={theme.textSecondary} />
                        <Text style={{ fontSize: 12, fontFamily: 'Poppins_400Regular', marginLeft: 4, color: theme.textSecondary }}>
                          {new Date(task.dueDate).toLocaleDateString()}
                        </Text>
                      </View>
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

              {showDatePicker && (
                <DateTimePicker
                  value={dueDate}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      setDueDate(selectedDate);
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
