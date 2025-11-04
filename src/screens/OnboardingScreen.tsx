import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import useUserStore from "../state/userStore";
import useStatsStore from "../state/statsStore";
import { StudyPalAnimal, ThemeColor } from "../types";
import { cn } from "../utils/cn";

interface OnboardingScreenProps {
  onComplete: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const setUser = useUserStore((s) => s.setUser);
  const initStats = useStatsStore((s) => s.initStats);

  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [studyPalName, setStudyPalName] = useState("Buddy");
  const [animal, setAnimal] = useState<StudyPalAnimal>("cat");
  const [themeColor, setThemeColor] = useState<ThemeColor>("nature");

  const animals: StudyPalAnimal[] = [
    "cat", "bunny", "bear", "dog", "fox", "panda",
    "koala", "owl", "penguin", "lion", "tiger", "monkey",
    "elephant", "giraffe", "hamster", "raccoon", "hedgehog", "deer",
    "duck", "frog"
  ];

  const themes: { color: ThemeColor; colors: [string, string]; emoji: string; name: string }[] = [
    { color: "nature", colors: ["#4CAF50", "#2E7D32"], emoji: "🌿", name: "Nature" },
    { color: "ocean", colors: ["#0288D1", "#01579B"], emoji: "🌊", name: "Ocean" },
    { color: "sunset", colors: ["#FF6F00", "#E65100"], emoji: "🌅", name: "Sunset" },
    { color: "galaxy", colors: ["#5E35B1", "#311B92"], emoji: "🌌", name: "Galaxy" },
    { color: "rainbow", colors: ["#FBC02D", "#F57F17"], emoji: "🌈", name: "Rainbow" },
    { color: "forest", colors: ["#2E7D32", "#1B5E20"], emoji: "🌲", name: "Forest" },
    { color: "desert", colors: ["#F57C00", "#E65100"], emoji: "🏜️", name: "Desert" },
    { color: "arctic", colors: ["#00796B", "#004D40"], emoji: "❄️", name: "Arctic" },
    { color: "autumn", colors: ["#E64A19", "#BF360C"], emoji: "🍂", name: "Autumn" },
    { color: "cherry", colors: ["#C2185B", "#880E4F"], emoji: "🌸", name: "Cherry Blossom" },
  ];

