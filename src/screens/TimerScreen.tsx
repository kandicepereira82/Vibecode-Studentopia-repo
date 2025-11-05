import React, { useState, useEffect } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Audio } from "expo-av";
import Slider from "@react-native-community/slider";
import useUserStore from "../state/userStore";
import useStatsStore from "../state/statsStore";
import useTimerStore from "../state/timerStore";
import { useTranslation } from "../utils/translations";
import { getTheme } from "../utils/themes";
import { TimerMode } from "../types";
import { cn } from "../utils/cn";
import { musicService, musicLibrary, MusicTrack } from "../services/musicService";

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
  const setStudyDuration = useTimerStore((s) => s.setStudyDuration);
  const setBreakDuration = useTimerStore((s) => s.setBreakDuration);
  const startTimer = useTimerStore((s) => s.startTimer);
  const pauseTimer = useTimerStore((s) => s.pauseTimer);
  const stopTimer = useTimerStore((s) => s.stopTimer);

  const [musicEnabled, setMusicEnabled] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<MusicTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [showMusicSelector, setShowMusicSelector] = useState(false);

  const { t } = useTranslation(user?.language || "en");
  const theme = getTheme(user?.themeColor);

  // Initialize music service
  useEffect(() => {
    musicService.initializeAudio();

    // Update playback status every 500ms
    const interval = setInterval(async () => {
      if (musicEnabled) {
        const status = await musicService.getStatus();
        if (status && status.isLoaded) {
          setCurrentPosition(status.positionMillis);
          setDuration(status.durationMillis || 0);
          setIsPlaying(status.isPlaying);
        }
      }
    }, 500);

    return () => {
      clearInterval(interval);
      musicService.unload();
    };
  }, [musicEnabled]);

  // Watch for timer completion and handle mode switching
  useEffect(() => {
    if (minutes === 0 && seconds === 0 && !isRunning) {
      // Timer just completed
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
    }
  }, [minutes, seconds, isRunning]);

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

  const handlePlayPause = async () => {
    if (!selectedTrack) {
      setShowMusicSelector(true);
      return;
    }

    if (isPlaying) {
      await musicService.pause();
    } else {
      await musicService.play();
    }
  };

  const handleStop = async () => {
    await musicService.stop();
    setCurrentPosition(0);
  };

  const handleVolumeChange = async (value: number) => {
    setVolume(value);
    await musicService.setVolume(value);
  };

  const handleSelectTrack = async (track: MusicTrack) => {
    setSelectedTrack(track);
    // For demo purposes, we'll use a placeholder URL
    // In production, you would load actual music files
    const success = await musicService.loadTrack(track, "");
    if (success) {
      setShowMusicSelector(false);
      await musicService.play();
    }
  };

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
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
                <Text className="ml-2 text-base" style={{ color: theme.textPrimary, fontFamily: "Poppins_500Medium" }}>
                  Background Music
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

            {/* Music Player Section */}
            {musicEnabled && (
              <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: theme.textSecondary + "20" }}>
                {selectedTrack ? (
                  <>
                    {/* Now Playing */}
                    <View style={{ marginBottom: 12 }}>
                      <Text style={{ fontSize: 12, fontFamily: "Poppins_500Medium", color: theme.textSecondary, marginBottom: 4 }}>
                        Now Playing
                      </Text>
                      <Text style={{ fontSize: 16, fontFamily: "Poppins_600SemiBold", color: theme.textPrimary }}>
                        {selectedTrack.title}
                      </Text>
                      <Text style={{ fontSize: 12, fontFamily: "Poppins_400Regular", color: theme.textSecondary, marginTop: 2 }}>
                        {selectedTrack.artist}
                      </Text>
                    </View>

                    {/* Progress Bar */}
                    <View style={{ marginBottom: 12 }}>
                      <Slider
                        style={{ width: "100%", height: 40 }}
                        minimumValue={0}
                        maximumValue={duration}
                        value={currentPosition}
                        onSlidingComplete={async (value) => await musicService.seekTo(value)}
                        minimumTrackTintColor={theme.primary}
                        maximumTrackTintColor={theme.textSecondary + "30"}
                        thumbTintColor={theme.primary}
                      />
                      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <Text style={{ fontSize: 10, fontFamily: "Poppins_400Regular", color: theme.textSecondary }}>
                          {formatTime(currentPosition)}
                        </Text>
                        <Text style={{ fontSize: 10, fontFamily: "Poppins_400Regular", color: theme.textSecondary }}>
                          {formatTime(duration)}
                        </Text>
                      </View>
                    </View>

                    {/* Playback Controls */}
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 12 }}>
                      <Pressable
                        onPress={handleStop}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: theme.textSecondary + "20",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <Ionicons name="stop" size={20} color={theme.textPrimary} />
                      </Pressable>

                      <Pressable
                        onPress={handlePlayPause}
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 28,
                          backgroundColor: theme.primary,
                          alignItems: "center",
                          justifyContent: "center",
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.2,
                          shadowRadius: 4,
                          elevation: 3
                        }}
                      >
                        <Ionicons name={isPlaying ? "pause" : "play"} size={28} color="white" />
                      </Pressable>

                      <Pressable
                        onPress={() => setShowMusicSelector(true)}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: theme.secondary + "20",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <Ionicons name="list" size={20} color={theme.secondary} />
                      </Pressable>
                    </View>

                    {/* Volume Control */}
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <Ionicons name="volume-low" size={16} color={theme.textSecondary} />
                      <Slider
                        style={{ flex: 1, height: 32 }}
                        minimumValue={0}
                        maximumValue={1}
                        value={volume}
                        onValueChange={handleVolumeChange}
                        minimumTrackTintColor={theme.secondary}
                        maximumTrackTintColor={theme.textSecondary + "30"}
                        thumbTintColor={theme.secondary}
                      />
                      <Ionicons name="volume-high" size={16} color={theme.textSecondary} />
                    </View>
                  </>
                ) : (
                  <Pressable
                    onPress={() => setShowMusicSelector(true)}
                    style={{
                      padding: 16,
                      borderRadius: 12,
                      backgroundColor: theme.primary + "10",
                      alignItems: "center"
                    }}
                  >
                    <Ionicons name="add-circle-outline" size={32} color={theme.primary} style={{ marginBottom: 8 }} />
                    <Text style={{ fontSize: 14, fontFamily: "Poppins_600SemiBold", color: theme.primary }}>
                      Select Music
                    </Text>
                    <Text style={{ fontSize: 12, fontFamily: "Poppins_400Regular", color: theme.textSecondary, marginTop: 4, textAlign: "center" }}>
                      Choose a calming track for your study session
                    </Text>
                  </Pressable>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Music Selection Modal */}
        {showMusicSelector && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "center",
              alignItems: "center",
              padding: 24
            }}
          >
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 24,
                padding: 24,
                width: "100%",
                maxHeight: "80%"
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <Text style={{ fontSize: 20, fontFamily: "Poppins_700Bold", color: theme.textPrimary }}>
                  Select Music
                </Text>
                <Pressable onPress={() => setShowMusicSelector(false)}>
                  <Ionicons name="close" size={28} color={theme.textPrimary} />
                </Pressable>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {musicLibrary.map((track) => (
                  <Pressable
                    key={track.id}
                    onPress={() => handleSelectTrack(track)}
                    style={{
                      padding: 16,
                      borderRadius: 16,
                      backgroundColor: selectedTrack?.id === track.id ? theme.primary + "20" : theme.textSecondary + "10",
                      marginBottom: 12
                    }}
                  >
                    <Text style={{ fontSize: 16, fontFamily: "Poppins_600SemiBold", color: theme.textPrimary, marginBottom: 4 }}>
                      {track.title}
                    </Text>
                    <Text style={{ fontSize: 12, fontFamily: "Poppins_400Regular", color: theme.textSecondary }}>
                      {track.artist}
                    </Text>
                    <Text style={{ fontSize: 11, fontFamily: "Poppins_400Regular", color: theme.textSecondary, marginTop: 4 }}>
                      {track.mood.charAt(0).toUpperCase() + track.mood.slice(1)} • {track.duration}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </View>
        )}
      </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default TimerScreen;
