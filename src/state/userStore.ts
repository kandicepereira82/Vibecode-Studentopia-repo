import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, Language, ThemeColor, StudyPalAnimal, AvatarCustomization } from "../types";
// Lazy imports to avoid require cycle
import useStatsStore from "./statsStore";
import useGroupStore from "./groupStore";

interface UserStore {
  user: User | null;
  setUser: (user: User) => void;
  updateLanguage: (language: Language) => void;
  updateThemeColor: (color: ThemeColor) => void;
  updateStudyPal: (name: string, animal: StudyPalAnimal) => void;
  updateAvatar: (avatar: AvatarCustomization) => void;
  toggleAnimations: () => void;
  toggleNotifications: () => void;
  updateNotificationSound: (enabled: boolean) => void;
  updateNotificationVibration: (enabled: boolean) => void;
  updateMindfulnessBreak: (enabled: boolean) => void;
  updateDailyReminderTime: (hour: number, minute: number) => void;
  toggleDarkMode: () => void;
  logout: () => void;
}

const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user: User) => set({ user }),
      updateLanguage: (language: Language) =>
        set((state) => ({
          user: state.user ? { ...state.user, language } : null,
        })),
      updateThemeColor: (color: ThemeColor) =>
        set((state) => ({
          user: state.user ? { ...state.user, themeColor: color } : null,
        })),
      updateStudyPal: (name: string, animal: StudyPalAnimal) =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                studyPalConfig: {
                  ...state.user.studyPalConfig,
                  name,
                  animal,
                },
              }
            : null,
        })),
      updateAvatar: (avatar: AvatarCustomization) =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                studyPalConfig: {
                  ...state.user.studyPalConfig,
                  avatar,
                },
              }
            : null,
        })),
      toggleAnimations: () =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                studyPalConfig: {
                  ...state.user.studyPalConfig,
                  animationsEnabled: !state.user.studyPalConfig.animationsEnabled,
                },
              }
            : null,
        })),
      toggleNotifications: () =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                notificationEnabled: !state.user.notificationEnabled,
              }
            : null,
        })),
      updateNotificationSound: (enabled: boolean) =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                notificationSound: enabled,
              }
            : null,
        })),
      updateNotificationVibration: (enabled: boolean) =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                notificationVibration: enabled,
              }
            : null,
        })),
      updateMindfulnessBreak: (enabled: boolean) =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                mindfulnessBreakEnabled: enabled,
              }
            : null,
        })),
      updateDailyReminderTime: (hour: number, minute: number) =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                dailyReminderTime: { hour, minute },
              }
            : null,
        })),
      toggleDarkMode: () =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                darkMode: !state.user.darkMode,
              }
            : null,
        })),
      logout: () => {
        // Clear all user-specific data when logging out
        set({ user: null });

        // Clear tasks (lazy import to avoid require cycle)
        const useTaskStore = require("./taskStore").default;
        useTaskStore.getState().tasks = [];
        useTaskStore.persist.clearStorage();

        // Clear stats
        useStatsStore.getState().stats = null;
        useStatsStore.persist.clearStorage();

        // Clear groups
        useGroupStore.getState().groups = [];
        useGroupStore.persist.clearStorage();
      },
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export default useUserStore;
