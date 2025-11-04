import React, { useState, useEffect, useRef } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Audio } from "expo-av";
import useUserStore from "../state/userStore";
import useStatsStore from "../state/statsStore";
import { useTranslation } from "../utils/translations";
import { TimerMode } from "../types";
import { cn } from "../utils/cn";

const TimerScreen = () => {
  const user = useUserStore((s) => s.user);
  const addStudyMinutes = useStatsStore((s) => s.addStudyMinutes);

  const [mode, setMode] = useState<TimerMode>("study");
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [studyDuration, setStudyDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [musicEnabled, setMusicEnabled] = useState(false);

  const { t } = useTranslation(user?.language || "en");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev === 0) {
            setMinutes((prevMin) => {
              if (prevMin === 0) {
                handleTimerComplete();
                return 0;
              }
              return prevMin - 1;
            });
            return 59;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    if (mode === "study") {
      addStudyMinutes(studyDuration);
      setMode("break");
      setMinutes(breakDuration);
      setSeconds(0);
    } else {
      setMode("study");
      setMinutes(studyDuration);
      setSeconds(0);
    }
  };

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStop = () => {
    setIsRunning(false);
    setMinutes(mode === "study" ? studyDuration : breakDuration);
    setSeconds(0);
  };

  const handleModeSwitch = (newMode: TimerMode) => {
    setMode(newMode);
    setIsRunning(false);
    setMinutes(newMode === "study" ? studyDuration : breakDuration);
    setSeconds(0);
  };

  const adjustDuration = (type: "study" | "break", change: number) => {
    if (type === "study") {
      const newDuration = Math.max(1, Math.min(120, studyDuration + change));
      setStudyDuration(newDuration);
      if (mode === "study" && !isRunning) {
        setMinutes(newDuration);
      }
    } else {
      const newDuration = Math.max(1, Math.min(60, breakDuration + change));
      setBreakDuration(newDuration);
      if (mode === "break" && !isRunning) {
        setMinutes(newDuration);
      }
    }
  };

  const progress = mode === "study"
    ? ((studyDuration * 60 - (minutes * 60 + seconds)) / (studyDuration * 60)) * 100
    : ((breakDuration * 60 - (minutes * 60 + seconds)) / (breakDuration * 60)) * 100;

  const modeColors: [string, string] = mode === "study"
    ? ["#10B981", "#059669"]
    : ["#3B82F6", "#1D4ED8"];

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 pt-4 pb-2">
          <Text className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            {t("timer")}
          </Text>
        </View>

        {/* Mode Toggle */}
        <View className="px-6 py-4 flex-row gap-3">
          <Pressable
            onPress={() => handleModeSwitch("study")}
            className="flex-1"
          >
            <LinearGradient
              colors={mode === "study" ? ["#10B981", "#059669"] : ["#E5E7EB", "#D1D5DB"]}
              className="py-4 rounded-2xl items-center"
            >
              <Ionicons
                name="book"
                size={24}
                color={mode === "study" ? "white" : "#6B7280"}
              />
              <Text
                className={cn(
                  "font-semibold mt-2",
                  mode === "study" ? "text-white" : "text-gray-600"
                )}
              >
                {t("studySession")}
              </Text>
            </LinearGradient>
          </Pressable>

          <Pressable
            onPress={() => handleModeSwitch("break")}
            className="flex-1"
          >
            <LinearGradient
              colors={mode === "break" ? ["#3B82F6", "#1D4ED8"] : ["#E5E7EB", "#D1D5DB"]}
              className="py-4 rounded-2xl items-center"
            >
              <Ionicons
                name="cafe"
                size={24}
                color={mode === "break" ? "white" : "#6B7280"}
              />
              <Text
                className={cn(
                  "font-semibold mt-2",
                  mode === "break" ? "text-white" : "text-gray-600"
                )}
              >
                {t("breakTime")}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>

        {/* Timer Display */}
        <View className="px-6 py-8 items-center">
          <View className="relative items-center justify-center">
            {/* Progress Circle */}
            <View className="w-72 h-72 items-center justify-center">
              <LinearGradient
                colors={modeColors}
                className="w-full h-full rounded-full items-center justify-center"
                style={{ opacity: 0.1 }}
              />
              <View className="absolute w-64 h-64 bg-white dark:bg-gray-800 rounded-full items-center justify-center">
                <Text className="text-6xl font-bold text-gray-800 dark:text-gray-100" style={{ letterSpacing: 4 }}>
                  {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                </Text>
                <Text
                  className="text-base font-medium mt-2"
                  style={{ color: modeColors[0] }}
                >
                  {mode === "study" ? t("studySession") : t("breakTime")}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Controls */}
        <View className="px-6 py-4 flex-row items-center justify-center gap-4">
          {!isRunning ? (
            <Pressable
              onPress={handleStart}
              className="w-20 h-20 rounded-full items-center justify-center shadow-lg"
            >
              <LinearGradient
                colors={modeColors}
                className="w-full h-full rounded-full items-center justify-center"
              >
                <Ionicons name="play" size={36} color="white" />
              </LinearGradient>
            </Pressable>
          ) : (
            <>
              <Pressable
                onPress={handlePause}
                className="w-20 h-20 rounded-full items-center justify-center shadow-lg"
              >
                <LinearGradient
                  colors={["#F97316", "#EA580C"]}
                  className="w-full h-full rounded-full items-center justify-center"
                >
                  <Ionicons name="pause" size={36} color="white" />
                </LinearGradient>
              </Pressable>
              <Pressable
                onPress={handleStop}
                className="w-16 h-16 bg-red-500 rounded-full items-center justify-center shadow-lg"
              >
                <Ionicons name="stop" size={28} color="white" />
              </Pressable>
            </>
          )}
        </View>

        {/* Duration Settings */}
        <View className="px-6 py-6">
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-5">
            <Text className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
              {t("settings")}
            </Text>

            {/* Study Duration */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("studySession")} ({t("minutes")})
              </Text>
              <View className="flex-row items-center justify-between">
                <Pressable
                  onPress={() => adjustDuration("study", -5)}
                  className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full items-center justify-center"
                >
                  <Ionicons name="remove" size={24} color="#6B7280" />
                </Pressable>
                <Text className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                  {studyDuration}
                </Text>
                <Pressable
                  onPress={() => adjustDuration("study", 5)}
                  className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full items-center justify-center"
                >
                  <Ionicons name="add" size={24} color="#6B7280" />
                </Pressable>
              </View>
            </View>

            {/* Break Duration */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("breakTime")} ({t("minutes")})
              </Text>
              <View className="flex-row items-center justify-between">
                <Pressable
                  onPress={() => adjustDuration("break", -1)}
                  className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full items-center justify-center"
                >
                  <Ionicons name="remove" size={24} color="#6B7280" />
                </Pressable>
                <Text className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                  {breakDuration}
                </Text>
                <Pressable
                  onPress={() => adjustDuration("break", 1)}
                  className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full items-center justify-center"
                >
                  <Ionicons name="add" size={24} color="#6B7280" />
                </Pressable>
              </View>
            </View>

            {/* Background Music Toggle */}
            <View className="flex-row items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <View className="flex-row items-center">
                <Ionicons name="musical-notes" size={20} color="#6B7280" />
                <Text className="ml-2 text-base text-gray-800 dark:text-gray-100">
                  {t("backgroundMusic")}
                </Text>
              </View>
              <Pressable
                onPress={() => setMusicEnabled(!musicEnabled)}
                className={cn(
                  "w-12 h-7 rounded-full justify-center px-1",
                  musicEnabled ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
                )}
              >
                <View
                  className={cn(
                    "w-5 h-5 rounded-full bg-white",
                    musicEnabled && "ml-auto"
                  )}
                />
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TimerScreen;
