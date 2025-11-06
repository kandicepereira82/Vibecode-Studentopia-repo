import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import useUserStore from "../state/userStore";
import useOnboardingStore from "../state/onboardingStore";
import { StudyPalAnimal, ThemeColor } from "../types";
import { cn } from "../utils/cn";
import { getAnimalImage, getAnimalDisplayName, ALL_ANIMALS } from "../utils/animalUtils";
import { ALL_THEMES } from "../utils/themeUtils";
import StudyPal from "../components/StudyPal";

interface OnboardingScreenProps {
  onComplete: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const setPreferences = useOnboardingStore((s) => s.setPreferences);

  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [studyPalName, setStudyPalName] = useState("Tomo");
  const [animal, setAnimal] = useState<StudyPalAnimal>("redpanda");
  const [themeColor, setThemeColor] = useState<ThemeColor>("nature");
  const [showCelebration, setShowCelebration] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  const validateEmail = (emailValue: string): boolean => {
    if (!emailValue.trim()) return true; // Email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailValue);
  };

  const validateStep = (stepNumber: number): boolean => {
    const errors: { [key: string]: string } = {};

    if (stepNumber === 1) {
      if (!username.trim()) {
        errors.username = "Please enter your name";
      }
      if (email.trim() && !validateEmail(email)) {
        errors.email = "Please enter a valid email address";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleComplete = () => {
    setShowCelebration(true);
    setTimeout(() => {
      // Save preferences to onboarding store for AuthenticationScreen to use
      setPreferences({
        username: username.trim() || "Student",
        email: email.trim(),
        role,
        studyPalName,
        animal,
        themeColor,
      });
      onComplete();
    }, 1500);
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-8">
          {/* App Icon and Title */}
          <View className="items-center mb-8">
            {/* App Icon Image */}
            <View
              style={{
                width: 140,
                height: 140,
                borderRadius: 32,
                overflow: 'hidden',
                marginBottom: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8
              }}
            >
              <Image
                source={require("../../assets/image-1762386191.png")}
                style={{ width: 140, height: 140 }}
                resizeMode="cover"
              />
            </View>
            <Text style={{
              fontSize: 24,
              fontFamily: 'Poppins_600SemiBold',
              color: '#1F2937',
              textAlign: 'center',
              marginBottom: 8
            }}>
              Welcome to Studentopia
            </Text>
            <Text style={{
              fontSize: 16,
              fontFamily: 'Poppins_400Regular',
              color: '#6B7280',
              textAlign: 'center'
            }}>
              Learn, Focus, Grow together
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

          {/* Step 1: Username & Role */}
          {step === 1 && (
            <View>
              <Text style={{
                fontSize: 22,
                fontFamily: 'Poppins_700Bold',
                color: '#1F2937',
                marginBottom: 8
              }}>
                What should we call you?
              </Text>
              <Text style={{
                fontSize: 15,
                fontFamily: 'Poppins_400Regular',
                color: '#6B7280',
                marginBottom: 16
              }}>
                Enter your name or nickname so your Studentopia Companion can greet you personally.
              </Text>
              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="Enter your name"
                placeholderTextColor="#9CA3AF"
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#1F2937',
                  borderRadius: 16,
                  paddingHorizontal: 24,
                  paddingVertical: 16,
                  fontSize: 16,
                  fontFamily: 'Poppins_400Regular',
                  marginBottom: validationErrors.username ? 8 : 24,
                  borderWidth: validationErrors.username ? 2 : 1,
                  borderColor: validationErrors.username ? '#EF4444' : '#E5E7EB'
                }}
                autoFocus
              />
              {validationErrors.username && (
                <Text style={{
                  fontSize: 13,
                  fontFamily: 'Poppins_500Medium',
                  color: '#EF4444',
                  marginBottom: 16
                }}>
                  {validationErrors.username}
                </Text>
              )}

              <Text style={{
                fontSize: 15,
                fontFamily: 'Poppins_400Regular',
                color: '#6B7280',
                marginBottom: 8
              }}>
                Email (optional)
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#1F2937',
                  borderRadius: 16,
                  paddingHorizontal: 24,
                  paddingVertical: 16,
                  fontSize: 16,
                  fontFamily: 'Poppins_400Regular',
                  marginBottom: validationErrors.email ? 8 : 24,
                  borderWidth: validationErrors.email ? 2 : 1,
                  borderColor: validationErrors.email ? '#EF4444' : '#E5E7EB'
                }}
              />
              {validationErrors.email && (
                <Text style={{
                  fontSize: 13,
                  fontFamily: 'Poppins_500Medium',
                  color: '#EF4444',
                  marginBottom: 16
                }}>
                  {validationErrors.email}
                </Text>
              )}

              <Text style={{
                fontSize: 20,
                fontFamily: 'Poppins_700Bold',
                color: '#1F2937',
                marginBottom: 8
              }}>
                Are you a student or teacher?
              </Text>
              <View className="flex-row gap-3 mb-6">
                <Pressable
                  onPress={() => setRole("student")}
                  className={cn(
                    "flex-1 py-4 rounded-2xl items-center border-2",
                    role === "student"
                      ? "bg-blue-50 dark:bg-blue-900 border-blue-500"
                      : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                  )}
                >
                  <Ionicons
                    name="school"
                    size={32}
                    color={role === "student" ? "#3B82F6" : "#9CA3AF"}
                  />
                  <Text style={{
                    fontSize: 16,
                    fontFamily: 'Poppins_600SemiBold',
                    color: role === "student" ? "#3B82F6" : "#6B7280",
                    marginTop: 8
                  }}>
                    Student
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setRole("teacher")}
                  className={cn(
                    "flex-1 py-4 rounded-2xl items-center border-2",
                    role === "teacher"
                      ? "bg-blue-50 dark:bg-blue-900 border-blue-500"
                      : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                  )}
                >
                  <Ionicons
                    name="book"
                    size={32}
                    color={role === "teacher" ? "#3B82F6" : "#9CA3AF"}
                  />
                  <Text style={{
                    fontSize: 16,
                    fontFamily: 'Poppins_600SemiBold',
                    color: role === "teacher" ? "#3B82F6" : "#6B7280",
                    marginTop: 8
                  }}>
                    Teacher
                  </Text>
                </Pressable>
              </View>

              {username.trim() && (
                <View className="bg-blue-50 dark:bg-blue-900 rounded-2xl p-4 mt-2">
                  <Text style={{
                    fontSize: 15,
                    fontFamily: 'Poppins_500Medium',
                    color: '#1E40AF',
                    textAlign: 'center',
                    lineHeight: 22
                  }}>
                    {"Hi " + username + "! I'm your Studentopia Companion."}
                  </Text>
                  <Text style={{
                    fontSize: 15,
                    fontFamily: 'Poppins_500Medium',
                    color: '#1E40AF',
                    textAlign: 'center',
                    lineHeight: 22
                  }}>
                    {"Let's make every day fun and focused!"}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Step 2: Studentopia Companion Name */}
          {step === 2 && (
            <View>
              <Text style={{
                fontSize: 22,
                fontFamily: 'Poppins_700Bold',
                color: '#1F2937',
                marginBottom: 8
              }}>
                Name your Studentopia Companion
              </Text>
              <Text style={{
                fontSize: 15,
                fontFamily: 'Poppins_400Regular',
                color: '#6B7280',
                marginBottom: 24
              }}>
                This cute companion will help keep you motivated. You can rename them later!
              </Text>

              {/* Dynamic preview with chosen name */}
              <View className="items-center mb-6">
                <StudyPal
                  animal={animal}
                  name={studyPalName}
                  animationsEnabled={false}
                  size={100}
                  showName={true}
                  showMessage={false}
                />
              </View>

              <TextInput
                value={studyPalName}
                onChangeText={setStudyPalName}
                placeholder="Enter a name"
                placeholderTextColor="#9CA3AF"
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#1F2937',
                  borderRadius: 16,
                  paddingHorizontal: 24,
                  paddingVertical: 16,
                  fontSize: 16,
                  fontFamily: 'Poppins_400Regular',
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: '#E5E7EB'
                }}
              />

              <View className="bg-purple-50 dark:bg-purple-900 rounded-2xl p-4">
                <Text style={{
                  fontSize: 15,
                  fontFamily: 'Poppins_500Medium',
                  color: '#6B21A8',
                  textAlign: 'center'
                }}>
                  Your Studentopia Companion is excited to be part of your journey!
                </Text>
              </View>
            </View>
          )}

