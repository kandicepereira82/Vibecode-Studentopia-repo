/**
 * FIREBASE CONFIGURATION
 *
 * Setup Instructions:
 * 1. Go to https://console.firebase.google.com/
 * 2. Create a new project (or select existing)
 * 3. Click "Add app" and select "Web" (🌐)
 * 4. Register app with nickname "Studentopia"
 * 5. Copy the firebaseConfig values and paste below
 * 6. Enable Authentication (Email/Password) in Firebase Console
 * 7. Enable Firestore Database in Firebase Console
 * 8. Enable Realtime Database in Firebase Console
 * 9. Set up Firestore Security Rules (see FIREBASE_SETUP.md)
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

// Firebase configuration
// IMPORTANT: Replace these with your actual Firebase project credentials
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL || "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "YOUR_APP_ID",
};

// Initialize Firebase with error handling to prevent crashes
let app: any = null;
let auth: any = null;
let firestore: any = null;
let realtimeDb: any = null;

try {
  if (getApps().length === 0) {
    // Only initialize if config is valid (not placeholder values)
    const hasValidConfig = firebaseConfig.apiKey && 
                           firebaseConfig.apiKey !== "YOUR_API_KEY" &&
                           firebaseConfig.projectId && 
                           firebaseConfig.projectId !== "YOUR_PROJECT_ID";
    
    if (hasValidConfig) {
      app = initializeApp(firebaseConfig);
    } else {
      console.log("[Firebase] Configuration not set - Firebase features will be disabled");
    }
  } else {
    app = getApp();
  }

  // Initialize services only if app was successfully initialized
  if (app) {
    auth = getAuth(app);
    firestore = getFirestore(app);
    realtimeDb = getDatabase(app);
  }
} catch (error: any) {
  // Firebase initialization failed - app should still work without Firebase
  console.log("[Firebase] Initialization failed - app will continue without Firebase:", error?.message);
  // Set all to null to indicate Firebase is not available
  app = null;
  auth = null;
  firestore = null;
  realtimeDb = null;
}

export { app, auth, firestore, realtimeDb };
export default app;
