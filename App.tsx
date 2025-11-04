import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomTabNavigator from "./src/navigation/BottomTabNavigator";
import OnboardingScreen from "./src/screens/OnboardingScreen";
import useUserStore from "./src/state/userStore";

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

export default function App() {
  const user = useUserStore((s) => s.user);
  const logout = useUserStore((s) => s.logout);
  const [isReady, setIsReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);

  useEffect(() => {
    // Force clear storage if user is corrupted/undefined
    const initializeApp = async () => {
      // If we're in a bad state (no user but not showing onboarding), reset
      if (!user) {
        logout(); // This will clear AsyncStorage
      }

      setTimeout(() => {
        setIsReady(true);
        setShowOnboarding(!user);
      }, 100);
    };

    initializeApp();
  }, []);

  useEffect(() => {
    if (isReady) {
      setShowOnboarding(!user);
    }
  }, [user, isReady]);

  if (!isReady) {
    return null; // Or a loading screen
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          {showOnboarding ? (
            <OnboardingScreen onComplete={() => setShowOnboarding(false)} />
          ) : (
            <BottomTabNavigator />
          )}
          <StatusBar style="auto" />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
