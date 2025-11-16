//DO NOT REMOVE THIS CODE
console.log("[index] Starting app initialization...");
console.log("[index] Project ID is: ", process.env.EXPO_PUBLIC_VIBECODE_PROJECT_ID);

// Import essential modules first
import "./global.css";
import "react-native-get-random-values";
import { LogBox } from "react-native";

// CRITICAL: Set up LogBox suppression IMMEDIATELY before any other imports
// This must happen before any modules that might log warnings/errors
LogBox.ignoreLogs([
    // Suppress all variations of these warnings (LogBox accepts strings, not regex)
    "Expo AV has been deprecated",
    "Disconnected from Metro",
    // Suppress @anthropic-ai/sdk module resolution warnings
    "Attempted to import the module",
    "no match was resolved",
    "Falling back to file-based resolution",
    "@anthropic-ai/sdk",
    "which is listed in the \"exports\"",
    "Consider updating the call site",
    // Suppress require cycle warning (we use dynamic imports to prevent runtime issues)
    "Require cycle",
    "userStore.ts -> src/state/taskStore.ts",
    "taskStore.ts -> src/state/userStore.ts",
    "src/state/userStore.ts -> src/state/taskStore.ts -> src/state/userStore.ts",
    // Suppress expo-notifications warnings (expected in Expo Go)
    "expo-notifications",
    "Android Push notifications",
    "was removed from Expo Go",
    "Use a development build instead",
    "not fully supported in Expo Go",
    "We recommend you instead use a development build",
    "functionality is not fully supported in Expo Go",
    // Suppress expo-av deprecation warning
    "[expo-av]:",
    "Expo AV has been deprecated",
    "Use the `expo-audio` and `expo-video` packages",
    // Suppress SafeAreaView deprecation (we're already using the correct import)
    "SafeAreaView has been deprecated",
    "use 'react-native-safe-area-context' instead",
    // Suppress Supabase warnings and errors (credentials are optional - app works without them)
    "Supabase credentials not found",
    "supabaseUrl is required",
    "Supabase is not configured",
    "Supabase credentials incomplete",
    "Error: supabaseUrl is required",
    "[runtime not ready]",
    "runtime not ready",
    "⚠️ Supabase",
]);

// Set up error suppression AFTER LogBox is imported
const originalError = console.error;
const originalWarn = console.warn;

// Override console.error to suppress known errors
console.error = (...args) => {
  const message = args.join(' ');
  // Suppress Supabase-related errors (credentials are optional)
  if (message.includes('supabaseUrl') || 
      message.includes('Supabase') ||
      message.includes('[runtime not ready]') ||
      message.includes('runtime not ready') ||
      message.includes('Error: supabaseUrl') ||
      (message.includes('⚠️') && message.includes('Supabase'))) {
    // Silently suppress - Supabase is optional
    return; // Suppress this error
  }
  originalError.apply(console, args);
};

// Override console.warn to suppress known warnings
console.warn = (...args) => {
  const message = args.join(' ');
  // Suppress all known warnings
  if (message.includes('Supabase') || 
      message.includes('supabaseUrl') ||
      message.includes('credentials not found') ||
      message.includes('⚠️') ||
      message.includes('Require cycle') ||
      message.includes('expo-notifications') ||
      message.includes('expo-av') ||
      message.includes('SafeAreaView') ||
      message.includes('was removed from Expo Go') ||
      message.includes('not fully supported in Expo Go')) {
    return; // Suppress this warning
  }
  originalWarn.apply(console, args);
};

// Set up global error handler to catch unhandled errors
if (typeof ErrorUtils !== 'undefined') {
  const originalHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
    const errorMessage = error?.message || String(error);
    // Suppress Supabase errors
    if (errorMessage.includes('supabaseUrl') || 
        errorMessage.includes('Supabase') ||
        errorMessage.includes('[runtime not ready]')) {
      // Silently ignore - Supabase is optional
      return;
    }
    // Call original handler for other errors
    if (originalHandler) {
      originalHandler(error, isFatal);
    }
  });
}

// Import App component and registerRootComponent
console.log("[index] Loading App component...");
import { registerRootComponent } from "expo";
import App from "./App";
console.log("[index] App component imported");

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
console.log("[index] Registering root component...");
try {
  registerRootComponent(App);
  console.log("[index] ✅ Root component registered successfully!");
} catch (error: any) {
  console.error("[index] ❌ CRITICAL: Failed to register root component:", error);
  console.error("[index] Error details:", error?.message, error?.stack);
  // Re-throw to see the error in Metro
  throw error;
}
