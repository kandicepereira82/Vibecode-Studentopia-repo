import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, Modal, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay, isToday, addMonths, subMonths, startOfWeek, endOfWeek, addWeeks, subWeeks } from "date-fns";
import useUserStore from "../state/userStore";
import useTaskStore from "../state/taskStore";
import { useTranslation } from "../utils/translations";
import { getTheme } from "../utils/themes";
import { TaskCategory } from "../types";
import { cn } from "../utils/cn";
import ClickableCompanion from "../components/ClickableCompanion";
import { useGlobalToast } from "../context/ToastContext";

const CalendarScreen = () => {
  const user = useUserStore((s) => s.user);
  const tasks = useTaskStore((s) => s.tasks);
  const addTask = useTaskStore((s) => s.addTask);
  const toast = useGlobalToast();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week">("month");

  // Task creation modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TaskCategory>("homework");
  const [taskDate, setTaskDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Explanation modal state
  const [showExplanation, setShowExplanation] = useState(false);

  // Double tap detection
  const [lastTap, setLastTap] = useState<{ date: string; time: number } | null>(null);

  const { t } = useTranslation(user?.language || "en");
  const theme = getTheme(user?.themeColor);

  // Month view data
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startDayOfWeek = monthStart.getDay();
  const emptyDays = Array(startDayOfWeek).fill(null);

  // Week view data
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const handlePrevious = () => {
    if (viewMode === "month") {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(subWeeks(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === "month") {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addWeeks(currentDate, 1));
    }
  };

  const handleDateTap = (date: Date) => {
    const now = Date.now();
    const dateString = date.toISOString();
    const DOUBLE_TAP_DELAY = 300; // milliseconds

    if (lastTap && lastTap.date === dateString && now - lastTap.time < DOUBLE_TAP_DELAY) {
      // Double tap detected - open task creation modal
      setLastTap(null);
      setTaskDate(date);
      setTitle("");
      setDescription("");
      setCategory("homework");
      setModalVisible(true);
    } else {
      // Single tap - just select the date to view tasks
      setLastTap({ date: dateString, time: now });
      setSelectedDate(date);
    }
  };

  const getTasksForWeek = () => {
    return tasks.filter((task) => {
      // Filter by user ID first
      if (task.userId !== user?.id) return false;

      const taskDateObj = new Date(task.dueDate);
      return taskDateObj >= weekStart && taskDateObj <= weekEnd;
    }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  };

  const handleSaveTask = () => {
    if (!title.trim()) {
      toast.error("Task title is required");
      return;
    }

    addTask({
      userId: user?.id || "default",
      title,
      description,
      category,
      dueDate: taskDate,
    });

    toast.success("Task added to calendar");
    setModalVisible(false);
    setTitle("");
    setDescription("");
  };

  const getTasksForDate = (date: Date) => {
    return tasks.filter((task) => {
      // Filter by user ID first
      if (task.userId !== user?.id) return false;

      const taskDateObj = new Date(task.dueDate);
      return isSameDay(taskDateObj, date);
    });
  };

  const selectedDateTasks = getTasksForDate(selectedDate);

  return (
    <View style={{ flex: 1, backgroundColor: theme.backgroundGradient[0] }}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header with Poppins */}
        <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Text style={{
              fontSize: 32,
              fontFamily: 'Poppins_700Bold',
              color: theme.textPrimary
            }}>
              {t("calendar")}
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
            onPress={() => setShowExplanation(true)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'white',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 4,
              elevation: 2
            }}
          >
            <Ionicons name="help-circle-outline" size={24} color={theme.primary} />
          </Pressable>
        </View>

      {/* View Mode Toggle */}
      <View style={{ paddingHorizontal: 24, paddingVertical: 12, flexDirection: 'row', gap: 8 }}>
        <Pressable
          onPress={() => setViewMode("month")}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: 16,
            alignItems: 'center',
            backgroundColor: viewMode === "month" ? theme.primary : 'white',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 1
          }}
        >
          <Text
            style={{
              fontFamily: 'Poppins_600SemiBold',
              fontSize: 14,
              color: viewMode === "month" ? "white" : theme.textSecondary
            }}
          >
            Month
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setViewMode("week")}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: 16,
            alignItems: 'center',
            backgroundColor: viewMode === "week" ? theme.primary : 'white',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 1
          }}
        >
          <Text
            style={{
              fontFamily: 'Poppins_600SemiBold',
              fontSize: 14,
              color: viewMode === "week" ? "white" : theme.textSecondary
            }}
          >
            Week
          </Text>
        </Pressable>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Month/Year Header */}
        <View style={{ paddingHorizontal: 24, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Pressable onPress={handlePrevious} style={{ padding: 8 }}>
            <Ionicons name="chevron-back" size={24} color={theme.textPrimary} />
          </Pressable>
          <Text style={{ fontSize: 20, fontFamily: 'Poppins_700Bold', color: theme.textPrimary }}>
            {viewMode === "month" ? format(currentDate, "MMMM yyyy") : `Week of ${format(weekStart, "MMM d")}`}
          </Text>
          <Pressable onPress={handleNext} style={{ padding: 8 }}>
            <Ionicons name="chevron-forward" size={24} color={theme.textPrimary} />
          </Pressable>
        </View>

        {/* Calendar Grid - Conditional rendering based on view mode */}
        <View style={{ paddingHorizontal: 24 }}>
          <View style={{
            backgroundColor: 'white',
            borderRadius: 24,
            padding: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 2
          }}>
            {viewMode === "month" ? (
              <>
                {/* Day Headers */}
                <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                  {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                    <View key={index} style={{ flex: 1, alignItems: 'center' }}>
                      <Text style={{ fontSize: 12, fontFamily: 'Poppins_600SemiBold', color: theme.textSecondary }}>
                        {day}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Days Grid */}
                <View className="flex-row flex-wrap">
                  {emptyDays.map((_, index) => (
                    <View key={`empty-${index}`} className="w-[14.28%] aspect-square p-1" />
                  ))}
                  {daysInMonth.map((day) => {
                    const dayTasks = getTasksForDate(day);
                    const hasCompletedTasks = dayTasks.some(t => t.status === "completed");
                    const hasPendingTasks = dayTasks.some(t => t.status === "pending");
                    const isSelected = isSameDay(day, selectedDate);
                    const isTodayDate = isToday(day);

                    return (
                      <Pressable
                        key={day.toString()}
                        onPress={() => handleDateTap(day)}
                        className="w-[14.28%] aspect-square p-1"
                      >
                        <View
                          className={cn(
                            "flex-1 items-center justify-center rounded-lg"
                          )}
                          style={{
                            backgroundColor: isSelected ? theme.primary : undefined,
                            borderWidth: isTodayDate && !isSelected ? 2 : 0,
                            borderColor: isTodayDate && !isSelected ? theme.primary : undefined,
                          }}
                        >
                          <Text
                            className="text-sm font-medium"
                            style={{ color: isSelected ? "white" : theme.textPrimary }}
                          >
                            {format(day, "d")}
                          </Text>
                          {dayTasks.length > 0 && (
                            <View className="flex-row gap-0.5 mt-0.5">
                              {hasPendingTasks && (
                                <View
                                  className="w-1 h-1 rounded-full"
                                  style={{ backgroundColor: isSelected ? "white" : theme.accentColor }}
                                />
                              )}
                              {hasCompletedTasks && (
                                <View
                                  className="w-1 h-1 rounded-full"
                                  style={{ backgroundColor: isSelected ? "white" : theme.secondary }}
                                />
                              )}
                            </View>
                          )}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            ) : (
              /* Week View */
              <>
                {/* Day Headers for Week */}
                <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
                    <View key={index} style={{ flex: 1, alignItems: 'center' }}>
                      <Text style={{ fontSize: 11, fontFamily: 'Poppins_600SemiBold', color: theme.textSecondary }}>
                        {day}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Week Days */}
                <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                  {daysInWeek.map((day) => {
                    const dayTasks = getTasksForDate(day);
                    const isSelected = isSameDay(day, selectedDate);
                    const isTodayDate = isToday(day);

                    return (
                      <Pressable
                        key={day.toString()}
                        onPress={() => handleDateTap(day)}
                        style={{ flex: 1, alignItems: 'center', padding: 8 }}
                      >
                        <View
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 24,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: isSelected ? theme.primary : (isTodayDate ? theme.primary + '20' : '#F3F4F6')
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 16,
                              fontFamily: 'Poppins_600SemiBold',
                              color: isSelected ? 'white' : theme.textPrimary
                            }}
                          >
                            {format(day, "d")}
                          </Text>
                        </View>
                        {dayTasks.length > 0 && (
                          <View style={{ flexDirection: 'row', gap: 2, marginTop: 4 }}>
                            <View
                              style={{
                                width: 4,
                                height: 4,
                                borderRadius: 2,
                                backgroundColor: theme.accentColor
                              }}
                            />
                          </View>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}
          </View>
        </View>

        {/* Selected Date Tasks or Week Tasks */}
        <View className="px-6 py-4">
          {viewMode === "week" ? (
            <>
              <Text className="text-lg font-bold mb-3" style={{ color: theme.textPrimary, fontFamily: 'Poppins_700Bold' }}>
                Week of {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d")}
              </Text>
              {getTasksForWeek().length === 0 ? (
                <View className="rounded-2xl p-8 items-center" style={{ backgroundColor: 'white', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
                  <Ionicons name="calendar-outline" size={48} color={theme.textSecondary} />
                  <Text className="text-center mt-3" style={{ color: theme.textSecondary, fontFamily: 'Poppins_400Regular' }}>
                    No tasks scheduled for this week
                  </Text>
                </View>
              ) : (
                <View className="gap-3 pb-8">
                  {getTasksForWeek().map((task) => (
                    <View
                      key={task.id}
                      className="rounded-2xl p-4"
                      style={{ backgroundColor: 'white', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}
                    >
                      <View className="flex-row items-start">
                        <Ionicons
                          name={
                            task.status === "completed"
                              ? "checkmark-circle"
                              : "ellipse-outline"
                          }
                          size={24}
                          color={
                            task.status === "completed" ? theme.secondary : theme.textSecondary
                          }
                          style={{ marginRight: 12, marginTop: 2 }}
                        />
                        <View className="flex-1">
                          <Text
                            className={cn(
                              "text-base",
                              task.status === "completed" && "line-through"
                            )}
                            style={{ color: theme.textPrimary, fontFamily: 'Poppins_600SemiBold' }}
                          >
                            {task.title}
                          </Text>
                          {task.description && (
                            <Text className="text-sm mt-1" style={{ color: theme.textSecondary, fontFamily: 'Poppins_400Regular' }}>
                              {task.description}
                            </Text>
                          )}
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                            <Ionicons name="calendar-outline" size={14} color={theme.textSecondary} />
                            <Text className="text-xs" style={{ color: theme.textSecondary, marginLeft: 4, fontFamily: 'Poppins_400Regular' }}>
                              {format(new Date(task.dueDate), "EEE, MMM d")}
                            </Text>
                            <Text className="text-xs" style={{ color: theme.textSecondary, marginLeft: 8, fontFamily: 'Poppins_400Regular' }}>
                              • {new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                            <Text className="text-xs capitalize" style={{ color: theme.textSecondary, marginLeft: 8, fontFamily: 'Poppins_400Regular' }}>
                              • {t(task.category)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </>
          ) : (
            <>
              <Text className="text-lg font-bold mb-3" style={{ color: theme.textPrimary, fontFamily: 'Poppins_700Bold' }}>
                {format(selectedDate, "EEEE, MMMM d, yyyy")}
              </Text>
              {selectedDateTasks.length === 0 ? (
                <View className="rounded-2xl p-8 items-center" style={{ backgroundColor: 'white', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
                  <Ionicons name="calendar-outline" size={48} color={theme.textSecondary} />
                  <Text className="text-center mt-3" style={{ color: theme.textSecondary, fontFamily: 'Poppins_400Regular' }}>
                    No tasks scheduled for this day
                  </Text>
                </View>
              ) : (
                <View className="gap-3 pb-8">
                  {selectedDateTasks.map((task) => (
                    <View
                      key={task.id}
                      className="rounded-2xl p-4"
                      style={{ backgroundColor: 'white', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}
                    >
                      <View className="flex-row items-start">
                        <Ionicons
                          name={
                            task.status === "completed"
                              ? "checkmark-circle"
                              : "ellipse-outline"
                          }
                          size={24}
                          color={
                            task.status === "completed" ? theme.secondary : theme.textSecondary
                          }
                          style={{ marginRight: 12, marginTop: 2 }}
                        />
                        <View className="flex-1">
                          <Text
                            className={cn(
                              "text-base",
                              task.status === "completed" && "line-through"
                            )}
                            style={{ color: theme.textPrimary, fontFamily: 'Poppins_600SemiBold' }}
                          >
                            {task.title}
                          </Text>
                          {task.description && (
                            <Text className="text-sm mt-1" style={{ color: theme.textSecondary, fontFamily: 'Poppins_400Regular' }}>
                              {task.description}
                            </Text>
                          )}
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                            <Text className="text-xs capitalize" style={{ color: theme.textSecondary, fontFamily: 'Poppins_400Regular' }}>
                              {t(task.category)}
                            </Text>
                            <Text className="text-xs" style={{ color: theme.textSecondary, marginLeft: 8, fontFamily: 'Poppins_400Regular' }}>
                              • {new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Add Task Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView className="flex-1" style={{ backgroundColor: theme.backgroundGradient[0] }}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1"
          >
            {/* Modal Header */}
            <View className="px-6 py-4 flex-row items-center justify-between" style={{ borderBottomWidth: 1, borderBottomColor: theme.textSecondary + "20" }}>
              <Pressable onPress={() => setModalVisible(false)}>
                <Text style={{ color: theme.primary }} className="text-lg">Cancel</Text>
              </Pressable>
              <Text className="text-xl font-bold" style={{ color: theme.textPrimary }}>
                Add Task
              </Text>
              <Pressable onPress={handleSaveTask}>
                <Text style={{ color: theme.primary }} className="text-lg font-semibold">
                  Save
                </Text>
              </Pressable>
            </View>

            <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
              {/* Title */}
              <View className="mb-4">
                <Text className="text-sm font-medium mb-2" style={{ color: theme.textSecondary }}>
                  Task Title
                </Text>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Enter task title"
                  placeholderTextColor={theme.textSecondary}
                  className="rounded-xl px-4 py-3 text-base"
                  style={{ backgroundColor: 'white', color: theme.textPrimary }}
                />
              </View>

              {/* Description */}
              <View className="mb-4">
                <Text className="text-sm font-medium mb-2" style={{ color: theme.textSecondary }}>
                  Description (Optional)
                </Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Enter description"
                  placeholderTextColor={theme.textSecondary}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  className="rounded-xl px-4 py-3 text-base min-h-[100px]"
                  style={{ backgroundColor: 'white', color: theme.textPrimary }}
                />
              </View>

              {/* Category */}
              <View className="mb-4">
                <Text className="text-sm font-medium mb-2" style={{ color: theme.textSecondary }}>
                  Category
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {(["homework", "project", "exam", "other"] as TaskCategory[]).map((cat) => (
                    <Pressable
                      key={cat}
                      onPress={() => setCategory(cat)}
                      className="px-4 py-2 rounded-xl"
                      style={{ backgroundColor: category === cat ? theme.primary : 'white' }}
                    >
                      <Text
                        className="font-medium capitalize"
                        style={{ color: category === cat ? "white" : theme.textSecondary }}
                      >
                        {t(cat)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Due Date */}
              <View className="mb-4">
                <Text className="text-sm font-medium mb-2" style={{ color: theme.textSecondary }}>
                  Due Date
                </Text>
                <Pressable
                  onPress={() => setShowDatePicker(true)}
                  className="rounded-xl px-4 py-3 flex-row items-center justify-between"
                  style={{ backgroundColor: 'white' }}
                >
                  <Text className="text-base" style={{ color: theme.textPrimary }}>
                    {taskDate.toLocaleDateString()}
                  </Text>
                  <Ionicons name="calendar-outline" size={20} color={theme.textSecondary} />
                </Pressable>
              </View>

              {/* Due Time */}
              <View className="mb-4">
                <Text className="text-sm font-medium mb-2" style={{ color: theme.textSecondary }}>
                  Due Time
                </Text>
                <Pressable
                  onPress={() => setShowTimePicker(true)}
                  className="rounded-xl px-4 py-3 flex-row items-center justify-between"
                  style={{ backgroundColor: 'white' }}
                >
                  <Text className="text-base" style={{ color: theme.textPrimary }}>
                    {taskDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  <Ionicons name="time-outline" size={20} color={theme.textSecondary} />
                </Pressable>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={taskDate}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      const newDate = new Date(selectedDate);
                      newDate.setHours(taskDate.getHours());
                      newDate.setMinutes(taskDate.getMinutes());
                      setTaskDate(newDate);
                    }
                  }}
                />
              )}

              {showTimePicker && (
                <DateTimePicker
                  value={taskDate}
                  mode="time"
                  display="default"
                  onChange={(event, selectedTime) => {
                    setShowTimePicker(false);
                    if (selectedTime) {
                      const newDate = new Date(taskDate);
                      newDate.setHours(selectedTime.getHours());
                      newDate.setMinutes(selectedTime.getMinutes());
                      setTaskDate(newDate);
                    }
                  }}
                />
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      {/* Explanation Modal */}
      <Modal
        visible={showExplanation}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowExplanation(false)}
      >
        <SafeAreaView className="flex-1" style={{ backgroundColor: theme.backgroundGradient[0] }}>
          {/* Modal Header */}
          <View className="px-6 py-4 flex-row items-center justify-between" style={{ borderBottomWidth: 1, borderBottomColor: theme.textSecondary + "20" }}>
            <View style={{ width: 60 }} />
            <Text className="text-xl" style={{ color: theme.textPrimary, fontFamily: 'Poppins_700Bold' }}>
              How to Use Calendar
            </Text>
            <Pressable onPress={() => setShowExplanation(false)}>
              <Ionicons name="close" size={28} color={theme.textPrimary} />
            </Pressable>
          </View>

          <ScrollView className="flex-1 px-6 py-6" showsVerticalScrollIndicator={false}>
            {/* Month View */}
            <View className="mb-6">
              <View className="flex-row items-center mb-3">
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  <Ionicons name="calendar" size={20} color="white" />
                </View>
                <Text className="text-lg" style={{ color: theme.textPrimary, fontFamily: 'Poppins_600SemiBold' }}>
                  Month View
                </Text>
              </View>
              <View className="rounded-2xl p-4 mb-3" style={{ backgroundColor: 'white', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
                <Text className="text-base mb-2" style={{ color: theme.textPrimary, fontFamily: 'Poppins_600SemiBold' }}>
                  • Single Tap
                </Text>
                <Text className="text-sm" style={{ color: theme.textSecondary, fontFamily: 'Poppins_400Regular' }}>
                  Tap once on any date to view all tasks scheduled for that specific day. The tasks will appear below the calendar.
                </Text>
              </View>
              <View className="rounded-2xl p-4" style={{ backgroundColor: 'white', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
                <Text className="text-base mb-2" style={{ color: theme.textPrimary, fontFamily: 'Poppins_600SemiBold' }}>
                  • Double Tap
                </Text>
                <Text className="text-sm" style={{ color: theme.textSecondary, fontFamily: 'Poppins_400Regular' }}>
                  Quickly tap twice on any date to create a new task for that day. A task creation form will appear.
                </Text>
              </View>
            </View>

            {/* Week View */}
            <View className="mb-6">
              <View className="flex-row items-center mb-3">
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.secondary, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  <Ionicons name="calendar-outline" size={20} color="white" />
                </View>
                <Text className="text-lg" style={{ color: theme.textPrimary, fontFamily: 'Poppins_600SemiBold' }}>
                  Week View
                </Text>
              </View>
              <View className="rounded-2xl p-4 mb-3" style={{ backgroundColor: 'white', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
                <Text className="text-base mb-2" style={{ color: theme.textPrimary, fontFamily: 'Poppins_600SemiBold' }}>
                  • View All Week Tasks
                </Text>
                <Text className="text-sm" style={{ color: theme.textSecondary, fontFamily: 'Poppins_400Regular' }}>
                  See all tasks for the entire week listed below the calendar, sorted by date and time. Perfect for planning your week ahead!
                </Text>
              </View>
              <View className="rounded-2xl p-4 mb-3" style={{ backgroundColor: 'white', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
                <Text className="text-base mb-2" style={{ color: theme.textPrimary, fontFamily: 'Poppins_600SemiBold' }}>
                  • Navigate Weeks
                </Text>
                <Text className="text-sm" style={{ color: theme.textSecondary, fontFamily: 'Poppins_400Regular' }}>
                  Use the left and right arrows to move between weeks and see your upcoming tasks.
                </Text>
              </View>
              <View className="rounded-2xl p-4" style={{ backgroundColor: 'white', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
                <Text className="text-base mb-2" style={{ color: theme.textPrimary, fontFamily: 'Poppins_600SemiBold' }}>
                  • Single/Double Tap
                </Text>
                <Text className="text-sm" style={{ color: theme.textSecondary, fontFamily: 'Poppins_400Regular' }}>
                  Same as month view - single tap to view tasks for a day, double tap to create a new task.
                </Text>
              </View>
            </View>

            {/* Task Indicators */}
            <View className="mb-6">
              <View className="flex-row items-center mb-3">
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.accentColor, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  <Ionicons name="ellipse" size={20} color="white" />
                </View>
                <Text className="text-lg" style={{ color: theme.textPrimary, fontFamily: 'Poppins_600SemiBold' }}>
                  Task Indicators
                </Text>
              </View>
              <View className="rounded-2xl p-4" style={{ backgroundColor: 'white', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
                <Text className="text-sm" style={{ color: theme.textSecondary, fontFamily: 'Poppins_400Regular' }}>
                  Small colored dots appear below dates that have tasks scheduled. This helps you quickly see which days are busy at a glance.
                </Text>
              </View>
            </View>

            {/* Tips */}
            <View className="mb-8">
              <View className="flex-row items-center mb-3">
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFB800', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  <Ionicons name="bulb" size={20} color="white" />
                </View>
                <Text className="text-lg" style={{ color: theme.textPrimary, fontFamily: 'Poppins_600SemiBold' }}>
                  Pro Tips
                </Text>
              </View>
              <View className="rounded-2xl p-4" style={{ backgroundColor: 'white', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
                <Text className="text-sm mb-3" style={{ color: theme.textSecondary, fontFamily: 'Poppins_400Regular' }}>
                  • Switch between Month and Week views using the toggle buttons at the top
                </Text>
                <Text className="text-sm mb-3" style={{ color: theme.textSecondary, fontFamily: 'Poppins_400Regular' }}>
                  {"• Today's date is highlighted with a special border"}
                </Text>
                <Text className="text-sm" style={{ color: theme.textSecondary, fontFamily: 'Poppins_400Regular' }}>
                  • Each task shows its category, date, and time for easy reference
                </Text>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
      </SafeAreaView>
    </View>
  );
};

export default CalendarScreen;
