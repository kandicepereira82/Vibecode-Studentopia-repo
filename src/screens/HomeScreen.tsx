import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import StudyPal from "../components/StudyPal";
import useUserStore from "../state/userStore";
import useTaskStore from "../state/taskStore";
import useStatsStore from "../state/statsStore";
import { useTranslation } from "../utils/translations";
import { getRandomQuote, getRandomTip } from "../utils/content";
import { MotivationalQuote, StudyTip } from "../types";

const HomeScreen = () => {
  const user = useUserStore((s) => s.user);
  const tasks = useTaskStore((s) => s.tasks);
  const getTodayTasks = useTaskStore((s) => s.getTodayTasks);
  const getWeekTasks = useTaskStore((s) => s.getWeekTasks);
  const stats = useStatsStore((s) => s.stats);

  const [quote, setQuote] = useState<MotivationalQuote | null>(null);
  const [tip, setTip] = useState<StudyTip | null>(null);

  const { t } = useTranslation(user?.language || "en");

  useEffect(() => {
    if (user) {
      setQuote(getRandomQuote(user.language));
      setTip(getRandomTip(user.language));
    }
  }, [user]);

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            Welcome to StudyPal
          </Text>
          <Text className="text-center text-gray-600 dark:text-gray-400">
            Please set up your profile to get started
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const todayTasks = getTodayTasks();
  const weekTasks = getWeekTasks();
  const todayCompleted = todayTasks.filter((t) => t.status === "completed").length;
  const weekCompleted = weekTasks.filter((t) => t.status === "completed").length;

  const todayProgress = todayTasks.length > 0 ? (todayCompleted / todayTasks.length) * 100 : 0;
  const weekProgress = weekTasks.length > 0 ? (weekCompleted / weekTasks.length) * 100 : 0;

  const getThemeColors = (): [string, string] => {
    switch (user.themeColor) {
      case "nature":
        return ["#4CAF50", "#2E7D32"];
      case "ocean":
        return ["#0288D1", "#01579B"];
      case "sunset":
        return ["#FF6F00", "#E65100"];
      case "galaxy":
        return ["#5E35B1", "#311B92"];
      case "rainbow":
        return ["#FBC02D", "#F57F17"];
      case "forest":
        return ["#2E7D32", "#1B5E20"];
      case "desert":
        return ["#F57C00", "#E65100"];
      case "arctic":
        return ["#00796B", "#004D40"];
      case "autumn":
        return ["#E64A19", "#BF360C"];
      case "cherry":
        return ["#C2185B", "#880E4F"];
      default:
        return ["#4CAF50", "#2E7D32"];
    }
  };

  const themeColors = getThemeColors();

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 pt-4 pb-2">
          <Text className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            {t("welcomeBack")}, {user.username}!
          </Text>
        </View>

        {/* Study Pal */}
        <View className="px-6 py-4">
          <StudyPal
            animal={user.studyPalConfig.animal}
            name={user.studyPalConfig.name}
            animationsEnabled={user.studyPalConfig.animationsEnabled}
            size={100}
            message={quote?.text || "You are doing great!"}
          />
        </View>

        {/* Stats Cards */}
        <View className="px-6 py-4 flex-row gap-3">
          <View className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
            <View className="flex-row items-center justify-between mb-2">
              <Ionicons name="checkmark-circle" size={24} color={themeColors[0]} />
              <Text className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {stats?.totalTasksCompleted || 0}
              </Text>
            </View>
            <Text className="text-xs text-gray-600 dark:text-gray-400">
              {t("tasksCompleted")}
            </Text>
          </View>

          <View className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
            <View className="flex-row items-center justify-between mb-2">
              <Ionicons name="flame" size={24} color="#F97316" />
              <Text className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {stats?.currentStreak || 0}
              </Text>
            </View>
            <Text className="text-xs text-gray-600 dark:text-gray-400">
              {t("currentStreak")}
            </Text>
          </View>
        </View>

        {/* Today's Progress */}
        <View className="px-6 py-3">
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                {t("todayProgress")}
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                {todayCompleted}/{todayTasks.length}
              </Text>
            </View>
            <View className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <LinearGradient
                colors={themeColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ width: `${todayProgress}%`, height: "100%" }}
              />
            </View>
            {todayProgress === 100 && todayTasks.length > 0 && (
              <View className="mt-3 flex-row items-center">
                <Ionicons name="trophy" size={20} color="#F59E0B" />
                <Text className="ml-2 text-sm font-medium text-amber-600 dark:text-amber-400">
                  Amazing! You completed all tasks today!
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Weekly Progress */}
        <View className="px-6 py-3">
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                {t("weeklyProgress")}
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                {weekCompleted}/{weekTasks.length}
              </Text>
            </View>
            <View className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <LinearGradient
                colors={themeColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ width: `${weekProgress}%`, height: "100%" }}
              />
            </View>
          </View>
        </View>

        {/* Motivational Quote */}
        {quote && (
          <View className="px-6 py-3">
            <View className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-2xl p-5">
              <View className="flex-row items-center mb-2">
                <Ionicons name="sparkles" size={20} color="#A855F7" />
                <Text className="ml-2 text-sm font-semibold text-purple-700 dark:text-purple-300">
                  {t("motivationalQuote")}
                </Text>
              </View>
              <Text className="text-base italic text-gray-800 dark:text-gray-100 mb-2">
                {quote.text}
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                — {quote.author}
              </Text>
            </View>
          </View>
        )}

        {/* Study Tip */}
        {tip && (
          <View className="px-6 py-3 pb-8">
            <View className="bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 rounded-2xl p-5">
              <View className="flex-row items-center mb-2">
                <Ionicons name="bulb" size={20} color="#3B82F6" />
                <Text className="ml-2 text-sm font-semibold text-blue-700 dark:text-blue-300">
                  {t("studyTip")}
                </Text>
              </View>
              <Text className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-1">
                {tip.title}
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-300">
                {tip.description}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
