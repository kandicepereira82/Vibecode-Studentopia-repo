import React, { useState, useEffect, useRef } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Audio } from "expo-av";
import useUserStore from "../state/userStore";
import useStatsStore from "../state/statsStore";
import useTimerStore from "../state/timerStore";
import { useTranslation } from "../utils/translations";
import { getTheme } from "../utils/themes";
import { TimerMode } from "../types";
import { cn } from "../utils/cn";

const TimerScreen = () => {
  const user = useUserStore((s) => s.user);
  const addStudyMinutes = useStatsStore((s) => s.addStudyMinutes);

  // Timer store
  const mode = useTimerStore((s) => s.mode);
  const minutes = useTimerStore((s) => s.minutes);
  const seconds = useTimerStore((s) => s.seconds);
  const isRunning = useTimerStore((s) => s.isRunning);
  const studyDuration = useTimerStore((s) => s.studyDuration);
  const breakDuration = useTimerStore((s) => s.breakDuration);
  const setMode = useTimerStore((s) => s.setMode);
  const setMinutes = useTimerStore((s) => s.setMinutes);
  const setSeconds = useTimerStore((s) => s.setSeconds);
  const setIsRunning = useTimerStore((s) => s.setIsRunning);
  const setStudyDuration = useTimerStore((s) => s.setStudyDuration);
  const setBreakDuration = useTimerStore((s) => s.setBreakDuration);
  const startTimer = useTimerStore((s) => s.startTimer);
  const pauseTimer = useTimerStore((s) => s.pauseTimer);
  const stopTimer = useTimerStore((s) => s.stopTimer);
  const decrementTime = useTimerStore((s) => s.decrementTime);

  const [musicEnabled, setMusicEnabled] = useState(false);

  const { t } = useTranslation(user?.language || "en");
  const theme = getTheme(user?.themeColor);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        const state = useTimerStore.getState();

        // Check if timer is complete BEFORE decrementing
        if (state.minutes === 0 && state.seconds === 0) {
          handleTimerComplete();
          return;
        }

        decrementTime();
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
    pauseTimer();
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

  const handleModeSwitch = (newMode: TimerMode) => {
    setMode(newMode);
    pauseTimer();
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
              style={{
                paddingVertical: 16,
                borderRadius: 24,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: mode === "study" ? 0.15 : 0.05,
                shadowRadius: 8,
                elevation: mode === "study" ? 4 : 2
              }}
            >
              <Ionicons
                name="book"
                size={28}
                color={mode === "study" ? "white" : "#6B7280"}
              />
              <Text
                style={{
                  fontFamily: 'Poppins_600SemiBold',
                  fontSize: 14,
                  marginTop: 8,
                  color: mode === "study" ? "white" : "#6B7280"
                }}
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
              style={{
                paddingVertical: 16,
                borderRadius: 24,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: mode === "break" ? 0.15 : 0.05,
                shadowRadius: 8,
                elevation: mode === "break" ? 4 : 2
              }}
            >
              <Ionicons
                name="cafe"
                size={28}
                color={mode === "break" ? "white" : "#6B7280"}
              />
              <Text
                style={{
                  fontFamily: 'Poppins_600SemiBold',
                  fontSize: 14,
                  marginTop: 8,
                  color: mode === "break" ? "white" : "#6B7280"
                }}
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
            <View style={{ width: 320, height: 320, alignItems: 'center', justifyContent: 'center' }}>
              <LinearGradient
                colors={modeColors}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: 160,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0.1
                }}
              />
              <View style={{
                position: 'absolute',
                width: 280,
                height: 280,
                borderRadius: 140,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.cardBackground,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 6
              }}>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="clip"
                  style={{
                    fontSize: 64,
                    fontFamily: 'Poppins_700Bold',
                    letterSpacing: 2,
                    color: theme.textPrimary,
                    textAlign: 'center'
                  }}>
                  {`${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`}
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: 'Poppins_500Medium',
                    marginTop: 8,
                    color: modeColors[0]
                  }}
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
              onPress={startTimer}
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
                onPress={pauseTimer}
                className="w-20 h-20 rounded-full items-center justify-center shadow-lg"
              >
                <LinearGradient
                  colors={[theme.accentColor, theme.primaryDark]}
                  className="w-full h-full rounded-full items-center justify-center"
                >
                  <Ionicons name="pause" size={36} color="white" />
                </LinearGradient>
              </Pressable>
              <Pressable
                onPress={stopTimer}
                className="w-16 h-16 rounded-full items-center justify-center shadow-lg"
                style={{ backgroundColor: theme.textSecondary }}
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
