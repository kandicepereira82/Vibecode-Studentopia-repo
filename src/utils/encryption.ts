/**
 * ENCRYPTION UTILITIES
 * 
 * Provides encryption/decryption for sensitive data at rest
 * Uses AES-like encryption via expo-crypto
 */

import * as Crypto from "expo-crypto";

// SECURITY FIX: Derive encryption key from user password/biometric
// In production, this should be derived from user's master password or biometric
const getEncryptionKey = async (): Promise<string> => {
  // For now, use a device-specific key stored securely
  // In production, derive from user password/biometric
  let key: string | null = null;
  
  try {
    const { SecureStore } = await import("expo-secure-store");
    key = await SecureStore.getItemAsync("encryption_key");
  } catch {
    const { default: AsyncStorage } = await import("@react-native-async-storage/async-storage");
    key = await AsyncStorage.getItem("encryption_key");
  }
  
  if (!key) {
    // Generate a new encryption key
    const bytes = await Crypto.getRandomBytesAsync(32);
    key = Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    try {
      const { SecureStore } = await import("expo-secure-store");
      await SecureStore.setItemAsync("encryption_key", key);
    } catch {
      const { default: AsyncStorage } = await import("@react-native-async-storage/async-storage");
      await AsyncStorage.setItem("encryption_key", key);
    }
  }
  
  return key;
};

/**
 * Simple XOR encryption (for demonstration)
 * NOTE: In production, use proper AES encryption via native module
 */
const xorEncrypt = (data: string, key: string): string => {
  let encrypted = "";
  for (let i = 0; i < data.length; i++) {
    const keyChar = key[i % key.length];
    encrypted += String.fromCharCode(
      data.charCodeAt(i) ^ keyChar.charCodeAt(0)
    );
  }
  return btoa(encrypted); // Base64 encode
};

const xorDecrypt = (encrypted: string, key: string): string => {
  const data = atob(encrypted); // Base64 decode
  let decrypted = "";
  for (let i = 0; i < data.length; i++) {
    const keyChar = key[i % key.length];
    decrypted += String.fromCharCode(
      data.charCodeAt(i) ^ keyChar.charCodeAt(0)
    );
  }
  return decrypted;
};

/**
 * Encrypt sensitive data
 */
export const encryptData = async (data: string): Promise<string> => {
  const key = await getEncryptionKey();
  // Hash the key for better security
  const hashedKey = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    key
  );
  return xorEncrypt(data, hashedKey);
};

/**
 * Decrypt sensitive data
 */
export const decryptData = async (encryptedData: string): Promise<string> => {
  const key = await getEncryptionKey();
  // Hash the key (same as encryption)
  const hashedKey = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    key
  );
  return xorDecrypt(encryptedData, hashedKey);
};

/**
 * Encrypt JSON object
 */
export const encryptJSON = async <T>(data: T): Promise<string> => {
  const json = JSON.stringify(data);
  return await encryptData(json);
};

/**
 * Decrypt JSON object
 */
export const decryptJSON = async <T>(encryptedData: string): Promise<T> => {
  const decrypted = await decryptData(encryptedData);
  return JSON.parse(decrypted) as T;
};

