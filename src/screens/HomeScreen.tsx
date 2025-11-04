import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import StudyPal from "../components/StudyPal";
import useUserStore from "../state/userStore";
import useTaskStore from "../state/taskStore";
import useStatsStore from "../state/statsStore";
import { useTranslation } from "../utils/translations";
import { getRandomQuote, getRandomTip } from "../utils/content";
import { getTheme } from "../utils/themes";
import { MotivationalQuote, StudyTip, Task } from "../types";
import { cn } from "../utils/cn";

const HomeScreen = () => {
  const navigation = useNavigation();
  const user = useUserStore((s) => s.user);
  const tasks = useTaskStore((s) => s.tasks);
  const getTodayTasks = useTaskStore((s) => s.getTodayTasks);
  const getWeekTasks = useTaskStore((s) => s.getWeekTasks);
  const toggleTaskStatus = useTaskStore((s) => s.toggleTaskStatus);
  const stats = useStatsStore((s) => s.stats);

  const [quote, setQuote] = useState<MotivationalQuote | null>(null);
  const [tip, setTip] = useState<StudyTip | null>(null);

  const { t } = useTranslation(user?.language || "en");
  const theme = getTheme(user?.themeColor);

  useEffect(() => {
    if (user) {
      setQuote(getRandomQuote(user.language));
      setTip(getRandomTip(user.language));
    }
    console.log("[HomeScreen] Rendered. User:", user ? "exists" : "null");
  }, [user]);

  if (!user) {
    console.log("[HomeScreen] No user - showing fallback");
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: theme.backgroundGradient[0] }}>
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-2xl font-bold mb-4" style={{ color: theme.textPrimary }}>
            Welcome to StudyPal
          </Text>
          <Text className="text-center" style={{ color: theme.textSecondary }}>
            Please set up your profile to get started
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  console.log("[HomeScreen] User valid - rendering main content");

  const todayTasks = getTodayTasks();
  const weekTasks = getWeekTasks();
  const todayCompleted = todayTasks.filter((t) => t.status === "completed").length;
  const weekCompleted = weekTasks.filter((t) => t.status === "completed").length;

  const todayProgress = todayTasks.length > 0 ? (todayCompleted / todayTasks.length) * 100 : 0;
  const weekProgress = weekTasks.length > 0 ? (weekCompleted / weekTasks.length) * 100 : 0;

  const upcomingTasks = tasks
    .filter((t) => t.status === "pending")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  return (
    <LinearGradient
      colors={theme.backgroundGradient as [string, string, ...string[]]}
      className="flex-1"
    >
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="px-6 pt-2 pb-3">
          <Text className="text-2xl font-bold" style={{ color: theme.textPrimary }}>
            StudyPal
          </Text>
          <Text className="text-sm" style={{ color: theme.textSecondary }}>
            {t("welcomeBack")}, {user.username}!
          </Text>
        </View>

        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          {/* Today's Inspiration */}
          {quote && (
            <LinearGradient
              colors={[theme.primary, theme.primaryDark]}
              className="rounded-2xl p-5 mb-4"
            >
              <View className="flex-row items-center mb-2">
                <Ionicons name="sparkles" size={18} color="white" />
                <Text className="ml-2 text-sm font-semibold text-white uppercase">
                  {"Today's Inspiration"}
                </Text>
              </View>
              <Text className="text-base text-white italic mb-2">{quote.text}</Text>
              <Text className="text-sm text-white opacity-90">— {quote.author}</Text>
            </LinearGradient>
          )}

          {/* Main Content Row */}
          <View className="flex-row gap-4 mb-4">
            {/* Left Column - Tasks */}
            <View className="flex-1">
              {/* Your Tasks */}
              <View className="rounded-2xl p-4 mb-4" style={{ backgroundColor: theme.cardBackground }}>
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center">
                    <Ionicons name="checkbox-outline" size={20} style={{ color: theme.primary }} />
                    <Text className="ml-2 text-lg font-bold" style={{ color: theme.textPrimary }}>
                      Your Tasks
                    </Text>
                  </View>
                  <Pressable onPress={() => navigation.navigate("Tasks" as never)}>
                    <Text className="text-sm font-medium" style={{ color: theme.primary }}>
                      All Tasks
                    </Text>
                  </Pressable>
                </View>

                {todayTasks.length === 0 ? (
                  <Text className="text-sm text-center py-4" style={{ color: theme.textSecondary }}>
                    No tasks due today
                  </Text>
                ) : (
                  todayTasks.slice(0, 3).map((task) => (
                    <Pressable
                      key={task.id}
                      onPress={() => toggleTaskStatus(task.id)}
                      className="flex-row items-start py-2 border-b border-gray-100"
                    >
                      <Ionicons
                        name={task.status === "completed" ? "checkmark-circle" : "ellipse-outline"}
                        size={22}
                        style={{ color: task.status === "completed" ? theme.secondary : theme.textSecondary, marginRight: 8, marginTop: 2 }}
                      />
                      <View className="flex-1">
                        <Text
                          className={cn("text-base", task.status === "completed" && "line-through")}
                          style={{ color: theme.textPrimary }}
                        >
                          {task.title}
                        </Text>
                        <Text className="text-xs mt-1 capitalize" style={{ color: theme.textSecondary }}>
                          {task.category}
                        </Text>
                      </View>
                    </Pressable>
                  ))
                )}
              </View>

              {/* Upcoming Tasks */}
              <View className="rounded-2xl p-4 mb-4" style={{ backgroundColor: theme.cardBackground }}>
                <View className="flex-row items-center mb-3">
                  <Ionicons name="calendar-outline" size={18} style={{ color: theme.primary }} />
                  <Text className="ml-2 font-bold" style={{ color: theme.textPrimary }}>
                    Upcoming Tasks
                  </Text>
                </View>

                {upcomingTasks.length === 0 ? (
                  <Text className="text-sm text-center py-2" style={{ color: theme.textSecondary }}>
                    No upcoming tasks
                  </Text>
                ) : (
                  upcomingTasks.map((task) => (
                    <View key={task.id} className="py-2 border-b border-gray-100">
                      <Text className="text-sm font-medium" style={{ color: theme.textPrimary }}>
                        {task.title}
                      </Text>
                      <Text className="text-xs mt-1" style={{ color: theme.textSecondary }}>
                        {new Date(task.dueDate).toLocaleDateString()}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            </View>

            {/* Right Column - Study Pal & Goals */}
            <View className="w-[35%]">
              {/* Study Pal */}
              <View className="rounded-2xl p-4 mb-4 items-center" style={{ backgroundColor: theme.cardBackground }}>
                <StudyPal
                  animal={user.studyPalConfig.animal}
                  name={user.studyPalConfig.name}
                  animationsEnabled={user.studyPalConfig.animationsEnabled}
                  size={60}
                />
                <Text className="text-sm font-bold mt-2 text-center" style={{ color: theme.textPrimary }}>
                  {user.studyPalConfig.name}
                </Text>
                <Text className="text-xs text-center mt-1" style={{ color: theme.textSecondary }}>
                  Take a deep breath... 🌸
                </Text>
              </View>

              {/* Daily Goal */}
              <View className="rounded-2xl p-4 mb-4" style={{ backgroundColor: theme.cardBackground }}>
                <View className="flex-row items-center mb-2">
                  <Ionicons name="flag" size={16} style={{ color: theme.primary }} />
                  <Text className="ml-2 text-sm font-bold" style={{ color: theme.textPrimary }}>
                    Daily Goal
                  </Text>
                </View>
                <Text className="text-2xl font-bold text-center" style={{ color: theme.primary }}>
                  {todayCompleted}/{todayTasks.length}
                </Text>
                <Text className="text-xs text-center mt-1" style={{ color: theme.textSecondary }}>
                  tasks completed
                </Text>
                <View className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <View
                    className="h-full rounded-full"
                    style={{ width: `${todayProgress}%`, backgroundColor: theme.primary }}
                  />
                </View>
                <Text className="text-xs text-center mt-2 font-medium" style={{ color: theme.primary }}>
                  {Math.round(todayProgress)}%
                </Text>
              </View>

              {/* Weekly Goal */}
              <View className="rounded-2xl p-4" style={{ backgroundColor: theme.cardBackground }}>
                <View className="flex-row items-center mb-2">
                  <Ionicons name="trophy" size={16} style={{ color: theme.secondary }} />
                  <Text className="ml-2 text-sm font-bold" style={{ color: theme.textPrimary }}>
                    Weekly Goal
                  </Text>
                </View>
                <Text className="text-2xl font-bold text-center" style={{ color: theme.secondary }}>
                  {weekCompleted}/{weekTasks.length}
                </Text>
                <Text className="text-xs text-center mt-1" style={{ color: theme.textSecondary }}>
                  tasks completed
                </Text>
                <View className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <View
                    className="h-full rounded-full"
                    style={{ width: `${weekProgress}%`, backgroundColor: theme.secondary }}
                  />
                </View>
                <Text className="text-xs text-center mt-2 font-medium" style={{ color: theme.secondary }}>
                  {Math.round(weekProgress)}%
                </Text>
              </View>
            </View>
          </View>

          {/* Today's Progress Card */}
          <LinearGradient
            colors={theme.progressGradient as [string, string]}
            className="rounded-2xl p-5 mb-4"
          >
            <Text className="text-lg font-bold text-white mb-2">{"Today's Progress"}</Text>
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-sm text-white opacity-90">Completed Tasks</Text>
                <Text className="text-4xl font-bold text-white mt-1">
                  {todayCompleted}/{todayTasks.length > 0 ? todayTasks.length : "2"}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-5xl font-bold text-white opacity-90">
                  {Math.round(todayProgress)}%
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* Study Tip */}
          {tip && (
            <View className="rounded-2xl p-5 mb-6" style={{ backgroundColor: theme.cardBackground }}>
              <View className="flex-row items-center mb-2">
                <Ionicons name="bulb" size={20} style={{ color: theme.accentColor }} />
                <Text className="ml-2 text-sm font-semibold" style={{ color: theme.textPrimary }}>
                  Study Tip
                </Text>
              </View>
              <Text className="text-base font-bold mb-1" style={{ color: theme.textPrimary }}>
                {tip.title}
              </Text>
              <Text className="text-sm" style={{ color: theme.textSecondary }}>
                {tip.description}
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default HomeScreen;
