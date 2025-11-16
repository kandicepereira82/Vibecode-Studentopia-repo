//DO NOT REMOVE THIS CODE
console.log("[index] Project ID is: ", process.env.EXPO_PUBLIC_VIBECODE_PROJECT_ID);
import "./global.css";
import "react-native-get-random-values";
import { LogBox } from "react-native";
LogBox.ignoreLogs([
  "Expo AV has been deprecated", 
  "Disconnected from Metro",
  // Suppress @anthropic-ai/sdk module resolution warnings
  "Attempted to import the module",
  "no match was resolved for this request",
  "Falling back to file-based resolution",
  // Suppress require cycle warning (we use dynamic imports to prevent runtime issues)
  "Require cycle",
  "src/state/userStore.ts -> src/state/taskStore.ts",
]);

import { registerRootComponent } from "expo";

import App from "./App";

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