  const handleComplete = () => {
    const userId = Date.now().toString();
    setUser({
      id: userId,
      username: username.trim() || "Student",
      role: "student",
      language: "en",
      themeColor,
      studyPalConfig: {
        name: studyPalName,
        animal,
        animationsEnabled: true,
      },
      notificationEnabled: true,
      createdAt: new Date(),
    });
    initStats(userId);
    onComplete();
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-8">
          {/* Logo/Title */}
          <View className="items-center mb-8">
            <Text className="text-5xl mb-4">📚</Text>
            <Text className="text-4xl font-bold text-gray-800 dark:text-gray-100">
              StudyPal
            </Text>
            <Text className="text-lg text-gray-600 dark:text-gray-400 mt-2 text-center">
              Your personal study companion
            </Text>
          </View>

          {/* Step Indicator */}
          <View className="flex-row justify-center mb-8">
            {[1, 2, 3, 4].map((s) => (
              <View
                key={s}
                className={cn(
                  "w-10 h-2 rounded-full mx-1",
                  s === step
                    ? "bg-blue-500"
                    : s < step
                    ? "bg-blue-300"
                    : "bg-gray-300 dark:bg-gray-700"
                )}
              />
            ))}
          </View>

          {/* Step 1: Username */}
          {step === 1 && (
            <View>
              <Text className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                What should we call you?
              </Text>
              <Text className="text-gray-600 dark:text-gray-400 mb-6">
                Enter your name or nickname
              </Text>
              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="Enter your name"
                placeholderTextColor="#9CA3AF"
                className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-2xl px-6 py-4 text-lg mb-6"
                autoFocus
              />
            </View>
          )}

          {/* Step 2: Study Pal Name */}
          {step === 2 && (
            <View>
              <Text className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                Name your Study Pal
              </Text>
              <Text className="text-gray-600 dark:text-gray-400 mb-6">
                This cute companion will help keep you motivated
              </Text>
              <TextInput
                value={studyPalName}
                onChangeText={setStudyPalName}
                placeholder="Enter a name"
                placeholderTextColor="#9CA3AF"
                className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-2xl px-6 py-4 text-lg mb-6"
              />
            </View>
          )}

          {/* Step 3: Choose Animal */}
          {step === 3 && (
            <View>
              <Text className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                Choose your Study Pal
              </Text>
              <Text className="text-gray-600 dark:text-gray-400 mb-6">
                Pick your favorite animal companion
              </Text>
              <View className="flex-row flex-wrap gap-3 max-h-96">
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View className="flex-row flex-wrap gap-3">
                    {animals.map((a) => {
                      const emojiMap: Record<StudyPalAnimal, string> = {
                        cat: "🐱", bunny: "🐰", bear: "🐻", dog: "🐶", fox: "🦊", panda: "🐼",
                        koala: "🐨", owl: "🦉", penguin: "🐧", lion: "🦁", tiger: "🐯", monkey: "🐵",
                        elephant: "🐘", giraffe: "🦒", hamster: "🐹", raccoon: "🦝", hedgehog: "🦔",
                        deer: "🦌", duck: "🦆", frog: "🐸"
                      };
                      return (
                        <Pressable
                          key={a}
                          onPress={() => setAnimal(a)}
                          className={cn(
                            "w-[30%] aspect-square bg-white dark:bg-gray-800 rounded-2xl items-center justify-center mb-3",
                            animal === a && "border-4 border-blue-500"
                          )}
                        >
                          <Text className="text-4xl">{emojiMap[a]}</Text>
                          <Text className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-1 capitalize">
                            {a}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>
            </View>
          )}

          {/* Step 4: Choose Theme */}
          {step === 4 && (
            <View>
              <Text className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                Choose your environment
              </Text>
              <Text className="text-gray-600 dark:text-gray-400 mb-6">
                Pick a theme that matches your vibe
              </Text>
              <View className="flex-row flex-wrap gap-3">
                {themes.map((theme) => (
                  <Pressable
                    key={theme.color}
                    onPress={() => setThemeColor(theme.color)}
                    className={cn(
                      "w-[30%] bg-white dark:bg-gray-800 rounded-2xl p-3 items-center",
                      themeColor === theme.color && "border-4 border-blue-500"
                    )}
                  >
                    <LinearGradient
                      colors={theme.colors}
                      className="w-16 h-16 rounded-2xl items-center justify-center mb-2"
                    >
                      <Text className="text-3xl">{theme.emoji}</Text>
                    </LinearGradient>
                    <Text className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">
                      {theme.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Navigation Buttons */}
          <View className="flex-row gap-3 mt-8">
            {step > 1 && (
              <Pressable
                onPress={() => setStep(step - 1)}
                className="flex-1 bg-gray-200 dark:bg-gray-700 py-4 rounded-2xl items-center"
              >
                <Text className="text-gray-700 dark:text-gray-300 font-semibold text-lg">
                  Back
                </Text>
              </Pressable>
            )}
            <Pressable
              onPress={() => {
                if (step < 4) {
                  setStep(step + 1);
                } else {
                  handleComplete();
                }
              }}
              disabled={step === 1 && !username.trim()}
              className={cn(
                "flex-1 py-4 rounded-2xl items-center",
                step === 1 && !username.trim()
                  ? "bg-gray-300 dark:bg-gray-700"
                  : ""
              )}
            >
              <LinearGradient
                colors={
                  step === 1 && !username.trim()
                    ? ["#D1D5DB", "#9CA3AF"]
                    : ["#3B82F6", "#1D4ED8"]
                }
                className="w-full py-4 rounded-2xl items-center"
              >
                <Text className="text-white font-bold text-lg">
                  {step === 4 ? "Get Started" : "Next"}
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OnboardingScreen;
