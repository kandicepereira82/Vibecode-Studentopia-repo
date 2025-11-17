/**
 * SUPABASE CLIENT CONFIGURATION
 * 
 * Initialize Supabase client for authentication and database operations
 * 
 * Setup:
 * 1. Create project at https://supabase.com
 * 2. Get your project URL and anon key from Settings > API
 * 3. Add to .env:
 *    EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
 *    EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
 */

import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// CRITICAL: Lazy-load environment variables to ensure they're available
// Expo may not have loaded .env variables when this module is imported
const getEnvVar = (key: string): string => {
  // Try multiple ways to access the variable
  const value = process.env[key] || 
                (typeof window !== 'undefined' && (window as any).__ENV__?.[key]) ||
                '';
  const result = String(value || '').trim();
  // Debug: Log if we're getting empty values (only in development)
  if (__DEV__ && !result && key.includes('SUPABASE')) {
    console.log(`[Supabase] Warning: ${key} is empty. Make sure .env is loaded.`);
  }
  return result;
};

// Lazy evaluation: Only read env vars when needed, not at module load time
const getSupabaseUrl = () => getEnvVar('EXPO_PUBLIC_SUPABASE_URL');
const getSupabaseAnonKey = () => getEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY');

// Validation function - called lazily when needed
const validateCredentials = (): { url: string; key: string; valid: boolean } => {
  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseAnonKey();
  
  // EXTREMELY STRICT validation: URL must be a valid HTTPS URL and key must be non-empty
  // The Supabase SDK will throw "supabaseUrl is required" if URL is empty/undefined/null
  const isValidUrl = supabaseUrl && 
    typeof supabaseUrl === 'string' && 
    supabaseUrl.length > 10 && // Minimum length check (https://x.co = 12 chars)
    supabaseUrl.startsWith('https://') &&
    supabaseUrl.includes('.supabase.co') && // Must be a valid Supabase URL
    !supabaseUrl.includes('your-project') && // Reject placeholder values
    !supabaseUrl.includes('YOUR_PROJECT'); // Reject placeholder values
    
  const isValidKey = supabaseAnonKey && 
    typeof supabaseAnonKey === 'string' && 
    supabaseAnonKey.length > 20 && // JWT tokens are much longer
    !supabaseAnonKey.includes('your-anon-key') && // Reject placeholder values
    !supabaseAnonKey.includes('YOUR_ANON_KEY'); // Reject placeholder values

  return {
    url: supabaseUrl,
    key: supabaseAnonKey,
    valid: !!(isValidUrl && isValidKey) // Explicitly convert to boolean
  };
};

/**
 * Custom storage adapter for Supabase that uses SecureStore
 * Falls back to AsyncStorage if SecureStore is not available
 */
const storageAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return await AsyncStorage.getItem(key);
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      await AsyncStorage.setItem(key, value);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      await AsyncStorage.removeItem(key);
    }
  },
};

/**
 * Supabase client instance
 * Only created if credentials are available, otherwise null
 * Configured with secure storage for auth tokens
 */
let supabaseInstance: any = null;

// Lazy initialization function - only called when supabase is accessed
const initializeSupabase = (): any => {
  // If already initialized, return the instance
  if (supabaseInstance !== null) {
    return supabaseInstance;
  }
  
  // Wrap entire initialization in try-catch to prevent any errors from propagating
  // Supabase SDK validates URL immediately when createClient is called, so we must be 100% sure
  try {
    // Validate credentials lazily (when actually needed)
    const credentials = validateCredentials();
    
    // CRITICAL: Only create client if we have ABSOLUTELY valid credentials
    // The Supabase SDK's validateSupabaseUrl throws synchronously if URL is empty
    // We must NEVER call createClient with empty/undefined/null values
    
    if (!credentials.valid) {
      // No valid credentials - set to null and exit early
      supabaseInstance = null;
      return null;
    }
    
    // Final safety checks before calling createClient
    // These checks are redundant but critical to prevent errors
    const finalUrl = String(credentials.url || '').trim();
    const finalKey = String(credentials.key || '').trim();
    
    // QUADRUPLE-CHECK: Ensure values are definitely valid before calling createClient
    // The Supabase SDK will throw "supabaseUrl is required" synchronously if URL is falsy
    if (finalUrl && 
        finalKey && 
        finalUrl.length > 10 && 
        finalKey.length > 20 && 
        finalUrl.startsWith('https://') &&
        finalUrl.includes('.supabase.co') && // Must be a valid Supabase URL
        !finalUrl.includes('your-project') &&
        !finalUrl.includes('YOUR_PROJECT') &&
        !finalKey.includes('your-anon-key') &&
        !finalKey.includes('YOUR_ANON_KEY')) {
      
      // Only NOW is it safe to call createClient
      // Wrap in another try-catch as final safety net
      try {
        supabaseInstance = createClient(finalUrl, finalKey, {
          auth: {
            storage: storageAdapter,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false,
          },
        });
        return supabaseInstance;
      } catch {
        // If createClient still throws, catch it here
        // This should never happen with our validation, but be safe
        supabaseInstance = null;
        return null;
      }
    } else {
      // Credentials don't meet requirements - set to null
      supabaseInstance = null;
      return null;
    }
  } catch {
    // Catch ANY error during initialization (including from createClient or validateSupabaseUrl)
    // Silently fail - Supabase is optional
    // The error is suppressed in metro.config.js and index.ts
    supabaseInstance = null;
    return null;
  }
};

// Initialize immediately (but with lazy credential reading)
try {
  supabaseInstance = initializeSupabase();
} catch {
  // Final safety net - if anything goes wrong, set to null
  supabaseInstance = null;
}

export const supabase = supabaseInstance;

/**
 * Get current session
 */
export const getCurrentSession = async () => {
  if (!supabase) return null;
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

/**
 * Get current user
 */
export const getCurrentUser = async () => {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  if (!supabase) return false;
  const session = await getCurrentSession();
  return !!session;
};

export default supabase;

