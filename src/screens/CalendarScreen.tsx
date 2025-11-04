import React, { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay, isToday, addMonths, subMonths } from "date-fns";
import useUserStore from "../state/userStore";
import useTaskStore from "../state/taskStore";
import { useTranslation } from "../utils/translations";
import { getTheme } from "../utils/themes";
import { cn } from "../utils/cn";

const CalendarScreen = () => {
  const user = useUserStore((s) => s.user);
  const tasks = useTaskStore((s) => s.tasks);
  const getTasksByDate = useTaskStore((s) => s.getTasksByDate);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week">("month");

  const { t } = useTranslation(user?.language || "en");
  const theme = getTheme(user?.themeColor);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startDayOfWeek = monthStart.getDay();
  const emptyDays = Array(startDayOfWeek).fill(null);

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const getTasksForDate = (date: Date) => {
    return tasks.filter((task) => {
      const taskDate = new Date(task.dueDate);
      return isSameDay(taskDate, date);
    });
  };

  const selectedDateTasks = getTasksForDate(selectedDate);

  console.log("[CalendarScreen] Rendering. User:", user ? "exists" : "null");

  return (
    <View style={{ flex: 1, backgroundColor: theme.backgroundGradient[0] }}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header with Poppins */}
        <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
          <Text style={{
            fontSize: 32,
            fontFamily: 'Poppins_700Bold',
            color: theme.textPrimary
          }}>
            {t("calendar")}
          </Text>
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
          <Pressable onPress={handlePreviousMonth} style={{ padding: 8 }}>
            <Ionicons name="chevron-back" size={24} color={theme.textPrimary} />
          </Pressable>
          <Text style={{ fontSize: 20, fontFamily: 'Poppins_700Bold', color: theme.textPrimary }}>
            {format(currentDate, "MMMM yyyy")}
          </Text>
          <Pressable onPress={handleNextMonth} style={{ padding: 8 }}>
            <Ionicons name="chevron-forward" size={24} color={theme.textPrimary} />
          </Pressable>
        </View>

        {/* Calendar Grid */}
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
                    onPress={() => handleDateSelect(day)}
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
          </View>
        </View>

        {/* Selected Date Tasks */}
        <View className="px-6 py-4">
          <Text className="text-lg font-bold mb-3" style={{ color: theme.textPrimary }}>
            {format(selectedDate, "EEEE, MMMM d, yyyy")}
          </Text>
          {selectedDateTasks.length === 0 ? (
            <View className="rounded-2xl p-8 items-center" style={{ backgroundColor: theme.cardBackground }}>
              <Ionicons name="calendar-outline" size={48} color={theme.textSecondary} />
              <Text className="text-center mt-3" style={{ color: theme.textSecondary }}>
                No tasks scheduled for this day
              </Text>
            </View>
          ) : (
            <View className="gap-3 pb-8">
              {selectedDateTasks.map((task) => (
                <View
                  key={task.id}
                  className="rounded-2xl p-4"
                  style={{ backgroundColor: theme.cardBackground }}
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
                          "text-base font-semibold",
                          task.status === "completed" && "line-through"
                        )}
                        style={{ color: theme.textPrimary }}
                      >
                        {task.title}
                      </Text>
                      {task.description && (
                        <Text className="text-sm mt-1" style={{ color: theme.textSecondary }}>
                          {task.description}
                        </Text>
                      )}
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                        <Text className="text-xs capitalize" style={{ color: theme.textSecondary }}>
                          {t(task.category)}
                        </Text>
                        <Text className="text-xs" style={{ color: theme.textSecondary, marginLeft: 8 }}>
                          • {new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default CalendarScreen;
