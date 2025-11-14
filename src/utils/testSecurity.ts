/**
 * SECURITY TESTING UTILITIES
 * 
 * Helper functions for testing security fixes
 * Run these in development mode to verify security implementations
 */

import { authService } from "./authService";
import { sessionService } from "../services/sessionService";
import { mfaService } from "../services/mfaService";
import { decryptJSON } from "./encryption";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Test password requirements
 */
export async function testPasswordRequirements(): Promise<void> {
  console.log("🧪 Testing Password Requirements...");
  
  const testCases = [
    { password: "123", expected: false, reason: "Too short" },
    { password: "password", expected: false, reason: "No uppercase/number/special" },
    { password: "Password123", expected: false, reason: "No special character" },
    { password: "Password123!", expected: true, reason: "Meets all requirements" },
  ];

  for (const testCase of testCases) {
    const result = await authService.register("test@test.com", testCase.password, "Test");
    const passed = result.success === testCase.expected;
    console.log(`  ${testCase.password}: ${passed ? "✅" : "❌"} - ${testCase.reason}`);
  }
}

/**
 * Test rate limiting
 */
export async function testRateLimiting(): Promise<void> {
  console.log("🧪 Testing Rate Limiting...");
  
  const email = `ratelimit-test-${Date.now()}@test.com`;
  
  // Register user first
  await authService.register(email, "TestPassword123!", "TestUser");
  
  // Try 6 failed logins
  for (let i = 0; i < 6; i++) {
    const result = await authService.login(email, "wrongpassword");
    console.log(`  Attempt ${i + 1}: ${result.error || "Success"}`);
    
    if (result.error?.includes("locked")) {
      console.log("  ✅ Rate limiting working!");
      break;
    }
  }
}

/**
 * Test token expiration
 */
export async function testTokenExpiration(): Promise<void> {
  console.log("🧪 Testing Token Expiration...");
  
  try {
    const tokenData = await SecureStore.getItemAsync("auth_token");
    if (!tokenData) {
      console.log("  ⚠️ No token found - login first");
      return;
    }
    
    const data = JSON.parse(tokenData);
    const expired = Date.now() >= data.expiresAt;
    const expiresIn = Math.floor((data.expiresAt - Date.now()) / 1000 / 60);
    
    console.log(`  Token expires in: ${expiresIn} minutes`);
    console.log(`  Token expired: ${expired ? "✅ Yes" : "❌ No"}`);
  } catch (error) {
    console.log("  ⚠️ Error checking token:", error);
  }
}

/**
 * Test data encryption
 */
export async function testDataEncryption(): Promise<void> {
  console.log("🧪 Testing Data Encryption...");
  
  try {
    let encrypted: string | null = null;
    try {
      encrypted = await SecureStore.getItemAsync("app_credentials");
    } catch {
      encrypted = await AsyncStorage.getItem("app_credentials");
    }
    
    if (!encrypted) {
      console.log("  ⚠️ No credentials found - register a user first");
      return;
    }
    
    // Try to parse as JSON (should fail if encrypted)
    try {
      JSON.parse(encrypted);
      console.log("  ❌ FAIL: Data not encrypted (plain JSON)");
    } catch {
      // Try to decrypt
      try {
        const decrypted = await decryptJSON(encrypted);
        console.log("  ✅ PASS: Data is encrypted and decrypts correctly");
        console.log(`  Found ${Array.isArray(decrypted) ? decrypted.length : 0} credentials`);
      } catch (decryptError) {
        console.log("  ⚠️ Encryption format may be different:", decryptError);
      }
    }
  } catch (error) {
    console.log("  ⚠️ Error checking encryption:", error);
  }
}

/**
 * Test session management
 */
export async function testSessionManagement(userId: string): Promise<void> {
  console.log("🧪 Testing Session Management...");
  
  try {
    const sessions = await sessionService.getUserSessions(userId);
    console.log(`  Active sessions: ${sessions.length}`);
    
    if (sessions.length > 0) {
      const session = sessions[0];
      console.log(`  Session ID: ${session.sessionId}`);
      console.log(`  Device: ${session.deviceName} (${session.platform})`);
      console.log(`  Created: ${new Date(session.createdAt).toLocaleString()}`);
      console.log(`  Last Active: ${new Date(session.lastActive).toLocaleString()}`);
    }
    
    const currentSessionId = await sessionService.getCurrentSessionId();
    console.log(`  Current Session ID: ${currentSessionId || "None"}`);
    
    console.log("  ✅ Session management working!");
  } catch (error) {
    console.log("  ⚠️ Error checking sessions:", error);
  }
}

/**
 * Test MFA
 */
export async function testMFA(userId: string, email: string): Promise<void> {
  console.log("🧪 Testing MFA...");
  
  try {
    const enabled = await mfaService.isMFAEnabled(userId);
    console.log(`  MFA Enabled: ${enabled ? "Yes" : "No"}`);
    
    if (!enabled) {
      console.log("  Setting up MFA...");
      const setup = await mfaService.enableMFA(userId, email);
      console.log("  ✅ MFA Setup Complete");
      console.log(`  QR Code Data: ${setup.qrCodeData.substring(0, 50)}...`);
      console.log(`  Backup Codes: ${setup.backupCodes.length} codes generated`);
    } else {
      const code = await mfaService.getCurrentTOTPCode(userId);
      console.log(`  Current TOTP Code: ${code || "Unable to generate"}`);
    }
  } catch (error) {
    console.log("  ⚠️ Error testing MFA:", error);
  }
}

/**
 * Test share code hashing
 */
export async function testShareCodeHashing(): Promise<void> {
  console.log("🧪 Testing Share Code Hashing...");
  
  // This would require groupStore - simplified test
  console.log("  ⚠️ Manual test required:");
  console.log("  1. Create a group");
  console.log("  2. Check group.shareCode (plain)");
  console.log("  3. Check group.shareCodeHash (hashed)");
  console.log("  4. Verify hash is SHA256 format");
}

/**
 * Test chat rate limiting
 */
export async function testChatRateLimiting(): Promise<void> {
  console.log("🧪 Testing Chat Rate Limiting...");
  console.log("  ⚠️ Manual test required:");
  console.log("  1. Join a study room");
  console.log("  2. Send 10 messages quickly");
  console.log("  3. Try to send 11th message");
  console.log("  4. Should be blocked");
}

/**
 * Run all security tests
 */
export async function runAllSecurityTests(userId?: string, email?: string): Promise<void> {
  console.log("🚀 Running All Security Tests...\n");
  
  await testPasswordRequirements();
  console.log("");
  
  await testRateLimiting();
  console.log("");
  
  await testTokenExpiration();
  console.log("");
  
  await testDataEncryption();
  console.log("");
  
  if (userId) {
    await testSessionManagement(userId);
    console.log("");
  }
  
  if (userId && email) {
    await testMFA(userId, email);
    console.log("");
  }
  
  await testShareCodeHashing();
  console.log("");
  
  await testChatRateLimiting();
  console.log("");
  
  console.log("✅ All Security Tests Complete!");
}

// Export for use in app
export default {
  testPasswordRequirements,
  testRateLimiting,
  testTokenExpiration,
  testDataEncryption,
  testSessionManagement,
  testMFA,
  testShareCodeHashing,
  testChatRateLimiting,
  runAllSecurityTests,
};

