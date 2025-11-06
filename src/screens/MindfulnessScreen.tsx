import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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

type Tab = "timer" | "breathwork" | "tips" | "acupressure";
type BreathworkType = "box" | "46";

const MindfulnessScreen = () => {
  const user = useUserStore((s) => s.user);
  const theme = THEMES[user?.themeColor || "nature"];

  // Tab state
  const [activeTab, setActiveTab] = useState<Tab>("timer");

  // Timer state
  const [timerMinutes, setTimerMinutes] = useState(5);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [totalTime, setTotalTime] = useState(timerMinutes * 60);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Breathwork state
  const [breathworkType, setBreathworkType] = useState<BreathworkType>("box");
  const [isBreathworkActive, setIsBreathworkActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<"inhale" | "hold" | "exhale" | "pause">("inhale");
  const [breathCount, setBreathCount] = useState(0);

  // Animations
  const circleScale = useSharedValue(1);
  const circleOpacity = useSharedValue(1);

  // Settings
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

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

  // Acupressure points
  const acupressurePoints = [
    {
      name: "Yintang (Third Eye)",
      location: "Between the eyebrows",
      benefit: "Reduces anxiety and calms the mind",
      instruction: "Apply gentle pressure with your index finger for 30-60 seconds while breathing deeply.",
    },
    {
      name: "Shen Men (Spirit Gate)",
      location: "Upper part of the ear",
      benefit: "Calms the nervous system",
      instruction: "Gently press with your thumb for 30-60 seconds, breathe slowly.",
    },
    {
      name: "Neiguan (Pericardium 6)",
      location: "Inner forearm, 3 finger-widths from wrist crease",
      benefit: "Relieves stress and anxiety",
      instruction: "Apply gentle pressure between the tendons for 30-60 seconds.",
    },
    {
      name: "Hegu (LI4)",
      location: "Webbing between thumb and index finger",
      benefit: "Eases tension and stress",
      instruction: "Massage gently with circular motions for 30-60 seconds.",
    },
  ];

  // Timer effect
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setElapsedTime((prev) => {
        const newTime = prev + 1;
        if (newTime >= totalTime) {
          setIsRunning(false);
          return newTime;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, totalTime]);

  // Update timer display
  useEffect(() => {
    const remaining = totalTime - elapsedTime;
    setTimerMinutes(Math.floor(remaining / 60));
    setTimerSeconds(remaining % 60);
  }, [elapsedTime, totalTime]);

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
        <View className="px-6 pt-4 pb-2">
          <Text style={{ fontSize: 32, fontFamily: "Poppins_700Bold", color: theme.textPrimary }}>
            Mindfulness Break
          </Text>
          <Text style={{ fontSize: 14, fontFamily: "Poppins_400Regular", color: theme.textSecondary, marginTop: 4 }}>
            Take a moment to breathe and find peace
          </Text>
        </View>

        {/* Tab Navigation */}
        <View style={{ paddingHorizontal: 24, paddingVertical: 16 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16 }}>
            {(["timer", "breathwork", "tips", "acupressure"] as Tab[]).map((tab) => (
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
                  {tab === "timer"
                    ? "Timer"
                    : tab === "breathwork"
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
          {/* Timer Tab */}
          {activeTab === "timer" && (
            <Animated.View entering={FadeIn}>
              <View className="bg-white dark:bg-gray-800 rounded-3xl p-8 mb-6 items-center shadow-lg" style={{ elevation: 5 }}>
                {/* Companion */}
                <View className="mb-6">
                  <StudyPal
                    animal={user?.studyPalConfig.animal || "redpanda"}
                    name={user?.studyPalConfig.name || "Tomo"}
                    animationsEnabled={false}
                    size={60}
                    showName={false}
                    showMessage={false}
                  />
                </View>

                {/* Timer Display */}
                <View className="mb-8">
                  <Text
                    style={{
                      fontSize: 72,
                      fontFamily: "Poppins_700Bold",
                      color: theme.primary,
                      textAlign: "center",
                    }}
                  >
                    {String(timerMinutes).padStart(2, "0")}:{String(timerSeconds).padStart(2, "0")}
                  </Text>
                </View>

                {/* Progress Circle */}
                {animationsEnabled && (
                  <View
                    className="rounded-full mb-8"
                    style={{
                      width: 150,
                      height: 150,
                      backgroundColor: theme.primary + "20",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Animated.View
                      style={[
                        {
                          width: 100,
                          height: 100,
                          borderRadius: 50,
                          backgroundColor: theme.primary + "40",
                        },
                        circleAnimatedStyle,
                      ]}
                    />
                  </View>
                )}

                {/* Timer Input */}
                <View className="flex-row gap-4 mb-6 items-center">
                  <Pressable
                    onPress={() => setTimerMinutes(Math.max(1, timerMinutes - 1))}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: theme.primary + "20",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="remove" size={24} color={theme.primary} />
                  </Pressable>

                  <View style={{
                    flex: 1,
                    backgroundColor: theme.primary + "10",
                    borderRadius: 16,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    alignItems: "center",
                  }}>
                    <Text style={{ fontSize: 16, fontFamily: "Poppins_600SemiBold", color: theme.textPrimary }}>
                      {timerMinutes} min
                    </Text>
                  </View>

                  <Pressable
                    onPress={() => setTimerMinutes(Math.min(60, timerMinutes + 1))}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: theme.primary + "20",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="add" size={24} color={theme.primary} />
                  </Pressable>
                </View>

                {/* Control Buttons */}
                <View className="flex-row gap-3 w-full mb-6">
                  <Pressable
                    onPress={() => {
                      setTotalTime(timerMinutes * 60);
                      setElapsedTime(0);
                      setIsRunning(true);
                    }}
                    disabled={isRunning}
                    className="flex-1"
                  >
                    <LinearGradient
                      colors={[theme.primary, theme.secondary]}
                      style={{ borderRadius: 16, paddingVertical: 16, alignItems: "center", opacity: isRunning ? 0.5 : 1 }}
                    >
                      <Text style={{ fontSize: 16, fontFamily: "Poppins_700Bold", color: "white" }}>
                        Start
                      </Text>
                    </LinearGradient>
                  </Pressable>

                  <Pressable
                    onPress={() => setIsRunning(!isRunning)}
                    disabled={!isRunning && elapsedTime === 0}
                    className="flex-1"
                  >
                    <LinearGradient
                      colors={[theme.secondary, theme.secondary + "CC"]}
                      style={{ borderRadius: 16, paddingVertical: 16, alignItems: "center" }}
                    >
                      <Text style={{ fontSize: 16, fontFamily: "Poppins_700Bold", color: "white" }}>
                        {isRunning ? "Pause" : "Resume"}
                      </Text>
                    </LinearGradient>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      setIsRunning(false);
                      setElapsedTime(0);
                    }}
                    className="flex-1"
                  >
                    <LinearGradient
                      colors={[theme.secondary + "66", theme.secondary + "33"]}
                      style={{ borderRadius: 16, paddingVertical: 16, alignItems: "center" }}
                    >
                      <Text style={{ fontSize: 16, fontFamily: "Poppins_700Bold", color: theme.textPrimary }}>
                        Stop
                      </Text>
                    </LinearGradient>
                  </Pressable>
                </View>

                {/* Encouragement */}
                <View className="bg-blue-50 dark:bg-blue-900 rounded-2xl p-4 w-full">
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "Poppins_500Medium",
                      color: "#1E40AF",
                      textAlign: "center",
                    }}
                  >
                    🌬️ Breathe deeply, focus on the moment
                  </Text>
                </View>
              </View>
            </Animated.View>
          )}

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
                    <StudyPal
                      animal={user?.studyPalConfig.animal || "redpanda"}
                      name={user?.studyPalConfig.name || "Tomo"}
                      animationsEnabled={false}
                      size={50}
                      showName={false}
                      showMessage={false}
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
                  <View className="bg-blue-50 dark:bg-blue-900 rounded-2xl p-4 mb-6 w-full">
                    <Text
                      style={{
                        fontSize: 13,
                        fontFamily: "Poppins_400Regular",
                        color: "#1E40AF",
                        textAlign: "center",
                        lineHeight: 20,
                      }}
                    >
                      {breathworkType === "box"
                        ? "Breathe in through your nose for 4, hold for 4, exhale through your mouth for 4, hold for 4. Repeat."
                        : "Breathe in gently through your nose for 4 counts, exhale slowly through your mouth for 6 counts. Repeat."}
                    </Text>
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
                <View className="bg-yellow-50 dark:bg-yellow-900 rounded-2xl p-4 border border-yellow-200 dark:border-yellow-700">
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Poppins_500Medium",
                      color: "#92400E",
                      lineHeight: 18,
                    }}
                  >
                    ⚠️ <Text style={{ fontFamily: "Poppins_700Bold" }}>Safety:</Text> Use gentle pressure only. Do not use on broken skin or injured areas. If pain persists, consult a healthcare professional.
                  </Text>
                </View>

                {/* Parent Support Guide */}
                <View className="bg-blue-50 dark:bg-blue-900 rounded-2xl p-4 border border-blue-200 dark:border-blue-700">
                  <View className="flex-row items-start gap-3 mb-2">
                    <Text style={{ fontSize: 16, fontFamily: "Poppins_700Bold", color: "#1E40AF" }}>
                      👋 Ask a Parent for Help
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Poppins_400Regular",
                      color: "#1E40AF",
                      lineHeight: 18,
                    }}
                  >
                    These acupressure points work best with a little help! Ask a parent, guardian, or trusted adult to help you locate and gently press each point. They can guide your fingers to the right spot and help you remember to breathe deeply. Learning together makes it even more helpful for reducing stress and anxiety.
                  </Text>
                </View>

                {/* Acupressure Points */}
                {acupressurePoints.map((point, index) => (
                  <View
                    key={index}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow"
                    style={{ elevation: 2 }}
                  >
                    <View className="flex-row items-start gap-3 mb-2">
                      <View
                        className="w-8 h-8 rounded-full items-center justify-center"
                        style={{ backgroundColor: theme.primary + "40" }}
                      >
                        <Ionicons name="hand-left" size={18} color={theme.primary} />
                      </View>
                      <View className="flex-1">
                        <Text style={{ fontSize: 16, fontFamily: "Poppins_700Bold", color: theme.textPrimary }}>
                          {point.name}
                        </Text>
                        <Text style={{ fontSize: 13, fontFamily: "Poppins_500Medium", color: theme.primary, marginTop: 2 }}>
                          📍 {point.location}
                        </Text>
                      </View>
                    </View>

                    <Text
                      style={{
                        fontSize: 13,
                        fontFamily: "Poppins_500Medium",
                        color: "#10B981",
                        marginBottom: 6,
                        marginLeft: 32,
                      }}
                    >
                      ✓ {point.benefit}
                    </Text>

                    <Text
                      style={{
                        fontSize: 13,
                        fontFamily: "Poppins_400Regular",
                        color: theme.textSecondary,
                        lineHeight: 18,
                        marginLeft: 32,
                      }}
                    >
                      {point.instruction}
                    </Text>
                  </View>
                ))}
              </View>
            </Animated.View>
          )}

          <View className="h-8" />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default MindfulnessScreen;
