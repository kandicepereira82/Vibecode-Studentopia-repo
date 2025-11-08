import React, { useState } from "react";
import { View, Text, Pressable, Dimensions, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

interface TutorialStep {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: [string, string];
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: "Welcome to Studentopia!",
    description: "Your personal study companion is here to help you stay organized, focused, and achieve academic success.",
    icon: "sparkles",
    gradient: ["#4CAF50", "#2E7D32"],
  },
  {
    title: "Organize Your Tasks",
    description: "Create tasks with due dates, set reminders, and sync automatically with your Google Calendar or Apple Calendar.",
    icon: "checkbox",
    gradient: ["#3B82F6", "#1E40AF"],
  },
  {
    title: "Stay Focused with Timer",
    description: "Use the Pomodoro timer for focused study sessions with customizable durations. Take regular breaks to stay fresh!",
    icon: "time",
    gradient: ["#F59E0B", "#D97706"],
  },
  {
    title: "AI Study Assistant",
    description: "Get instant help with homework and study questions from OpenAI, Claude, or Grok. Available 24/7 in your language!",
    icon: "chatbubbles",
    gradient: ["#8B5CF6", "#6D28D9"],
  },
  {
    title: "Mindfulness & Wellness",
    description: "Take care of your mental health with breathwork exercises, mindfulness tips, and acupressure guides.",
    icon: "heart",
    gradient: ["#EC4899", "#BE185D"],
  },
  {
    title: "Study Together",
    description: "Join live study sessions with friends, use synchronized timers, and stay accountable together.",
    icon: "people",
    gradient: ["#14B8A6", "#0D9488"],
  },
];

interface TutorialScreenProps {
  onComplete: () => void;
}

const TutorialScreen: React.FC<TutorialScreenProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem("@studentopia_tutorial_completed", "true");
    onComplete();
  };

  const handleComplete = async () => {
    await AsyncStorage.setItem("@studentopia_tutorial_completed", "true");
    onComplete();
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = TUTORIAL_STEPS[currentStep];
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: "#F9FAFB" }}>
      <LinearGradient colors={step.gradient} className="flex-1">
        {/* Skip Button */}
        {!isLastStep && (
          <View className="absolute top-16 right-6 z-10">
            <Pressable
              onPress={handleSkip}
              className="px-6 py-3 rounded-full"
              style={{ backgroundColor: "rgba(255,255,255,0.3)" }}
            >
              <Text className="text-white font-semibold text-base">Skip</Text>
            </Pressable>
          </View>
        )}

        {/* Content */}
        <View className="flex-1 items-center justify-center px-8">
          {/* Icon Circle */}
          <View
            className="w-32 h-32 rounded-full items-center justify-center mb-8"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
          >
            <Ionicons name={step.icon} size={64} color="#FFFFFF" />
          </View>

          {/* Title */}
          <Text className="text-4xl font-bold text-white text-center mb-6" style={{ fontFamily: "Poppins_700Bold" }}>
            {step.title}
          </Text>

          {/* Description */}
          <Text
            className="text-lg text-white text-center leading-7"
            style={{ fontFamily: "Poppins_400Regular", maxWidth: width - 80 }}
          >
            {step.description}
          </Text>
        </View>

        {/* Bottom Navigation */}
        <View className="px-8 pb-8">
          {/* Progress Dots */}
          <View className="flex-row justify-center items-center mb-8">
            {TUTORIAL_STEPS.map((_, index) => (
              <View
                key={index}
                className="mx-1.5"
                style={{
                  width: index === currentStep ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: index === currentStep ? "#FFFFFF" : "rgba(255,255,255,0.4)",
                }}
              />
            ))}
          </View>

          {/* Navigation Buttons */}
          <View className="flex-row items-center justify-between">
            {/* Back Button */}
            {currentStep > 0 ? (
              <Pressable
                onPress={handlePrev}
                className="w-14 h-14 rounded-full items-center justify-center"
                style={{ backgroundColor: "rgba(255,255,255,0.3)" }}
              >
                <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
              </Pressable>
            ) : (
              <View className="w-14" />
            )}

            {/* Next/Get Started Button */}
            <Pressable
              onPress={handleNext}
              className="flex-1 mx-4 rounded-2xl py-4 items-center justify-center"
              style={{ backgroundColor: "#FFFFFF" }}
            >
              <Text className="text-lg font-bold" style={{ fontFamily: "Poppins_700Bold", color: step.gradient[0] }}>
                {isLastStep ? "Get Started" : "Next"}
              </Text>
            </Pressable>

            {/* Next Arrow (placeholder for last step) */}
            {!isLastStep ? (
              <Pressable
                onPress={handleNext}
                className="w-14 h-14 rounded-full items-center justify-center"
                style={{ backgroundColor: "rgba(255,255,255,0.3)" }}
              >
                <Ionicons name="chevron-forward" size={28} color="#FFFFFF" />
              </Pressable>
            ) : (
              <View className="w-14" />
            )}
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default TutorialScreen;
