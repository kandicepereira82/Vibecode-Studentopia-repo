/**
 * FIREBASE AUTHENTICATION SERVICE
 *
 * Handles user authentication with Firebase
 * Integrates with existing userStore for seamless auth
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
} from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { User } from "../types";

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

/**
 * Sign up new user with email and password
 */
export const signUpWithEmail = async (
  email: string,
  password: string,
  username: string,
  fullName: string
): Promise<AuthResult> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Update Firebase profile with username
    await updateProfile(firebaseUser, {
      displayName: username,
    });

    // Create User object for app
    const user: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email || email,
      username,
      role: "student", // Default role, can be updated later
      language: "en",
      themeColor: "ocean",
      studyPalConfig: {
        name: "Study Buddy",
        animal: "redpanda",
        animationsEnabled: true,
        avatar: {
          furColor: "Natural",
          outfit: "None",
          accessory: "None",
          backgroundColor: "None",
        },
      },
      notificationEnabled: true,
      notificationSound: true,
      notificationVibration: true,
      mindfulnessBreakEnabled: false,
      dailyReminderTime: { hour: 9, minute: 0 },
      createdAt: new Date(),
    };

    return { success: true, user };
  } catch (error: any) {
    console.error("Firebase signup error:", error);
    return {
      success: false,
      error: error.message || "Failed to create account",
    };
  }
};

/**
 * Sign in existing user with email and password
 */
export const signInWithEmail = async (
  email: string,
  password: string
): Promise<AuthResult> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Return minimal user info - full profile loaded from Firestore separately
    const user: Partial<User> = {
      id: firebaseUser.uid,
      email: firebaseUser.email || email,
      username: firebaseUser.displayName || email.split("@")[0],
    };

    return { success: true, user: user as User };
  } catch (error: any) {
    console.error("Firebase signin error:", error);
    let errorMessage = "Failed to sign in";

    if (error.code === "auth/user-not-found") {
      errorMessage = "No account found with this email";
    } else if (error.code === "auth/wrong-password") {
      errorMessage = "Incorrect password";
    } else if (error.code === "auth/invalid-email") {
      errorMessage = "Invalid email address";
    }

    return { success: false, error: errorMessage };
  }
};

/**
 * Sign out current user
 */
export const signOutUser = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    console.error("Firebase signout error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return auth.currentUser !== null;
};

export default {
  signUpWithEmail,
  signInWithEmail,
  signOutUser,
  onAuthStateChange,
  getCurrentUser,
  isAuthenticated,
};
