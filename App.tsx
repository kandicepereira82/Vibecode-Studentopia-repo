import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import BottomTabNavigator from "./src/navigation/BottomTabNavigator";
import OnboardingScreen from "./src/screens/OnboardingScreen";
import AuthenticationScreen from "./src/screens/AuthenticationScreen";
import TutorialScreen from "./src/screens/TutorialScreen";
import useUserStore from "./src/state/userStore";
import useConnectivityStore from "./src/state/connectivityStore";
import { connectivityService } from "./src/services/connectivityService";
import { syncService } from "./src/services/syncService";
import { ToastProvider } from "./src/context/ToastContext";
import ToastContainer from "./src/components/ToastContainer";
import { useToast } from "./src/hooks/useToast";

/*
IMPORTANT NOTICE: DO NOT REMOVE
There are already environment keys in the project.
Before telling the user to add them, check if you already have access to the required keys through bash.
Directly access them with process.env.${key}

Correct usage:
process.env.EXPO_PUBLIC_VIBECODE_{key}
//directly access the key

Incorrect usage:
import { OPENAI_API_KEY } from '@env';
//don't use @env, its depreicated

Incorrect usage:
import Constants from 'expo-constants';
const openai_api_key = Constants.expoConfig.extra.apikey;
//don't use expo-constants, its depreicated

*/

const AppContent = () => {
  const user = useUserStore((s) => s.user);
  const logout = useUserStore((s) => s.logout);
  const [isReady, setIsReady] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const { toasts, dismiss } = useToast();

  // Load Poppins fonts
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    // Wait for Zustand to hydrate from AsyncStorage and fonts to load
    const initializeApp = async () => {
      // Wait for fonts
      if (!fontsLoaded) return;

      // Initialize connectivity monitoring
      connectivityService.initialize();
      useConnectivityStore.getState().initialize();

      // Initialize sync service
      syncService.initialize();

      // Give Zustand time to hydrate
      await new Promise(resolve => setTimeout(resolve, 200));

      // Check if tutorial has been completed
      const tutorialCompleted = await AsyncStorage.getItem("@studentopia_tutorial_completed");

      // Check if user is properly initialized (has required fields)
      const isValidUser = user && user.id && user.username && user.language;

      if (!isValidUser) {
        // Clear corrupted/partial user data
        logout();
        // Show tutorial first if not completed
        if (!tutorialCompleted) {
          setShowTutorial(true);
        } else {
          setShowOnboarding(true);
        }
      } else {
        setShowOnboarding(false);
        setShowTutorial(false);
      }

      setIsReady(true);
    };

    initializeApp();
  }, [fontsLoaded]);

  // React to user changes after initial load
  useEffect(() => {
    if (isReady) {
      const isValidUser = user && user.id && user.username && user.language;
      setShowOnboarding(!isValidUser);
    }
  }, [user, isReady]);

  if (!isReady) {
    return null; // Wait for initialization
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          {showTutorial ? (
            <TutorialScreen onComplete={() => {
              setShowTutorial(false);
              setShowOnboarding(true);
            }} />
          ) : showOnboarding ? (
            <OnboardingScreen onComplete={() => {
              // After onboarding, show authentication screen for login/signup
              setShowOnboarding(false);
              setShowAuth(true);
            }} />
          ) : showAuth ? (
            <AuthenticationScreen onComplete={() => setShowAuth(false)} />
          ) : (
            <BottomTabNavigator />
          )}
          <StatusBar style="auto" />
        </NavigationContainer>
        <ToastContainer toasts={toasts} onDismiss={dismiss} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