          {/* Step 3: Choose Animal */}
          {step === 3 && (
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 22,
                fontFamily: 'Poppins_700Bold',
                color: '#1F2937',
                marginBottom: 8
              }}>
                Choose your Studentopia Companion
              </Text>
              <Text style={{
                fontSize: 15,
                fontFamily: 'Poppins_400Regular',
                color: '#6B7280',
                marginBottom: 16
              }}>
                {"Pick your favourite animal companion — they'll journey with you through every task and study session!"}
              </Text>

              <View className="bg-blue-50 dark:bg-blue-900 rounded-2xl p-4 mb-6">
                <Text style={{
                  fontSize: 15,
                  fontFamily: 'Poppins_500Medium',
                  color: '#1E40AF',
                  textAlign: 'center'
                }}>
                  {"Your Studentopia Companion will guide you, cheer you on, and help you stay on track!"}
                </Text>
              </View>

              {/* Scrollable Animal Grid - 5x5 */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
                {ALL_ANIMALS.map((a) => {
                  return (
                    <Pressable
                      key={a}
                      onPress={() => setAnimal(a)}
                      style={{
                        width: '18.5%',
                        aspectRatio: 1,
                        backgroundColor: animal === a ? '#DBEAFE' : 'white',
                        borderRadius: 16,
                        borderWidth: animal === a ? 4 : 0,
                        borderColor: animal === a ? '#3B82F6' : 'transparent',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 12,
                        paddingVertical: 8,
                        paddingHorizontal: 4,
                      }}
                    >
                      <Image
                        source={getAnimalImage(a)}
                        style={{ width: 50, height: 50, marginBottom: 4 }}
                        resizeMode="contain"
                      />
                      <Text style={{
                        fontSize: 9,
                        fontFamily: 'Poppins_500Medium',
                        color: '#374151',
                        textAlign: 'center',
                        textTransform: 'capitalize'
                      }}>
                        {getAnimalDisplayName(a)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          {/* Step 4: Choose Theme */}
          {step === 4 && (
            <View>
              <Text style={{
                fontSize: 22,
                fontFamily: 'Poppins_700Bold',
                color: '#1F2937',
                marginBottom: 8
              }}>
                Choose your environment
              </Text>
              <Text style={{
                fontSize: 15,
                fontFamily: 'Poppins_400Regular',
                color: '#6B7280',
                marginBottom: 16
              }}>
                {"Pick a theme that matches your vibe — your Studentopia Companion will explore it with you!"}
              </Text>

              {/* Real-time theme preview */}
              <View className="items-center mb-6">
                <LinearGradient
                  colors={ALL_THEMES.find((t) => t.color === themeColor)?.colors || ["#4CAF50", "#2E7D32"]}
                  className="w-full h-32 rounded-2xl items-center justify-center"
                >
                  <StudyPal
                    animal={animal}
                    name={studyPalName}
                    animationsEnabled={false}
                    size={80}
                    showName={false}
                    showMessage={false}
                  />
                </LinearGradient>
              </View>

              <View className="bg-green-50 dark:bg-green-900 rounded-2xl p-4 mb-6">
                <Text style={{
                  fontSize: 15,
                  fontFamily: 'Poppins_500Medium',
                  color: '#166534',
                  textAlign: 'center'
                }}>
                  Make your Studentopia Companion feel right at home!
                </Text>
              </View>

              <View className="flex-row flex-wrap gap-3">
                {ALL_THEMES.map((theme) => (
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
                    <Text style={{
                      fontSize: 11,
                      fontFamily: 'Poppins_500Medium',
                      color: '#374151',
                      textAlign: 'center'
                    }}>
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
                style={{
                  flex: 1,
                  backgroundColor: '#F3F4F6',
                  paddingVertical: 16,
                  borderRadius: 16,
                  alignItems: 'center'
                }}
              >
                <Text style={{
                  fontSize: 16,
                  fontFamily: 'Poppins_600SemiBold',
                  color: '#4B5563'
                }}>
                  Back
                </Text>
              </Pressable>
            )}
            <Pressable
              onPress={() => {
                if (step < 4) {
                  if (validateStep(step)) {
                    setStep(step + 1);
                    setValidationErrors({});
                  }
                } else {
                  handleComplete();
                }
              }}
              disabled={step === 1 && (!username.trim() || (email.trim() && !validateEmail(email))) || false}
              style={{ flex: 1 }}
            >
              <LinearGradient
                colors={
                  step === 1 && !username.trim()
                    ? ["#D1D5DB", "#9CA3AF"]
                    : ["#3B82F6", "#1D4ED8"]
                }
                style={{
                  width: '100%',
                  paddingVertical: 16,
                  borderRadius: 16,
                  alignItems: 'center'
                }}
              >
                <Text style={{
                  fontSize: 16,
                  fontFamily: 'Poppins_700Bold',
                  color: '#FFFFFF'
                }}>
                  {step === 4 ? "Get Started" : "Next"}
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Celebration Modal */}
      {showCelebration && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24
          }}
        >
          <View className="bg-white dark:bg-gray-800 rounded-3xl p-8 items-center max-w-sm">
            <View className="mb-6">
              <StudyPal
                animal={animal}
                name={studyPalName}
                animationsEnabled={false}
                size={120}
                showName={false}
                showMessage={false}
              />
            </View>
            <Text style={{
              fontSize: 28,
              fontFamily: 'Poppins_700Bold',
              color: '#1F2937',
              marginBottom: 16,
              textAlign: 'center'
            }}>
              {"You're ready!"}
            </Text>
            <Text style={{
              fontSize: 16,
              fontFamily: 'Poppins_400Regular',
              color: '#6B7280',
              textAlign: 'center',
              lineHeight: 24
            }}>
              {"Your Studentopia Companion is here to help you focus, stay motivated, and enjoy every step of your journey."}
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default OnboardingScreen;
