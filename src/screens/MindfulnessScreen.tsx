import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Slider from "@react-native-community/slider";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
  FadeIn,
} from "react-native-reanimated";
import useUserStore from "../state/userStore";
import { THEMES } from "../utils/themes";
import { ThemeConfig } from "../utils/themes";
import StudyPal from "../components/StudyPal";
import ClickableCompanion from "../components/ClickableCompanion";
import { musicService, musicLibrary, MusicTrack } from "../services/musicService";

type Tab = "breathwork" | "tips" | "acupressure";
type BreathworkType = "box" | "46";

const MindfulnessScreen = () => {
  const user = useUserStore((s) => s.user);
  const theme = THEMES[user?.themeColor || "nature"];

  // Tab state
  const [activeTab, setActiveTab] = useState<Tab>("breathwork");

  // Breathwork state
  const [breathworkType, setBreathworkType] = useState<BreathworkType>("box");
  const [isBreathworkActive, setIsBreathworkActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<"inhale" | "hold" | "exhale" | "pause">("inhale");
  const [breathCount, setBreathCount] = useState(0);
  const [breathworkMinutes, setBreathworkMinutes] = useState(5);
  const [breathworkSeconds, setBreathworkSeconds] = useState(0);
  const [breathworkTotalTime, setBreathworkTotalTime] = useState(5 * 60);
  const [breathworkElapsedTime, setBreathworkElapsedTime] = useState(0);

  // Animations
  const circleScale = useSharedValue(1);
  const circleOpacity = useSharedValue(1);

  // Settings
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  // Background Music state
  const [selectedMusicTrack, setSelectedMusicTrack] = useState<MusicTrack | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicPosition, setMusicPosition] = useState(0);
  const [musicDuration, setMusicDuration] = useState(0);
  const [musicVolume, setMusicVolume] = useState(0.5);
  const [isMusicLooping, setIsMusicLooping] = useState(true);
  const [showMusicLibrary, setShowMusicLibrary] = useState(false);

  // Quotes
  const quotes = [
    { text: "The present moment is filled with joy and peace. If you are attentive, you will see it.", author: "Thich Nhat Hanh" },
    { text: "Stillness is the altar of the spirit.", author: "Eckhart Tolle" },
    { text: "You are not separate from the world - you are the world.", author: "Thich Nhat Hanh" },
    { text: "Anxiety does not empty tomorrow of its sorrows, it only empties today of its strength.", author: "Eckhart Tolle" },
    { text: "Be here now.", author: "Ram Dass" },
    { text: "The mind is everything. What you think, you become.", author: "Buddha" },
    { text: "Breathing is the greatest pleasure in life.", author: "Giovanni Giacomo Casanova" },
    { text: "In the moment of now, you have access to everything.", author: "Eckhart Tolle" },
  ];

  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  // Breathwork effect
  useEffect(() => {
    if (!isBreathworkActive) return;

    const getPhaseData = () => {
      if (breathworkType === "box") {
        // Box breathing: 4-4-4-4
        const phases: Array<{ phase: "inhale" | "hold" | "exhale" | "pause"; duration: number }> = [
          { phase: "inhale", duration: 4 },
          { phase: "hold", duration: 4 },
          { phase: "exhale", duration: 4 },
          { phase: "pause", duration: 4 },
        ];
        return phases;
      } else {
        // 4-6 breathing
        const phases: Array<{ phase: "inhale" | "hold" | "exhale" | "pause"; duration: number }> = [
          { phase: "inhale", duration: 4 },
          { phase: "exhale", duration: 6 },
        ];
        return phases;
      }
    };

    const phases = getPhaseData();
    const totalDuration = phases.reduce((sum, p) => sum + p.duration, 0);

    const timer = setInterval(() => {
      setBreathCount((prev) => {
        const nextCount = (prev + 1) % totalDuration;
        let accumulated = 0;

        for (const p of phases) {
          accumulated += p.duration;
          if (nextCount < accumulated) {
            setBreathPhase(p.phase);
            break;
          }
        }

        return nextCount;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isBreathworkActive, breathworkType]);

  // Circle animation for breathing
  useEffect(() => {
    if (!animationsEnabled || !isBreathworkActive) return;

    // 4-4-4-4 breathing cycle:
    // 0-4s: Inhale (circle grows to 1.5)
    // 4-8s: Hold (circle stays enlarged at 1.5)
    // 8-12s: Exhale (circle shrinks to 0.8)
    // 12-16s: Hold (circle stays small at 0.8)

    let targetScale = 1;
    let duration = 4000; // 4 seconds

    if (breathPhase === "inhale") {
      targetScale = 1.5; // Grow during inhale
      duration = 4000;
    } else if (breathPhase === "hold" && breathCount < 8) {
      // First hold (after inhale) - stay enlarged
      targetScale = 1.5;
      duration = 4000;
    } else if (breathPhase === "exhale") {
      targetScale = 0.8; // Shrink during exhale
      duration = 4000;
    } else if (breathPhase === "pause") {
      // Second hold (after exhale) - stay small
      targetScale = 0.8;
      duration = 4000;
    }

    circleScale.value = withTiming(targetScale, {
      duration,
      easing: breathPhase === "inhale" || breathPhase === "exhale"
        ? Easing.inOut(Easing.ease)
        : Easing.linear,
    });
  }, [breathPhase, isBreathworkActive, animationsEnabled, breathCount]);

  // Breathwork timer effect
  useEffect(() => {
    if (!isBreathworkActive) return;

    const interval = setInterval(() => {
      setBreathworkElapsedTime((prev) => {
        const newTime = prev + 1;
        if (newTime >= breathworkTotalTime) {
          setIsBreathworkActive(false);
          return newTime;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isBreathworkActive, breathworkTotalTime]);

  // Update breathwork timer display
  useEffect(() => {
    const remaining = breathworkTotalTime - breathworkElapsedTime;
    setBreathworkMinutes(Math.floor(remaining / 60));
    setBreathworkSeconds(remaining % 60);
  }, [breathworkElapsedTime, breathworkTotalTime]);

  // Initialize music service
  useEffect(() => {
    musicService.initializeAudio();
    musicService.setVolume(musicVolume);
    musicService.setLooping(isMusicLooping);

    // Update playback status every 500ms
    const interval = setInterval(async () => {
      const status = await musicService.getStatus();
      if (status && status.isLoaded) {
        setMusicPosition(status.positionMillis);
        setMusicDuration(status.durationMillis || 0);
        setIsMusicPlaying(status.isPlaying);
      }
    }, 500);

    return () => {
      clearInterval(interval);
      musicService.unload();
    };
  }, []);

  // Update music service volume and looping when changed
  useEffect(() => {
    musicService.setVolume(musicVolume);
  }, [musicVolume]);

  useEffect(() => {
    musicService.setLooping(isMusicLooping);
  }, [isMusicLooping]);

  // Music control handlers
  const handlePlayPauseMusic = async () => {
    if (!selectedMusicTrack) {
      setShowMusicLibrary(true);
      return;
    }

    if (isMusicPlaying) {
      await musicService.pause();
    } else {
      await musicService.play();
    }
  };

  const handleStopMusic = async () => {
    await musicService.stop();
    setMusicPosition(0);
  };

  const handleSelectMusicTrack = async (track: MusicTrack) => {
    setSelectedMusicTrack(track);
    const success = await musicService.loadTrack(track);
    if (success) {
      await musicService.play();
    }
    setShowMusicLibrary(false);
  };

  const formatMusicTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const circleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: circleScale.value }],
  }));

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.backgroundGradient[0] }}>
      <LinearGradient
        colors={[theme.backgroundGradient[0], theme.backgroundGradient[1]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View className="px-6 pt-4 pb-4">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-1">
              <Text style={{ fontSize: 32, fontFamily: "Poppins_700Bold", color: theme.textPrimary }}>
                Calm
              </Text>
            </View>
            <View className="ml-4">
              <ClickableCompanion
                animal={user?.studyPalConfig.animal || "redpanda"}
                name={user?.studyPalConfig.name || "Tomo"}
                animationsEnabled={false}
                size={50}
                showName={false}
                showMessage={false}
                customAvatar={user?.studyPalConfig.avatar}
              />
            </View>
          </View>
          <Text style={{ fontSize: 14, fontFamily: "Poppins_400Regular", color: theme.textSecondary, marginBottom: 2 }}>
            Take a moment to breathe and find peace
          </Text>
          <View style={{
            backgroundColor: theme.primary + "15",
            borderRadius: 16,
            padding: 12,
            marginTop: 12,
            borderWidth: 1,
            borderColor: theme.primary + "40",
          }}>
            <Text style={{ fontSize: 12, fontFamily: "Poppins_500Medium", color: theme.textPrimary, lineHeight: 16 }}>
              💙 Taking time to calm yourself helps reduce stress and brings clarity. Focus on your breath and find your center.
            </Text>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={{ paddingHorizontal: 24, paddingVertical: 16 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16 }}>
            {(["breathwork", "tips", "acupressure"] as Tab[]).map((tab) => (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  borderRadius: 20,
                  backgroundColor: activeTab === tab ? "white" : "rgba(255, 255, 255, 0.5)",
                }}
              >
                <Text
                  style={{
                    fontFamily: "Poppins_600SemiBold",
                    color: activeTab === tab ? theme.primary : theme.textSecondary,
                    fontSize: 14,
                    fontWeight: "600",
                  }}
                >
                  {tab === "breathwork"
                    ? "Breathwork"
                    : tab === "tips"
                    ? "Tips"
                    : "Acupressure"}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Content */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Breathwork Tab */}
          {activeTab === "breathwork" && (
            <Animated.View entering={FadeIn}>
              <View className="gap-6 mb-6">
                {/* Breathwork Type Selection */}
                <View className="gap-3">
                  <Text style={{ fontSize: 18, fontFamily: "Poppins_600SemiBold", color: theme.textPrimary }}>
                    Choose Breathwork
                  </Text>

                  <Pressable
                    onPress={() => {
                      setBreathworkType("box");
                      setBreathCount(0);
                      setBreathPhase("inhale");
                    }}
                    style={{
                      borderRadius: 16,
                      padding: 16,
                      backgroundColor: breathworkType === "box" ? theme.primary + "20" : "white",
                      borderWidth: 2,
                      borderColor: breathworkType === "box" ? theme.primary : "#E5E7EB",
                    }}
                  >
                    <Text style={{ fontSize: 16, fontFamily: "Poppins_700Bold", color: theme.textPrimary }}>
                      Box Breathing (4-4-4-4)
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        fontFamily: "Poppins_400Regular",
                        color: theme.textSecondary,
                        marginTop: 4,
                      }}
                    >
                      4 counts inhale • 4 counts hold • 4 counts exhale • 4 counts hold
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      setBreathworkType("46");
                      setBreathCount(0);
                      setBreathPhase("inhale");
                    }}
                    style={{
                      borderRadius: 16,
                      padding: 16,
                      backgroundColor: breathworkType === "46" ? theme.primary + "20" : "white",
                      borderWidth: 2,
                      borderColor: breathworkType === "46" ? theme.primary : "#E5E7EB",
                    }}
                  >
                    <Text style={{ fontSize: 16, fontFamily: "Poppins_700Bold", color: theme.textPrimary }}>
                      4-6 Breathing
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        fontFamily: "Poppins_400Regular",
                        color: theme.textSecondary,
                        marginTop: 4,
                      }}
                    >
                      4 counts inhale • 6 counts exhale
                    </Text>
                  </Pressable>
                </View>

                {/* Breathing Circle Animation */}
                <View className="bg-white dark:bg-gray-800 rounded-3xl p-8 items-center shadow-lg" style={{ elevation: 5 }}>
                  <View className="mb-6">
                    <ClickableCompanion
                      animal={user?.studyPalConfig.animal || "redpanda"}
                      name={user?.studyPalConfig.name || "Tomo"}
                      animationsEnabled={false}
                      size={50}
                      showName={false}
                      showMessage={false}
                      customAvatar={user?.studyPalConfig.avatar}
                    />
                  </View>

                  {/* Breathing Phase Display */}
                  <Text
                    style={{
                      fontSize: 24,
                      fontFamily: "Poppins_700Bold",
                      color: theme.primary,
                      marginBottom: 16,
                      textTransform: "capitalize",
                    }}
                  >
                    {breathPhase === "inhale"
                      ? "Breathe In 🌬️"
                      : breathPhase === "exhale"
                      ? "Breathe Out 💨"
                      : "Hold 🌟"}
                  </Text>

                  {/* Animated Circle */}
                  {animationsEnabled && (
                    <View
                      className="rounded-full mb-8 items-center justify-center"
                      style={{
                        width: 200,
                        height: 200,
                        backgroundColor: theme.primary + "20",
                      }}
                    >
                      <Animated.View
                        style={[
                          {
                            width: 140,
                            height: 140,
                            borderRadius: 70,
                            backgroundColor: theme.primary,
                          },
                          circleAnimatedStyle,
                        ]}
                      />
                    </View>
                  )}

                  {/* Breath Count */}
                  <Text
                    style={{
                      fontSize: 18,
                      fontFamily: "Poppins_600SemiBold",
                      color: theme.primary,
                      marginBottom: 20,
                    }}
                  >
                    {breathCount + 1} / {breathworkType === "box" ? "16" : "10"}
                  </Text>

                  {/* Instructions */}
                  <View style={{
                    backgroundColor: theme.primary + "15",
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 16,
                    width: "100%",
                    borderWidth: 1,
                    borderColor: theme.primary + "30",
                  }}>
                    <Text
                      style={{
                        fontSize: 13,
                        fontFamily: "Poppins_400Regular",
                        color: theme.primary,
                        textAlign: "center",
                        lineHeight: 20,
                      }}
                    >
                      {breathworkType === "box"
                        ? "1. Breathe in through your nose for 4\n2. Hold for 4\n3. Exhale through your mouth for 4\n4. Hold for 4\nRepeat."
                        : "1. Breathe in through your nose for 4 counts\n2. Exhale through your mouth for 6 counts\nRepeat."}
                    </Text>
                  </View>

                  {/* Breathwork Session Timer */}
                  <View style={{
                    backgroundColor: theme.primary + "10",
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 16,
                    alignItems: "center",
                    width: "100%",
                  }}>
                    <Text style={{
                      fontSize: 12,
                      fontFamily: "Poppins_500Medium",
                      color: theme.textSecondary,
                      marginBottom: 8,
                    }}>
                      Total Session Time
                    </Text>
                    <Text style={{
                      fontSize: 32,
                      fontFamily: "Poppins_700Bold",
                      color: theme.primary,
                      marginBottom: 12,
                    }}>
                      {String(breathworkMinutes).padStart(2, "0")}:{String(breathworkSeconds).padStart(2, "0")}
                    </Text>
                    <View style={{
                      flexDirection: "row",
                      gap: 12,
                      alignItems: "center",
                      width: "100%",
                      justifyContent: "center",
                    }}>
                      <Pressable
                        onPress={() => setBreathworkMinutes(Math.max(1, breathworkMinutes - 1))}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: theme.primary + "20",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Ionicons name="remove" size={20} color={theme.primary} />
                      </Pressable>

                      <View style={{
                        flex: 1,
                        backgroundColor: "white",
                        borderRadius: 12,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        alignItems: "center",
                      }}>
                        <Text style={{
                          fontSize: 14,
                          fontFamily: "Poppins_600SemiBold",
                          color: theme.textPrimary,
                        }}>
                          {breathworkMinutes} min
                        </Text>
                      </View>

                      <Pressable
                        onPress={() => setBreathworkMinutes(Math.min(60, breathworkMinutes + 1))}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: theme.primary + "20",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Ionicons name="add" size={20} color={theme.primary} />
                      </Pressable>

                      <Pressable
                        onPress={() => {
                          setBreathworkMinutes(5);
                          setBreathworkSeconds(0);
                          setBreathworkElapsedTime(0);
                          setIsBreathworkActive(false);
                          setBreathCount(0);
                          setBreathPhase("inhale");
                        }}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: theme.secondary + "20",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Ionicons name="refresh" size={20} color={theme.secondary} />
                      </Pressable>
                    </View>
                  </View>

                  {/* Control Buttons */}
                  <View className="flex-row gap-3 w-full">
                    <Pressable onPress={() => setIsBreathworkActive(!isBreathworkActive)} className="flex-1">
                      <LinearGradient
                        colors={[theme.primary, theme.secondary]}
                        style={{ borderRadius: 16, paddingVertical: 16, alignItems: "center" }}
                      >
                        <Text style={{ fontSize: 16, fontFamily: "Poppins_700Bold", color: "white" }}>
                          {isBreathworkActive ? "Stop" : "Start"}
                        </Text>
                      </LinearGradient>
                    </Pressable>

                    <Pressable
                      onPress={() => setAnimationsEnabled(!animationsEnabled)}
                      className="w-16 rounded-2xl bg-gray-200 dark:bg-gray-700 items-center justify-center"
                    >
                      <Ionicons
                        name={animationsEnabled ? "eye" : "eye-off"}
                        size={24}
                        color={theme.primary}
                      />
                    </Pressable>
                  </View>
                </View>

                {/* Background Music Player Section */}
                <View
                  className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg"
                  style={{ elevation: 5 }}
                >
                  <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center gap-2">
                      <Ionicons name="musical-notes" size={24} color={theme.primary} />
                      <Text
                        style={{
                          fontSize: 18,
                          fontFamily: "Poppins_700Bold",
                          color: theme.textPrimary,
                        }}
                      >
                        Background Music
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => setIsMusicLooping(!isMusicLooping)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 12,
                        backgroundColor: isMusicLooping ? theme.primary + "20" : theme.textSecondary + "20",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Ionicons
                        name={isMusicLooping ? "repeat" : "repeat-outline"}
                        size={16}
                        color={isMusicLooping ? theme.primary : theme.textSecondary}
                      />
                      <Text
                        style={{
                          fontSize: 12,
                          fontFamily: "Poppins_600SemiBold",
                          color: isMusicLooping ? theme.primary : theme.textSecondary,
                        }}
                      >
                        Loop
                      </Text>
                    </Pressable>
                  </View>

                  {selectedMusicTrack ? (
                    <>
                      {/* Now Playing */}
                      <View style={{ marginBottom: 16 }}>
                        <Text
                          style={{
                            fontSize: 12,
                            fontFamily: "Poppins_500Medium",
                            color: theme.textSecondary,
                            marginBottom: 4,
                          }}
                        >
                          Now Playing
                        </Text>
                        <Text
                          style={{
                            fontSize: 16,
                            fontFamily: "Poppins_600SemiBold",
                            color: theme.textPrimary,
                          }}
                        >
                          {selectedMusicTrack.title}
                        </Text>
                        <Text
                          style={{
                            fontSize: 12,
                            fontFamily: "Poppins_400Regular",
                            color: theme.textSecondary,
                            marginTop: 2,
                          }}
                        >
                          {selectedMusicTrack.artist}
                        </Text>
                      </View>

                      {/* Progress Bar */}
                      <View style={{ marginBottom: 16 }}>
                        <Slider
                          style={{ width: "100%", height: 40 }}
                          minimumValue={0}
                          maximumValue={musicDuration}
                          value={musicPosition}
                          onSlidingComplete={async (value) => await musicService.seekTo(value)}
                          minimumTrackTintColor={theme.primary}
                          maximumTrackTintColor={theme.textSecondary + "30"}
                          thumbTintColor={theme.primary}
                        />
                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                          <Text
                            style={{
                              fontSize: 10,
                              fontFamily: "Poppins_400Regular",
                              color: theme.textSecondary,
                            }}
                          >
                            {formatMusicTime(musicPosition)}
                          </Text>
                          <Text
                            style={{
                              fontSize: 10,
                              fontFamily: "Poppins_400Regular",
                              color: theme.textSecondary,
                            }}
                          >
                            {formatMusicTime(musicDuration)}
                          </Text>
                        </View>
                      </View>

                      {/* Playback Controls */}
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 16,
                          marginBottom: 16,
                        }}
                      >
                        <Pressable
                          onPress={handleStopMusic}
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 24,
                            backgroundColor: theme.textSecondary + "20",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Ionicons name="stop" size={24} color={theme.textPrimary} />
                        </Pressable>

                        <Pressable
                          onPress={handlePlayPauseMusic}
                          style={{
                            width: 64,
                            height: 64,
                            borderRadius: 32,
                            backgroundColor: theme.primary,
                            alignItems: "center",
                            justifyContent: "center",
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.2,
                            shadowRadius: 8,
                            elevation: 4,
                          }}
                        >
                          <Ionicons
                            name={isMusicPlaying ? "pause" : "play"}
                            size={32}
                            color="white"
                          />
                        </Pressable>

                        <Pressable
                          onPress={() => setShowMusicLibrary(true)}
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 24,
                            backgroundColor: theme.secondary + "20",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Ionicons name="list" size={24} color={theme.secondary} />
                        </Pressable>
                      </View>

                      {/* Volume Control */}
                      <View style={{ marginTop: 8 }}>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 8,
                          }}
                        >
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                            <Ionicons name="volume-medium" size={18} color={theme.textSecondary} />
                            <Text
                              style={{
                                fontSize: 12,
                                fontFamily: "Poppins_500Medium",
                                color: theme.textSecondary,
                              }}
                            >
                              Volume
                            </Text>
                          </View>
                          <Text
                            style={{
                              fontSize: 12,
                              fontFamily: "Poppins_600SemiBold",
                              color: theme.primary,
                            }}
                          >
                            {Math.round(musicVolume * 100)}%
                          </Text>
                        </View>
                        <Slider
                          style={{ width: "100%", height: 32 }}
                          minimumValue={0}
                          maximumValue={1}
                          value={musicVolume}
                          onValueChange={setMusicVolume}
                          minimumTrackTintColor={theme.secondary}
                          maximumTrackTintColor={theme.textSecondary + "30"}
                          thumbTintColor={theme.secondary}
                        />
                      </View>
                    </>
                  ) : (
                    <Pressable
                      onPress={() => setShowMusicLibrary(true)}
                      style={{
                        padding: 20,
                        borderRadius: 16,
                        backgroundColor: theme.primary + "10",
                        alignItems: "center",
                        borderWidth: 2,
                        borderColor: theme.primary + "30",
                        borderStyle: "dashed",
                      }}
                    >
                      <Ionicons
                        name="add-circle-outline"
                        size={40}
                        color={theme.primary}
                        style={{ marginBottom: 12 }}
                      />
                      <Text
                        style={{
                          fontSize: 16,
                          fontFamily: "Poppins_600SemiBold",
                          color: theme.primary,
                        }}
                      >
                        Select Calming Music
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          fontFamily: "Poppins_400Regular",
                          color: theme.textSecondary,
                          marginTop: 4,
                          textAlign: "center",
                        }}
                      >
                        Add background music to enhance your mindfulness session
                      </Text>
                    </Pressable>
                  )}
                </View>
              </View>
            </Animated.View>
          )}

          {/* Tips Tab */}
          {activeTab === "tips" && (
            <Animated.View entering={FadeIn}>
              <View className="gap-6 mb-6">
                {/* Random Quote */}
                <View className="bg-gradient-to-r p-6 rounded-3xl shadow-lg" style={{ elevation: 5 }}>
                  <LinearGradient
                    colors={[theme.primary + "40", theme.secondary + "40"]}
                    style={{ borderRadius: 24, padding: 24 }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        fontFamily: "Poppins_600SemiBold",
                        color: theme.textPrimary,
                        marginBottom: 12,
                        fontStyle: "italic",
                      }}
                    >
                      &ldquo;{randomQuote.text}&rdquo;
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: "Poppins_500Medium",
                        color: theme.textSecondary,
                        textAlign: "right",
                      }}
                    >
                      — {randomQuote.author}
                    </Text>
                  </LinearGradient>
                </View>

                {/* Tips List */}
                <View className="gap-3">
                  <Text style={{ fontSize: 18, fontFamily: "Poppins_600SemiBold", color: theme.textPrimary }}>
                    Mindfulness Tips
                  </Text>

                  {[
                    "Take 5 minutes to breathe and focus on the present moment",
                    "Let thoughts pass without judgment—observe them like clouds",
                    "Notice 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste",
                    "Practice gratitude by listing 3 things you're grateful for today",
                    "Find a quiet space and sit comfortably for a few minutes",
                    "Focus on the sensation of your feet on the ground",
                  ].map((tip, index) => (
                    <View
                      key={index}
                      className="bg-white dark:bg-gray-800 rounded-2xl p-4 flex-row items-start gap-3"
                    >
                      <View
                        className="w-8 h-8 rounded-full items-center justify-center"
                        style={{ backgroundColor: theme.primary + "40" }}
                      >
                        <Text style={{ fontSize: 14, fontFamily: "Poppins_700Bold", color: theme.primary }}>
                          {index + 1}
                        </Text>
                      </View>
                      <Text
                        style={{
                          fontSize: 14,
                          fontFamily: "Poppins_400Regular",
                          color: theme.textPrimary,
                          flex: 1,
                          lineHeight: 20,
                        }}
                      >
                        {tip}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </Animated.View>
          )}

          {/* Acupressure Tab */}
          {activeTab === "acupressure" && (
            <Animated.View entering={FadeIn}>
              <View className="gap-4 mb-6">
                <Text style={{ fontSize: 18, fontFamily: "Poppins_600SemiBold", color: theme.textPrimary }}>
                  Acupressure for Stress & Anxiety
                </Text>

                {/* Safety Disclaimer */}
                <View style={{
                  backgroundColor: theme.secondary + "15",
                  borderRadius: 16,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: theme.secondary + "40",
                }}>
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Poppins_500Medium",
                      color: theme.textPrimary,
                      lineHeight: 18,
                    }}
                  >
                    ⚠️ <Text style={{ fontFamily: "Poppins_700Bold" }}>Safety:</Text> Use gentle pressure only. Do not use on broken skin or injured areas. If pain persists, consult a healthcare professional.
                  </Text>
                </View>

                {/* Parent Support Guide */}
                <View style={{
                  backgroundColor: theme.primary + "15",
                  borderRadius: 16,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: theme.primary + "40",
                }}>
                  <View className="flex-row items-start gap-3 mb-2">
                    <Text style={{ fontSize: 16, fontFamily: "Poppins_700Bold", color: theme.textPrimary }}>
                      👋 Ask a Parent for Help
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Poppins_400Regular",
                      color: theme.textPrimary,
                      lineHeight: 18,
                    }}
                  >
                    These acupressure points work best with a little help! Ask a parent, guardian, or trusted adult to help you locate and gently press each point. They can guide your fingers to the right spot and help you remember to breathe deeply. Learning together makes it even more helpful for reducing stress and anxiety.
                  </Text>
                </View>

                {/* How to Apply Section */}
                <View style={{
                  backgroundColor: theme.cardBackground,
                  borderRadius: 16,
                  padding: 20,
                  gap: 16,
                }}>
                  <Text style={{ fontSize: 18, fontFamily: "Poppins_700Bold", color: theme.textPrimary }}>
                    How to Apply
                  </Text>

                  <Text style={{ fontSize: 14, fontFamily: "Poppins_400Regular", color: theme.textPrimary, lineHeight: 22 }}>
                    Use gentle but firm pressure, either as a steady hold or by pressing softly, then a little more firmly. You can also use light tapping over each point.
                  </Text>

                  <Text style={{ fontSize: 14, fontFamily: "Poppins_400Regular", color: theme.textPrimary, lineHeight: 22 }}>
                    Take slow, deep breaths while applying pressure — this helps your body and mind stay calm and balanced. You might feel a bit of tenderness at some points — that&apos;s normal.
                  </Text>

                  <Text style={{ fontSize: 14, fontFamily: "Poppins_400Regular", color: theme.textPrimary, lineHeight: 22 }}>
                    Always stay relaxed and gentle. Pressing too hard can block your energy (Qi) instead of helping it flow smoothly.
                  </Text>
                </View>

                {/* Detailed Acupressure Points */}
                <View style={{
                  backgroundColor: theme.cardBackground,
                  borderRadius: 16,
                  padding: 20,
                  gap: 20,
                }}>
                  {/* Point 1: Third Eye */}
                  <View style={{ gap: 8 }}>
                    <Text style={{ fontSize: 16, fontFamily: "Poppins_700Bold", color: theme.textPrimary }}>
                      1. Third Eye – Yintang (EX-HN3)
                    </Text>
                    <Text style={{ fontSize: 14, fontFamily: "Poppins_600SemiBold", color: theme.primary }}>
                      Location:
                    </Text>
                    <Text style={{ fontSize: 14, fontFamily: "Poppins_400Regular", color: theme.textPrimary, lineHeight: 22 }}>
                      Between the inner eyebrows, just above the bridge of the nose.
                    </Text>
                    <Text style={{ fontSize: 14, fontFamily: "Poppins_600SemiBold", color: theme.secondary }}>
                      Benefits:
                    </Text>
                    <Text style={{ fontSize: 14, fontFamily: "Poppins_400Regular", color: theme.textPrimary, lineHeight: 22 }}>
                      Calms overthinking, eases anxiety, relieves tension headaches and restlessness.
                    </Text>
                    <Text style={{ fontSize: 14, fontFamily: "Poppins_600SemiBold", color: theme.primary }}>
                      How to Find:
                    </Text>
                    <Text style={{ fontSize: 14, fontFamily: "Poppins_400Regular", color: theme.textPrimary, lineHeight: 22 }}>
                      Use your fingertips to feel the centre point between your eyebrows — you may notice a small dip.
                    </Text>
                  </View>

                  {/* Divider */}
                  <View style={{ height: 1, backgroundColor: theme.textSecondary + "20" }} />

                  {/* Point 2: Inner Gate */}
                  <View style={{ gap: 8 }}>
                    <Text style={{ fontSize: 16, fontFamily: "Poppins_700Bold", color: theme.textPrimary }}>
                      2. Inner Gate – Neiguan (PC6)
                    </Text>
                    <Text style={{ fontSize: 14, fontFamily: "Poppins_600SemiBold", color: theme.primary }}>
                      Location:
                    </Text>
                    <Text style={{ fontSize: 14, fontFamily: "Poppins_400Regular", color: theme.textPrimary, lineHeight: 22 }}>
                      Inside the forearm, about two finger-widths above the wrist crease, between two tendons.
                    </Text>
                    <Text style={{ fontSize: 14, fontFamily: "Poppins_600SemiBold", color: theme.secondary }}>
                      Benefits:
                    </Text>
                    <Text style={{ fontSize: 14, fontFamily: "Poppins_400Regular", color: theme.textPrimary, lineHeight: 22 }}>
                      Calms anxiety, balances emotions, and eases tightness in the chest or stomach.
                    </Text>
                    <Text style={{ fontSize: 14, fontFamily: "Poppins_600SemiBold", color: theme.primary }}>
                      How to Find:
                    </Text>
                    <Text style={{ fontSize: 14, fontFamily: "Poppins_400Regular", color: theme.textPrimary, lineHeight: 22 }}>
                      1. Hold palm facing up.{"\n"}
                      2. Place index, middle, and ring fingers across wrist crease.{"\n"}
                      3. The soft spot between the two tendons above your fingers is PC6.
                    </Text>
                  </View>

                  {/* Divider */}
                  <View style={{ height: 1, backgroundColor: theme.textSecondary + "20" }} />

                  {/* Point 3: Hundred Convergences */}
                  <View style={{ gap: 8 }}>
                    <Text style={{ fontSize: 16, fontFamily: "Poppins_700Bold", color: theme.textPrimary }}>
                      3. Hundred Convergences – Baihui (GV20)
                    </Text>
                    <Text style={{ fontSize: 14, fontFamily: "Poppins_600SemiBold", color: theme.primary }}>
                      Location:
                    </Text>
                    <Text style={{ fontSize: 14, fontFamily: "Poppins_400Regular", color: theme.textPrimary, lineHeight: 22 }}>
                      Very top of the head, along the midline.
                    </Text>
                    <Text style={{ fontSize: 14, fontFamily: "Poppins_600SemiBold", color: theme.secondary }}>
                      Benefits:
                    </Text>
                    <Text style={{ fontSize: 14, fontFamily: "Poppins_400Regular", color: theme.textPrimary, lineHeight: 22 }}>
                      Calms and centres the mind, lifts energy and focus.
                    </Text>
                    <Text style={{ fontSize: 14, fontFamily: "Poppins_600SemiBold", color: theme.primary }}>
                      How to Find:
                    </Text>
                    <Text style={{ fontSize: 14, fontFamily: "Poppins_400Regular", color: theme.textPrimary, lineHeight: 22 }}>
                      Draw a line from the top of one ear to the other; the midpoint at the top of your head is GV20.
                    </Text>
                  </View>

                  {/* Divider */}
                  <View style={{ height: 1, backgroundColor: theme.textSecondary + "20" }} />

                  {/* Point 4: Sea of Tranquility */}
                  <View style={{ gap: 8 }}>
                    <Text style={{ fontSize: 16, fontFamily: "Poppins_700Bold", color: theme.textPrimary }}>
                      4. Sea of Tranquility – Dan Zhong (CV17)
                    </Text>
                    <Text style={{ fontSize: 14, fontFamily: "Poppins_600SemiBold", color: theme.primary }}>
                      Location:
                    </Text>
                    <Text style={{ fontSize: 14, fontFamily: "Poppins_400Regular", color: theme.textPrimary, lineHeight: 22 }}>
                      Centre of the chest, level with the nipples (fourth rib space).
                    </Text>
                    <Text style={{ fontSize: 14, fontFamily: "Poppins_600SemiBold", color: theme.secondary }}>
                      Benefits:
                    </Text>
                    <Text style={{ fontSize: 14, fontFamily: "Poppins_400Regular", color: theme.textPrimary, lineHeight: 22 }}>
                      Opens the chest, relaxes breathing, calms emotions, and creates peacefulness.
                    </Text>
                    <Text style={{ fontSize: 14, fontFamily: "Poppins_600SemiBold", color: theme.primary }}>
                      How to Find:
                    </Text>
                    <Text style={{ fontSize: 14, fontFamily: "Poppins_400Regular", color: theme.textPrimary, lineHeight: 22 }}>
                      Locate the centre of the breastbone (sternum) — the small dip or flat spot is CV17.
                    </Text>
                  </View>

                  {/* Divider */}
                  <View style={{ height: 1, backgroundColor: theme.textSecondary + "20" }} />

                  {/* Point 5: Water Trough */}
                  <View style={{ gap: 8 }}>
                    <Text style={{ fontSize: 16, fontFamily: "Poppins_700Bold", color: theme.textPrimary }}>
                      5. Water Trough – Renzhong (GV26)
                    </Text>
                    <Text style={{ fontSize: 14, fontFamily: "Poppins_600SemiBold", color: theme.primary }}>
                      Location:
                    </Text>
                    <Text style={{ fontSize: 14, fontFamily: "Poppins_400Regular", color: theme.textPrimary, lineHeight: 22 }}>
                      On the line between the nose and upper lip.
                    </Text>
                    <Text style={{ fontSize: 14, fontFamily: "Poppins_600SemiBold", color: theme.secondary }}>
                      Benefits:
                    </Text>
                    <Text style={{ fontSize: 14, fontFamily: "Poppins_400Regular", color: theme.textPrimary, lineHeight: 22 }}>
                      Clears mental fog, improves alertness and grounding.
                    </Text>
                    <Text style={{ fontSize: 14, fontFamily: "Poppins_600SemiBold", color: theme.primary }}>
                      How to Find:
                    </Text>
                    <Text style={{ fontSize: 14, fontFamily: "Poppins_400Regular", color: theme.textPrimary, lineHeight: 22 }}>
                      Feel the small dip in the centre between nose and upper lip.
                    </Text>
                  </View>
                </View>

                {/* Optional Combination Practice */}
                <View style={{
                  backgroundColor: theme.primary + "10",
                  borderRadius: 16,
                  padding: 20,
                  gap: 16,
                  borderWidth: 1,
                  borderColor: theme.primary + "30",
                }}>
                  <Text style={{ fontSize: 18, fontFamily: "Poppins_700Bold", color: theme.textPrimary }}>
                    Optional Combination Practice
                  </Text>

                  <View style={{ gap: 12 }}>
                    <Text style={{ fontSize: 15, fontFamily: "Poppins_600SemiBold", color: theme.primary }}>
                      Calming & Focus
                    </Text>
                    <Text style={{ fontSize: 14, fontFamily: "Poppins_400Regular", color: theme.textPrimary, lineHeight: 22 }}>
                      GV20 – Steady the mind and improve focus.{"\n"}
                      Yintang – Quiet emotions and thoughts.{"\n"}
                      PC6 – Restore emotional balance.
                    </Text>
                  </View>

                  <View style={{ gap: 12 }}>
                    <Text style={{ fontSize: 15, fontFamily: "Poppins_600SemiBold", color: theme.secondary }}>
                      Grounding & Energy
                    </Text>
                    <Text style={{ fontSize: 14, fontFamily: "Poppins_400Regular", color: theme.textPrimary, lineHeight: 22 }}>
                      GV26 – Energise and centre yourself.{"\n"}
                      CV17 – Deepen breathing and calm the chest.
                    </Text>
                  </View>

                  <View style={{ gap: 12 }}>
                    <Text style={{ fontSize: 15, fontFamily: "Poppins_600SemiBold", color: theme.primary }}>
                      Full 5-Point Flow:
                    </Text>
                    <Text style={{ fontSize: 14, fontFamily: "Poppins_400Regular", color: theme.textPrimary, lineHeight: 22 }}>
                      GV20 → Yintang → GV26 → CV17 → PC6
                    </Text>
                    <Text style={{ fontSize: 13, fontFamily: "Poppins_400Regular", color: theme.textSecondary, lineHeight: 20 }}>
                      Spend about 1–2 minutes on each point with slow, deep breathing.
                    </Text>
                  </View>

                  <View style={{ gap: 12, marginTop: 8 }}>
                    <Text style={{ fontSize: 15, fontFamily: "Poppins_600SemiBold", color: theme.secondary }}>
                      Closing Practice:
                    </Text>
                    <Text style={{ fontSize: 14, fontFamily: "Poppins_400Regular", color: theme.textPrimary, lineHeight: 22 }}>
                      Rub palms together until warm. Place hands gently over the heart. Take three long, slow breaths and imagine your energy (Qi) flowing smoothly through your body.
                    </Text>
                  </View>
                </View>
              </View>
            </Animated.View>
          )}

          <View className="h-8" />
        </ScrollView>

        {/* Music Library Modal */}
        {showMusicLibrary && (
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
              padding: 24,
            }}
          >
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 24,
                padding: 24,
                width: "100%",
                maxHeight: "80%",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontFamily: "Poppins_700Bold",
                    color: theme.textPrimary,
                  }}
                >
                  Calming Music
                </Text>
                <Pressable onPress={() => setShowMusicLibrary(false)}>
                  <Ionicons name="close" size={28} color={theme.textPrimary} />
                </Pressable>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {musicLibrary.map((track) => (
                  <Pressable
                    key={track.id}
                    onPress={() => handleSelectMusicTrack(track)}
                    style={{
                      padding: 16,
                      borderRadius: 16,
                      backgroundColor:
                        selectedMusicTrack?.id === track.id
                          ? theme.primary + "20"
                          : theme.textSecondary + "10",
                      marginBottom: 12,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 16,
                            fontFamily: "Poppins_600SemiBold",
                            color: theme.textPrimary,
                            marginBottom: 4,
                          }}
                        >
                          {track.title}
                        </Text>
                        <Text
                          style={{
                            fontSize: 12,
                            fontFamily: "Poppins_400Regular",
                            color: theme.textSecondary,
                          }}
                        >
                          {track.artist}
                        </Text>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 8,
                            marginTop: 6,
                          }}
                        >
                          <View
                            style={{
                              paddingHorizontal: 8,
                              paddingVertical: 2,
                              borderRadius: 8,
                              backgroundColor: theme.secondary + "20",
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 10,
                                fontFamily: "Poppins_500Medium",
                                color: theme.secondary,
                              }}
                            >
                              {track.mood.charAt(0).toUpperCase() + track.mood.slice(1)}
                            </Text>
                          </View>
                          <Text
                            style={{
                              fontSize: 10,
                              fontFamily: "Poppins_400Regular",
                              color: theme.textSecondary,
                            }}
                          >
                            {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, "0")}
                          </Text>
                        </View>
                      </View>
                      {selectedMusicTrack?.id === track.id && (
                        <Ionicons name="checkmark-circle" size={24} color={theme.primary} />
                      )}
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
};

export default MindfulnessScreen;
