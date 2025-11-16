/**
 * SUPABASE AUTHENTICATION SERVICE
 * 
 * Server-side authentication using Supabase
 * Replaces local-only auth with secure backend authentication
 * 
 * Features:
 * - Server-side password hashing (bcrypt)
 * - Session management
 * - Token refresh
 * - Email verification
 * - Password reset emails
 * - MFA support (TOTP)
 */

import { supabase, getCurrentSession, getCurrentUser } from '../api/supabase';

// Check if Supabase is available
const isSupabaseAvailable = () => {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to .env');
  }
  return true;
};
import { containsInappropriateContent, validateName } from './contentModeration';
import { sessionService } from '../services/sessionService';
import { mfaService } from '../services/mfaService';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// SECURITY FIX: Strong password validation (client-side check before sending to server)
const validatePasswordStrength = (password: string): { valid: boolean; error?: string } => {
  if (password.length < 12) {
    return { valid: false, error: "Password must be at least 12 characters" };
  }
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: "Password must contain at least one lowercase letter" };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: "Password must contain at least one uppercase letter" };
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: "Password must contain at least one number" };
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { valid: false, error: "Password must contain at least one special character (!@#$%^&*...)" };
  }
  
  // Check against common passwords
  const commonPasswords = ['password', '123456', 'password123', 'qwerty', 'abc123'];
  const lowerPassword = password.toLowerCase();
  if (commonPasswords.some(common => lowerPassword.includes(common))) {
    return { valid: false, error: "Password is too common. Please choose a stronger password" };
  }
  
  // CONTENT MODERATION: Check for offensive content in password
  if (containsInappropriateContent(password)) {
    return { valid: false, error: "Password cannot contain inappropriate content" };
  }
  
  return { valid: true };
};

/**
 * Store auth token securely
 */
const storeAuthToken = async (token: string, refreshToken?: string) => {
  try {
    const tokenData = {
      token,
      refreshToken,
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
    };
    await SecureStore.setItemAsync('auth_token', JSON.stringify(tokenData));
  } catch {
    await AsyncStorage.setItem('auth_token', JSON.stringify({ token, refreshToken }));
  }
};

/**
 * Clear auth token
 */
const clearAuthToken = async () => {
  try {
    await SecureStore.deleteItemAsync('auth_token');
  } catch {
    await AsyncStorage.removeItem('auth_token');
  }
};

export const authServiceSupabase = {
  /**
   * Register a new user with email and password
   * Server-side password hashing handled by Supabase
   */
  async register(
    email: string, 
    password: string, 
    username: string
  ): Promise<{ success: boolean; error?: string; userId?: string }> {
    try {
      // CLIENT-SIDE VALIDATION: Password strength
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.valid) {
        return { success: false, error: passwordValidation.error };
      }

      // CONTENT MODERATION: Validate username
      const usernameValidation = validateName(username, 'username');
      if (!usernameValidation.isValid) {
        return { success: false, error: usernameValidation.error };
      }

      // Register with Supabase (handles password hashing server-side)
      if (!supabase) {
        throw new Error('Supabase is not configured');
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username, // Stored in user metadata
          },
          emailRedirectTo: undefined, // Can configure email verification URL
        },
      });

      if (error) {
        // Handle Supabase-specific errors
        if (error.message.includes('already registered')) {
          return { success: false, error: 'Email already registered' };
        }
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: 'Registration failed' };
      }

      // Store session token if available
      if (data.session) {
        await storeAuthToken(data.session.access_token, data.session.refresh_token);
      }

      return {
        success: true,
        userId: data.user.id,
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      return { success: false, error: error.message || 'Registration failed' };
    }
  },

  /**
   * Login user with email and password
   * Supports MFA if enabled
   */
  async login(
    email: string, 
    password: string, 
    mfaCode?: string
  ): Promise<{ 
    success: boolean; 
    error?: string; 
    userId?: string; 
    username?: string; 
    requiresMFA?: boolean; 
    sessionId?: string;
  }> {
    try {
      // Login with Supabase
      if (!supabase) {
        throw new Error('Supabase is not configured');
      }
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Handle rate limiting (Supabase handles this server-side)
        if (error.message.includes('too many')) {
          return { success: false, error: 'Too many login attempts. Please try again later.' };
        }
        return { success: false, error: 'Invalid email or password' };
      }

      if (!data.user) {
        return { success: false, error: 'Login failed' };
      }

      // Check if MFA is enabled (stored in user metadata or separate table)
      // Note: Supabase supports TOTP MFA, but we need to check if user has it enabled
      const mfaEnabled = data.user.app_metadata?.mfa_enabled || false;
      
      if (mfaEnabled && !mfaCode) {
        // MFA required but no code provided
        return {
          success: false,
          error: 'MFA code required',
          requiresMFA: true,
        };
      }

      // If MFA code provided, verify it
      if (mfaCode && mfaEnabled) {
        // TODO: Verify MFA code with Supabase or custom MFA service
        // For now, use existing mfaService
        const mfaValid = await mfaService.verifyMFACode(data.user.id, mfaCode);
        if (!mfaValid) {
          return { success: false, error: 'Invalid MFA code' };
        }
      }

      // Store session tokens
      if (data.session) {
        await storeAuthToken(data.session.access_token, data.session.refresh_token);
      }

      // Create session record
      const session = await sessionService.createSession(data.user.id);

      return {
        success: true,
        userId: data.user.id,
        username: data.user.user_metadata?.username || data.user.email?.split('@')[0],
        sessionId: session.sessionId,
        requiresMFA: false,
      };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Login failed' };
    }
  },

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      if (!supabase) {
        throw new Error('Supabase is not configured');
      }
      await supabase.auth.signOut();
      await clearAuthToken();
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  /**
   * Request password reset
   * Supabase sends email automatically
   */
  async requestPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!supabase) {
        throw new Error('Supabase is not configured');
      }
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: undefined, // Can configure password reset URL
      });

      if (error) {
        // Always return success to prevent email enumeration
        return { success: true };
      }

      // Always return success (Supabase handles email sending)
      return { success: true };
    } catch (error: any) {
      // Always return success to prevent email enumeration
      return { success: true };
    }
  },

  /**
   * Reset password with token
   * Token comes from email link
   */
  async resetPassword(
    email: string, 
    token: string, 
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate password strength
      const passwordValidation = validatePasswordStrength(newPassword);
      if (!passwordValidation.valid) {
        return { success: false, error: passwordValidation.error };
      }

      // Supabase handles password reset via session
      // This would typically be called from a password reset page
      // For now, we'll use the updateUser method if user is authenticated
      if (!supabase) {
        throw new Error('Supabase is not configured');
      }
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Password reset failed' };
    }
  },

  /**
   * Get current authenticated user
   */
  async getCurrentUser() {
    return await getCurrentUser();
  },

  /**
   * Get current session
   */
  async getCurrentSession() {
    return await getCurrentSession();
  },

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const session = await getCurrentSession();
    return !!session;
  },

  /**
   * Refresh auth token
   */
  async refreshToken(): Promise<{ success: boolean; token?: string }> {
    try {
      if (!supabase) {
        throw new Error('Supabase is not configured');
      }
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error || !data.session) {
        return { success: false };
      }

      await storeAuthToken(data.session.access_token, data.session.refresh_token);
      return { success: true, token: data.session.access_token };
    } catch (error) {
      return { success: false };
    }
  },
};

// Export as default authService for easy migration
export default authServiceSupabase;

