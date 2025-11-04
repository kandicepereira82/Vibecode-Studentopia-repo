import React, { useState, useEffect, useRef } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Audio } from "expo-av";
import useUserStore from "../state/userStore";
import useStatsStore from "../state/statsStore";
import { useTranslation } from "../utils/translations";
import { getTheme } from "../utils/themes";
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
  const theme = getTheme(user?.themeColor);
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
    ? [theme.primary, theme.primaryDark]
    : [theme.secondary, theme.primaryDark];

  return (
    <View style={{ flex: 1, backgroundColor: theme.backgroundGradient[0] }}>
      <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header with Poppins */}
        <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
          <Text style={{
            fontSize: 32,
            fontFamily: 'Poppins_700Bold',
            color: theme.textPrimary
          }}>
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
              <View className="absolute w-64 h-64 rounded-full items-center justify-center" style={{ backgroundColor: theme.cardBackground }}>
                <Text className="text-6xl font-bold" style={{ letterSpacing: 4, color: theme.textPrimary }}>
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
        <View style={{ paddingHorizontal: 24, paddingVertical: 24 }}>
          <View style={{
            backgroundColor: 'white',
            borderRadius: 24,
            padding: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 2
          }}>
            <Text style={{ fontSize: 18, fontFamily: 'Poppins_700Bold', marginBottom: 16, color: theme.textPrimary }}>
              {t("settings")}
            </Text>

            {/* Study Duration */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontFamily: 'Poppins_500Medium', marginBottom: 8, color: theme.textSecondary }}>
                {t("studySession")} ({t("minutes")})
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Pressable
                  onPress={() => adjustDuration("study", -5)}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: theme.primary + "20"
                  }}
                >
                  <Ionicons name="remove" size={24} color={theme.primary} />
                </Pressable>
                <Text style={{ fontSize: 32, fontFamily: 'Poppins_700Bold', color: theme.textPrimary }}>
                  {studyDuration}
                </Text>
                <Pressable
                  onPress={() => adjustDuration("study", 5)}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: theme.primary + "20"
                  }}
                >
                  <Ionicons name="add" size={24} color={theme.primary} />
                </Pressable>
              </View>
            </View>

            {/* Break Duration */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontFamily: 'Poppins_500Medium', marginBottom: 8, color: theme.textSecondary }}>
                {t("breakTime")} ({t("minutes")})
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Pressable
                  onPress={() => adjustDuration("break", -1)}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: theme.secondary + "20"
                  }}
                >
                  <Ionicons name="remove" size={24} color={theme.secondary} />
                </Pressable>
                <Text style={{ fontSize: 32, fontFamily: 'Poppins_700Bold', color: theme.textPrimary }}>
                  {breakDuration}
                </Text>
                <Pressable
                  onPress={() => adjustDuration("break", 1)}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: theme.secondary + "20"
                  }}
                >
                  <Ionicons name="add" size={24} color={theme.secondary} />
                </Pressable>
              </View>
            </View>

            {/* Background Music Toggle */}
            <View className="flex-row items-center justify-between pt-4" style={{ borderTopWidth: 1, borderTopColor: theme.textSecondary + "20" }}>
              <View className="flex-row items-center">
                <Ionicons name="musical-notes" size={20} color={theme.textSecondary} />
                <Text className="ml-2 text-base" style={{ color: theme.textPrimary }}>
                  {t("backgroundMusic")}
                </Text>
              </View>
              <Pressable
                onPress={() => setMusicEnabled(!musicEnabled)}
                className="w-12 h-7 rounded-full justify-center px-1"
                style={{ backgroundColor: musicEnabled ? theme.secondary : theme.textSecondary + "50" }}
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
    </View>
  );
};

export default TimerScreen;
