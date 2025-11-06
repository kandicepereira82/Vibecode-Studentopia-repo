import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Modal, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import useUserStore from "../state/userStore";
import { useTranslation, languageNames } from "../utils/translations";
import { Language, ThemeColor, StudyPalAnimal, AvatarCustomization } from "../types";
import { cn } from "../utils/cn";
import { getAnimalImage, getAnimalDisplayName, ALL_ANIMALS } from "../utils/animalUtils";
import { ALL_THEMES } from "../utils/themeUtils";
import StudyPal from "../components/StudyPal";
import SettingsScreen from "./SettingsScreen";
import { useGlobalToast } from "../context/ToastContext";
import { validateName } from "../utils/contentModeration";
import AvatarCreator from "../components/AvatarCreator";

const ProfileScreen = () => {
  const user = useUserStore((s) => s.user);
  const updateLanguage = useUserStore((s) => s.updateLanguage);
  const updateThemeColor = useUserStore((s) => s.updateThemeColor);
  const updateStudyPal = useUserStore((s) => s.updateStudyPal);
  const updateAvatar = useUserStore((s) => s.updateAvatar);
  const toggleAnimations = useUserStore((s) => s.toggleAnimations);
  const toggleNotifications = useUserStore((s) => s.toggleNotifications);
  const toast = useGlobalToast();

  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showAnimalModal, setShowAnimalModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAvatarCreator, setShowAvatarCreator] = useState(false);
  const [studyPalName, setStudyPalName] = useState(user?.studyPalConfig.name || "Buddy");

  const { t } = useTranslation(user?.language || "en");

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: "en", name: "English (UK)", flag: "🇬🇧" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "zh", name: "简体中文", flag: "🇨🇳" },
    { code: "ja", name: "日本語", flag: "🇯🇵" },
    { code: "ar", name: "العربية", flag: "🇸🇦" },
    { code: "ko", name: "한국어", flag: "🇰🇷" },
    { code: "pt", name: "Português (BR)", flag: "🇧🇷" },
    { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
    { code: "it", name: "Italiano", flag: "🇮🇹" },
    { code: "tr", name: "Türkçe", flag: "🇹🇷" },
    { code: "ru", name: "Русский", flag: "🇷🇺" },
    { code: "id", name: "Bahasa Indonesia", flag: "🇮🇩" },
  ];

  const handleSavePalName = () => {
    if (user && studyPalName.trim()) {
      // Validate companion name before saving
      const validation = validateName(studyPalName, "companion");
      if (!validation.isValid) {
        toast.error(validation.error || "Invalid companion name");
        return;
      }
      updateStudyPal(studyPalName, user.studyPalConfig.animal);
      toast.success("Companion name updated!");
    } else {
      toast.error("Please enter a name for your companion");
    }
  };

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            No user profile found
          </Text>
          <Text className="text-center text-gray-600 dark:text-gray-400 mb-8">
            Tap below to set up your profile
          </Text>
          <Pressable
            onPress={() => {
              // Create a default user with English (UK)
              const userId = Date.now().toString();
              const newUser = {
                id: userId,
                username: "Student",
                role: "student" as const,
                language: "en" as const,
                themeColor: "nature" as const,
                studyPalConfig: {
                  name: "Buddy",
                  animal: "cat" as const,
                  animationsEnabled: true,
                },
                notificationEnabled: true,
                notificationSound: true,
                notificationVibration: true,
                mindfulnessBreakEnabled: true,
                createdAt: new Date(),
              };
              useUserStore.getState().setUser(newUser);
            }}
            className="bg-blue-500 px-8 py-4 rounded-2xl"
          >
            <Text className="text-white font-bold text-lg">Set Up Profile</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header with Settings Button */}
        <View className="px-6 pt-4 pb-2 flex-row items-center justify-between">
          <Text className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            {t("profile")}
          </Text>
          <Pressable
            onPress={() => setShowSettingsModal(true)}
            className="w-10 h-10 bg-blue-500 rounded-full items-center justify-center"
          >
            <Ionicons name="settings" size={20} color="white" />
          </Pressable>
        </View>

        {/* User Info */}
        <View className="px-6 py-4">
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-6 items-center">
            <View className="w-24 h-24 bg-blue-100 dark:bg-blue-900 rounded-full items-center justify-center mb-4">
              <Text className="text-4xl">
                {user.username.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {user.username}
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {user.email || "student@studypal.com"}
            </Text>
          </View>
        </View>

        {/* Studentopia Companion Settings */}
        <View className="px-6 py-4">
          <Text className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">
            Studentopia Companion
          </Text>

          <View className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-3 items-center">
            <StudyPal
              animal={user.studyPalConfig.animal}
              name={user.studyPalConfig.name}
              animationsEnabled={user.studyPalConfig.animationsEnabled}
              size={100}
              showName={true}
              showMessage={false}
              customAvatar={user.studyPalConfig.avatar}
            />
          </View>

          <View className="bg-white dark:bg-gray-800 rounded-2xl p-4">
            {/* Studentopia Companion Name */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("studyPalName")}
              </Text>
              <View className="flex-row gap-2">
                <TextInput
                  value={studyPalName}
                  onChangeText={setStudyPalName}
                  placeholder="Enter name"
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-xl px-4 py-3"
                  maxLength={20}
                />
                <Pressable
                  onPress={handleSavePalName}
                  className="bg-blue-500 rounded-xl px-6 items-center justify-center"
                >
                  <Text className="text-white font-semibold">{t("save")}</Text>
                </Pressable>
              </View>
            </View>

            {/* Studentopia Companion Animal */}
            <Pressable
              onPress={() => setShowAnimalModal(true)}
              className="flex-row items-center justify-between py-3 border-t border-gray-200 dark:border-gray-700"
            >
              <Text className="text-base text-gray-800 dark:text-gray-100">
                {t("studyPalAnimal")}
              </Text>
              <View className="flex-row items-center">
                <Image
                  source={getAnimalImage(user.studyPalConfig.animal)}
                  style={{ width: 32, height: 32, marginRight: 8 }}
                  resizeMode="contain"
                />
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </View>
            </Pressable>

            {/* Animations Toggle */}
            <View className="flex-row items-center justify-between py-3 border-t border-gray-200 dark:border-gray-700">
              <Text className="text-base text-gray-800 dark:text-gray-100">
                {t("animations")}
              </Text>
              <Pressable
                onPress={toggleAnimations}
                className={cn(
                  "w-12 h-7 rounded-full justify-center px-1",
                  user.studyPalConfig.animationsEnabled
                    ? "bg-blue-500"
                    : "bg-gray-300 dark:bg-gray-600"
                )}
              >
                <View
                  className={cn(
                    "w-5 h-5 rounded-full bg-white",
                    user.studyPalConfig.animationsEnabled && "ml-auto"
                  )}
                />
              </Pressable>
            </View>

            {/* Avatar Customisation Button */}
            <Pressable
              onPress={() => setShowAvatarCreator(true)}
              className="flex-row items-center justify-between py-3 border-t border-gray-200 dark:border-gray-700"
            >
              <Text className="text-base text-gray-800 dark:text-gray-100">
                Avatar Customisation
              </Text>
              <View className="flex-row items-center">
                <Ionicons name="color-palette" size={20} color="#3B82F6" style={{ marginRight: 8 }} />
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </View>
            </Pressable>
          </View>
        </View>

        {/* Settings */}
        <View className="px-6 py-4">
          <Text className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">
            {t("settings")}
          </Text>

          <View className="bg-white dark:bg-gray-800 rounded-2xl p-4">
            {/* Language */}
            <Pressable
              onPress={() => setShowLanguageModal(true)}
              className="flex-row items-center justify-between py-3"
            >
              <Text className="text-base text-gray-800 dark:text-gray-100">
                {t("language")}
              </Text>
              <View className="flex-row items-center">
                <Text className="text-gray-600 dark:text-gray-400 mr-2">
                  {languages.find((l) => l.code === user.language)?.name || "English"}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </View>
            </Pressable>

            {/* Theme */}
            <Pressable
              onPress={() => setShowThemeModal(true)}
              className="flex-row items-center justify-between py-3 border-t border-gray-200 dark:border-gray-700"
            >
              <Text className="text-base text-gray-800 dark:text-gray-100">
                {t("theme")}
              </Text>
              <View className="flex-row items-center">
                <View
                  className="w-6 h-6 rounded-full mr-2"
                  style={{
                    backgroundColor: ALL_THEMES.find((t) => t.color === user.themeColor)
                      ?.colors[0],
                  }}
                />
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </View>
            </Pressable>

            {/* Notifications */}
            <View className="flex-row items-center justify-between py-3 border-t border-gray-200 dark:border-gray-700">
              <Text className="text-base text-gray-800 dark:text-gray-100">
                {t("notifications")}
              </Text>
              <Pressable
                onPress={toggleNotifications}
                className={cn(
                  "w-12 h-7 rounded-full justify-center px-1",
                  user.notificationEnabled
                    ? "bg-blue-500"
                    : "bg-gray-300 dark:bg-gray-600"
                )}
              >
                <View
                  className={cn(
                    "w-5 h-5 rounded-full bg-white",
                    user.notificationEnabled && "ml-auto"
                  )}
                />
              </Pressable>
            </View>
          </View>
        </View>

        <View className="h-8" />
      </ScrollView>

      {/* Language Modal */}
      <Modal
        visible={showLanguageModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
          <View className="px-6 py-4 flex-row items-center justify-between border-b border-gray-200 dark:border-gray-700">
            <Text className="text-xl font-bold text-gray-800 dark:text-gray-100">
              {t("language")}
            </Text>
            <Pressable onPress={() => setShowLanguageModal(false)}>
              <Ionicons name="close" size={28} color="#6B7280" />
            </Pressable>
          </View>
          <ScrollView className="flex-1 px-6 py-4">
            {languages.map((lang) => (
              <Pressable
                key={lang.code}
                onPress={() => {
                  updateLanguage(lang.code);
                  toast.success(`Language changed to ${lang.name}`);
                  setShowLanguageModal(false);
                }}
                className={cn(
                  "flex-row items-center justify-between py-4 px-4 rounded-xl mb-2",
                  user.language === lang.code
                    ? "bg-blue-100 dark:bg-blue-900"
                    : "bg-white dark:bg-gray-800"
                )}
              >
                <View className="flex-row items-center">
                  <Text className="text-2xl mr-3">{lang.flag}</Text>
                  <Text className="text-base font-medium text-gray-800 dark:text-gray-100">
                    {lang.name}
                  </Text>
                </View>
                {user.language === lang.code && (
                  <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
                )}
              </Pressable>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Theme Modal */}
      <Modal
        visible={showThemeModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowThemeModal(false)}
      >
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
          <View className="px-6 py-4 flex-row items-center justify-between border-b border-gray-200 dark:border-gray-700">
            <Text className="text-xl font-bold text-gray-800 dark:text-gray-100">
              {t("theme")}
            </Text>
            <Pressable onPress={() => setShowThemeModal(false)}>
              <Ionicons name="close" size={28} color="#6B7280" />
            </Pressable>
          </View>
          <ScrollView className="flex-1 px-6 py-4">
            {ALL_THEMES.map((theme) => (
              <Pressable
                key={theme.color}
                onPress={() => {
                  updateThemeColor(theme.color);
                  toast.success(`Theme changed to ${theme.name}`);
                  setShowThemeModal(false);
                }}
                className={cn(
                  "flex-row items-center justify-between py-4 px-4 rounded-xl mb-2",
                  user.themeColor === theme.color
                    ? "bg-blue-100 dark:bg-blue-900"
                    : "bg-white dark:bg-gray-800"
                )}
              >
                <View className="flex-row items-center">
                  <Text className="text-3xl mr-3">{theme.emoji}</Text>
                  <View>
                    <Text className="text-base font-medium text-gray-800 dark:text-gray-100">
                      {theme.name}
                    </Text>
                    <Text className="text-xs text-gray-500 dark:text-gray-400">
                      Environmental theme
                    </Text>
                  </View>
                </View>
                {user.themeColor === theme.color && (
                  <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
                )}
              </Pressable>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Animal Modal */}
      <Modal
        visible={showAnimalModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAnimalModal(false)}
      >
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
          <View className="px-6 py-4 flex-row items-center justify-between border-b border-gray-200 dark:border-gray-700">
            <Text className="text-xl font-bold text-gray-800 dark:text-gray-100">
              {t("studyPalAnimal")}
            </Text>
            <Pressable onPress={() => setShowAnimalModal(false)}>
              <Ionicons name="close" size={28} color="#6B7280" />
            </Pressable>
          </View>
          <ScrollView className="flex-1 px-6 py-4">
            {ALL_ANIMALS.map((animal) => (
              <Pressable
                key={animal}
                onPress={() => {
                  updateStudyPal(user.studyPalConfig.name, animal);
                  toast.success(`Companion changed to ${getAnimalDisplayName(animal)}`);
                  setShowAnimalModal(false);
                }}
                className={cn(
                  "flex-row items-center justify-between py-4 px-4 rounded-xl mb-2",
                  user.studyPalConfig.animal === animal
                    ? "bg-blue-100 dark:bg-blue-900"
                    : "bg-white dark:bg-gray-800"
                )}
              >
                <View className="flex-row items-center">
                  <Image
                    source={getAnimalImage(animal)}
                    style={{ width: 40, height: 40, marginRight: 12 }}
                    resizeMode="contain"
                  />
                  <Text className="text-base font-medium text-gray-800 dark:text-gray-100 capitalize">
                    {getAnimalDisplayName(animal)}
                  </Text>
                </View>
                {user.studyPalConfig.animal === animal && (
                  <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
                )}
              </Pressable>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Settings Modal */}
      <Modal
        visible={showSettingsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <SettingsScreen />
        <SafeAreaView edges={["bottom"]}>
          <Pressable
            onPress={() => setShowSettingsModal(false)}
            className="mx-6 mb-4 bg-blue-500 rounded-2xl py-4 items-center"
          >
            <Text className="text-white font-semibold text-lg">Close</Text>
          </Pressable>
        </SafeAreaView>
      </Modal>

      {/* Avatar Creator Modal */}
      {user && (
        <AvatarCreator
          visible={showAvatarCreator}
          onClose={() => setShowAvatarCreator(false)}
          currentAnimal={user.studyPalConfig.animal}
          currentAvatar={user.studyPalConfig.avatar}
          currentTheme={user.themeColor}
          onSave={(avatar) => {
            updateAvatar(avatar);
            toast.success("Avatar updated successfully!");
          }}
        />
      )}
    </SafeAreaView>
  );
};

export default ProfileScreen;
