import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, Language, ThemeColor, StudyPalAnimal } from "../types";

interface UserStore {
  user: User | null;
  setUser: (user: User) => void;
  updateLanguage: (language: Language) => void;
  updateThemeColor: (color: ThemeColor) => void;
  updateStudyPal: (name: string, animal: StudyPalAnimal) => void;
  toggleAnimations: () => void;
  toggleNotifications: () => void;
  updateDailyReminderTime: (hour: number, minute: number) => void;
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
      updateDailyReminderTime: (hour: number, minute: number) =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                dailyReminderTime: { hour, minute },
              }
            : null,
        })),
      logout: () => set({ user: null }),
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export default useUserStore;
