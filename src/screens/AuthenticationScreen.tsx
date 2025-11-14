import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, Keyboard, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useUserStore from "../state/userStore";
import useStatsStore from "../state/statsStore";
import useOnboardingStore from "../state/onboardingStore";
import { authService } from "../utils/authService";
import { useGlobalToast } from "../context/ToastContext";
import { parseError, logError } from "../utils/errorUtils";
import { validateName, validateNameRealtime } from "../utils/contentModeration";

interface AuthenticationScreenProps {
  onComplete: () => void;
}

const AuthenticationScreen: React.FC<AuthenticationScreenProps> = ({ onComplete }) => {
  const setUser = useUserStore((s) => s.setUser);
  const initStats = useStatsStore((s) => s.initStats);
  const preferences = useOnboardingStore((s) => s.preferences);
  const clearPreferences = useOnboardingStore((s) => s.clearPreferences);
  const toast = useGlobalToast();

  const [mode, setMode] = useState<"choice" | "login" | "signup">("choice");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetEmailSent, setResetEmailSent] = useState(false);

  // Load saved credentials on mount (autofill)
  useEffect(() => {
    loadSavedCredentials();
  }, []);

  const loadSavedCredentials = async () => {
    try {
      const savedEmail = await AsyncStorage.getItem("@studentopia_saved_email");
      const savedUsername = await AsyncStorage.getItem("@studentopia_saved_username");

      if (savedEmail) setEmail(savedEmail);
      if (savedUsername) setUsername(savedUsername);
    } catch (error) {
      console.log("Failed to load saved credentials:", error);
    }
  };

  const saveCredentials = async (emailValue: string, usernameValue: string) => {
    try {
      await AsyncStorage.setItem("@studentopia_saved_email", emailValue);
      await AsyncStorage.setItem("@studentopia_saved_username", usernameValue);
    } catch (error) {
      console.log("Failed to save credentials:", error);
    }
  };

  // Pre-fill email and username from onboarding preferences
  useEffect(() => {
    if (preferences) {
      setEmail(preferences.email || "");
      setUsername(preferences.username || "");
    }
  }, [preferences]);

  const validateEmail = (emailValue: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailValue);
  };

  const handleLogin = async () => {
    Keyboard.dismiss();
    const newErrors: { [key: string]: string } = {};

    if (!email.trim()) newErrors.email = "Email is required";
    else if (!validateEmail(email)) newErrors.email = "Invalid email format";

    if (!password.trim()) newErrors.password = "Password is required";
    else {
      // SECURITY FIX: Strong password validation
      if (password.length < 12) {
        newErrors.password = "Password must be at least 12 characters";
      } else if (!/[a-z]/.test(password)) {
        newErrors.password = "Password must contain at least one lowercase letter";
      } else if (!/[A-Z]/.test(password)) {
        newErrors.password = "Password must contain at least one uppercase letter";
      } else if (!/[0-9]/.test(password)) {
        newErrors.password = "Password must contain at least one number";
      } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        newErrors.password = "Password must contain at least one special character";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const result = await authService.login(email, password);

      if (result.success && result.userId) {
        // Save credentials for autofill
        await saveCredentials(email, username || result.username || "User");

        // Create user with onboarding preferences
        const newUser = {
          id: result.userId,
          username: preferences?.username || result.username || "User",
          email: email,
          role: preferences?.role || ("student" as const),
          language: "en" as const,
          themeColor: preferences?.themeColor || ("nature" as const),
          studyPalConfig: {
            name: preferences?.studyPalName || "Tomo",
            animal: preferences?.animal || ("redpanda" as const),
            animationsEnabled: false,
          },
          notificationEnabled: true,
          notificationSound: true,
          notificationVibration: true,
          mindfulnessBreakEnabled: true,
          createdAt: new Date(),
        };
        setUser(newUser);
        initStats(result.userId);
        clearPreferences();
        toast.success("Welcome back!");
        onComplete();
      } else {
        setErrors({ auth: result.error || "Login failed" });
        toast.error(result.error || "Login failed");
      }
    } catch (error) {
      logError("AuthenticationScreen:handleLogin", error);
      const errorInfo = parseError(error);
      setErrors({ auth: errorInfo.userMessage });
      toast.error(errorInfo.userMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    Keyboard.dismiss();
    const newErrors: { [key: string]: string } = {};

    // CONTENT MODERATION: Validate username
    if (!username.trim()) {
      newErrors.username = "Name is required";
    } else {
      const usernameResult = validateName(username, "username");
      if (!usernameResult.isValid) {
        newErrors.username = usernameResult.error || "Invalid username";
      }
    }

    if (!email.trim()) newErrors.email = "Email is required";
    else if (!validateEmail(email)) newErrors.email = "Invalid email format";

    if (!password.trim()) newErrors.password = "Password is required";
    else {
      // SECURITY FIX: Strong password validation
      if (password.length < 12) {
        newErrors.password = "Password must be at least 12 characters";
      } else if (!/[a-z]/.test(password)) {
        newErrors.password = "Password must contain at least one lowercase letter";
      } else if (!/[A-Z]/.test(password)) {
        newErrors.password = "Password must contain at least one uppercase letter";
      } else if (!/[0-9]/.test(password)) {
        newErrors.password = "Password must contain at least one number";
      } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        newErrors.password = "Password must contain at least one special character";
      }
    }

    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const result = await authService.register(email, password, username);

      if (result.success && result.userId) {
        // Save credentials for autofill
        await saveCredentials(email, username);

        // Create user with onboarding preferences
        const newUser = {
          id: result.userId,
          username: preferences?.username || username,
          email: email,
          role: preferences?.role || ("student" as const),
          language: "en" as const,
          themeColor: preferences?.themeColor || ("nature" as const),
          studyPalConfig: {
            name: preferences?.studyPalName || "Tomo",
            animal: preferences?.animal || ("redpanda" as const),
            animationsEnabled: false,
          },
          notificationEnabled: true,
          notificationSound: true,
          notificationVibration: true,
          mindfulnessBreakEnabled: true,
          createdAt: new Date(),
        };
        setUser(newUser);
        initStats(result.userId);
        clearPreferences();
        toast.success("Account created successfully!");
        onComplete();
      } else {
        setErrors({ auth: result.error || "Signup failed" });
        toast.error(result.error || "Signup failed");
      }
    } catch (error) {
      logError("AuthenticationScreen:handleSignup", error);
      const errorInfo = parseError(error);
      setErrors({ auth: errorInfo.userMessage });
      toast.error(errorInfo.userMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail.trim()) {
      toast.error("Please enter your email");
      return;
    }

    if (!validateEmail(resetEmail)) {
      toast.error("Please enter a valid email");
      return;
    }

    setLoading(true);
    try {
      const result = await authService.requestPasswordReset(resetEmail);

      if (result.success) {
        setResetEmailSent(true);
        toast.success("Password reset instructions sent!");
      } else {
        toast.error(result.error || "Failed to send reset email");
      }
    } catch (error) {
      logError("AuthenticationScreen:handleForgotPassword", error);
      toast.error("Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-8">
          {/* Header */}
          <View className="items-center mb-12">
            <View className="w-24 h-24 bg-blue-500 rounded-full items-center justify-center mb-4">
              <Ionicons name="lock-closed" size={48} color="white" />
            </View>
            <Text
              style={{
                fontSize: 28,
                fontFamily: "Poppins_700Bold",
                color: "#1F2937",
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              Studentopia
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Poppins_400Regular",
                color: "#6B7280",
                textAlign: "center",
              }}
            >
              {mode === "choice" ? "Secure Access" : mode === "login" ? "Welcome Back" : "Create Account"}
            </Text>
          </View>

          {/* Choice Mode */}
          {mode === "choice" && (
            <View className="gap-4">
              <Pressable
                onPress={() => {
                  setMode("login");
                  setErrors({});
                }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-blue-500"
              >
                <View className="flex-row items-center">
                  <Ionicons name="log-in" size={32} color="#3B82F6" />
                  <View className="ml-4 flex-1">
                    <Text style={{ fontSize: 18, fontFamily: "Poppins_600SemiBold", color: "#1F2937" }}>
                      Login
                    </Text>
                    <Text style={{ fontSize: 14, fontFamily: "Poppins_400Regular", color: "#6B7280", marginTop: 4 }}>
                      Sign in to your existing account
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
                </View>
              </Pressable>

              <Pressable
                onPress={() => {
                  setMode("signup");
                  setErrors({});
                }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-300 dark:border-gray-700"
              >
                <View className="flex-row items-center">
                  <Ionicons name="person-add" size={32} color="#6B7280" />
                  <View className="ml-4 flex-1">
                    <Text style={{ fontSize: 18, fontFamily: "Poppins_600SemiBold", color: "#1F2937" }}>
                      Sign Up
                    </Text>
                    <Text style={{ fontSize: 14, fontFamily: "Poppins_400Regular", color: "#6B7280", marginTop: 4 }}>
                      Create a new account
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
                </View>
              </Pressable>
            </View>
          )}

          {/* Login Mode */}
          {mode === "login" && (
            <View className="gap-4">
              <View>
                <Text style={{ fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#1F2937", marginBottom: 8 }}>
                  Email
                </Text>
                <TextInput
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setErrors({ ...errors, email: "" });
                  }}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                  style={{
                    backgroundColor: "#FFFFFF",
                    color: "#1F2937",
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 16,
                    fontFamily: "Poppins_400Regular",
                    borderWidth: errors.email ? 2 : 1,
                    borderColor: errors.email ? "#EF4444" : "#E5E7EB",
                  }}
                />
                {errors.email && (
                  <Text style={{ fontSize: 12, fontFamily: "Poppins_500Medium", color: "#EF4444", marginTop: 4 }}>
                    {errors.email}
                  </Text>
                )}
              </View>

              <View>
                <Text style={{ fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#1F2937", marginBottom: 8 }}>
                  Password
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", borderRadius: 12, overflow: "hidden" }}>
                  <TextInput
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      setErrors({ ...errors, password: "" });
                    }}
                    placeholder="Enter your password"
                    secureTextEntry={!showPassword}
                    editable={!loading}
                    style={{
                      flex: 1,
                      backgroundColor: "#FFFFFF",
                      color: "#1F2937",
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      fontSize: 16,
                      fontFamily: "Poppins_400Regular",
                      borderWidth: errors.password ? 2 : 1,
                      borderColor: errors.password ? "#EF4444" : "#E5E7EB",
                      borderRadius: 12,
                    }}
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: 12 }}
                    disabled={loading}
                  >
                    <Ionicons name={showPassword ? "eye" : "eye-off"} size={20} color="#9CA3AF" />
                  </Pressable>
                </View>
                {errors.password && (
                  <Text style={{ fontSize: 12, fontFamily: "Poppins_500Medium", color: "#EF4444", marginTop: 4 }}>
                    {errors.password}
                  </Text>
                )}
                <Pressable
                  onPress={() => {
                    setResetEmail(email);
                    setResetEmailSent(false);
                    setShowForgotPasswordModal(true);
                  }}
                  disabled={loading}
                  style={{ alignSelf: "flex-end", marginTop: 8 }}
                >
                  <Text style={{ fontSize: 13, fontFamily: "Poppins_500Medium", color: "#3B82F6" }}>
                    Forgot Password?
                  </Text>
                </Pressable>
              </View>

              {errors.auth && (
                <View className="bg-red-50 dark:bg-red-900 rounded-2xl p-3">
                  <Text style={{ fontSize: 14, fontFamily: "Poppins_500Medium", color: "#DC2626" }}>
                    {errors.auth}
                  </Text>
                </View>
              )}

              <Pressable
                onPress={handleLogin}
                disabled={loading}
                className="mt-4"
              >
                <LinearGradient colors={["#3B82F6", "#1D4ED8"]} style={{ borderRadius: 12, paddingVertical: 16, alignItems: "center" }}>
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={{ fontSize: 16, fontFamily: "Poppins_700Bold", color: "#FFFFFF" }}>
                      Login
                    </Text>
                  )}
                </LinearGradient>
              </Pressable>

              <Pressable
                onPress={() => {
                  setMode("choice");
                  setErrors({});
                  setEmail("");
                  setPassword("");
                }}
                disabled={loading}
              >
                <Text style={{ fontSize: 14, fontFamily: "Poppins_500Medium", color: "#6B7280", textAlign: "center" }}>
                  Back
                </Text>
              </Pressable>
            </View>
          )}

          {/* Signup Mode */}
          {mode === "signup" && (
            <View className="gap-4">
              <View>
                <Text style={{ fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#1F2937", marginBottom: 8 }}>
                  Full Name
                </Text>
                <TextInput
                  value={username}
                  onChangeText={(text) => {
                    setUsername(text);
                    // Real-time validation
                    const error = validateNameRealtime(text, "username");
                    if (error) {
                      setErrors({ ...errors, username: error });
                    } else {
                      const { username: _, ...rest } = errors;
                      setErrors(rest);
                    }
                  }}
                  placeholder="Enter your name"
                  editable={!loading}
                  style={{
                    backgroundColor: "#FFFFFF",
                    color: "#1F2937",
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 16,
                    fontFamily: "Poppins_400Regular",
                    borderWidth: errors.username ? 2 : 1,
                    borderColor: errors.username ? "#EF4444" : "#E5E7EB",
                  }}
                />
                {errors.username && (
                  <Text style={{ fontSize: 12, fontFamily: "Poppins_500Medium", color: "#EF4444", marginTop: 4 }}>
                    {errors.username}
                  </Text>
                )}
              </View>

              <View>
                <Text style={{ fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#1F2937", marginBottom: 8 }}>
                  Email
                </Text>
                <TextInput
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setErrors({ ...errors, email: "" });
                  }}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                  style={{
                    backgroundColor: "#FFFFFF",
                    color: "#1F2937",
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 16,
                    fontFamily: "Poppins_400Regular",
                    borderWidth: errors.email ? 2 : 1,
                    borderColor: errors.email ? "#EF4444" : "#E5E7EB",
                  }}
                />
                {errors.email && (
                  <Text style={{ fontSize: 12, fontFamily: "Poppins_500Medium", color: "#EF4444", marginTop: 4 }}>
                    {errors.email}
                  </Text>
                )}
              </View>

              <View>
                <Text style={{ fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#1F2937", marginBottom: 8 }}>
                  Password
                </Text>
                <Pressable
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    borderRadius: 12,
                    overflow: "hidden",
                  }}
                  onPress={() => {}}
                >
                  <TextInput
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      setErrors({ ...errors, password: "" });
                    }}
                    placeholder="Enter your password"
                    secureTextEntry={!showPassword}
                    editable={!loading}
                    style={{
                      flex: 1,
                      backgroundColor: "#FFFFFF",
                      color: "#1F2937",
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      fontSize: 16,
                      fontFamily: "Poppins_400Regular",
                      borderWidth: errors.password ? 2 : 1,
                      borderColor: errors.password ? "#EF4444" : "#E5E7EB",
                      borderRadius: 12,
                    }}
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: 12 }}
                    disabled={loading}
                  >
                    <Ionicons name={showPassword ? "eye" : "eye-off"} size={20} color="#9CA3AF" />
                  </Pressable>
                </Pressable>
                {errors.password && (
                  <Text style={{ fontSize: 12, fontFamily: "Poppins_500Medium", color: "#EF4444", marginTop: 4 }}>
                    {errors.password}
                  </Text>
                )}
              </View>

              <View>
                <Text style={{ fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#1F2937", marginBottom: 8 }}>
                  Confirm Password
                </Text>
                <Pressable
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    borderRadius: 12,
                    overflow: "hidden",
                  }}
                  onPress={() => {}}
                >
                  <TextInput
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      setErrors({ ...errors, confirmPassword: "" });
                    }}
                    placeholder="Confirm your password"
                    secureTextEntry={!showConfirmPassword}
                    editable={!loading}
                    style={{
                      flex: 1,
                      backgroundColor: "#FFFFFF",
                      color: "#1F2937",
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      fontSize: 16,
                      fontFamily: "Poppins_400Regular",
                      borderWidth: errors.confirmPassword ? 2 : 1,
                      borderColor: errors.confirmPassword ? "#EF4444" : "#E5E7EB",
                      borderRadius: 12,
                    }}
                  />
                  <Pressable
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ position: "absolute", right: 12 }}
                    disabled={loading}
                  >
                    <Ionicons name={showConfirmPassword ? "eye" : "eye-off"} size={20} color="#9CA3AF" />
                  </Pressable>
                </Pressable>
                {errors.confirmPassword && (
                  <Text style={{ fontSize: 12, fontFamily: "Poppins_500Medium", color: "#EF4444", marginTop: 4 }}>
                    {errors.confirmPassword}
                  </Text>
                )}
              </View>

              {errors.auth && (
                <View className="bg-red-50 dark:bg-red-900 rounded-2xl p-3">
                  <Text style={{ fontSize: 14, fontFamily: "Poppins_500Medium", color: "#DC2626" }}>
                    {errors.auth}
                  </Text>
                </View>
              )}

              <Pressable
                onPress={handleSignup}
                disabled={loading}
                className="mt-4"
              >
                <LinearGradient colors={["#3B82F6", "#1D4ED8"]} style={{ borderRadius: 12, paddingVertical: 16, alignItems: "center" }}>
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={{ fontSize: 16, fontFamily: "Poppins_700Bold", color: "#FFFFFF" }}>
                      Create Account
                    </Text>
                  )}
                </LinearGradient>
              </Pressable>

              <Pressable
                onPress={() => {
                  setMode("choice");
                  setErrors({});
                  setEmail("");
                  setPassword("");
                  setConfirmPassword("");
                  setUsername("");
                }}
                disabled={loading}
              >
                <Text style={{ fontSize: 14, fontFamily: "Poppins_500Medium", color: "#6B7280", textAlign: "center" }}>
                  Back
                </Text>
              </Pressable>
            </View>
          )}

          <View className="h-12" />
        </View>
      </ScrollView>

      {/* Forgot Password Modal */}
      <Modal
        visible={showForgotPasswordModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowForgotPasswordModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", paddingHorizontal: 24 }}>
          <View style={{ backgroundColor: "white", borderRadius: 24, width: "100%", maxWidth: 400, padding: 24 }}>
            {!resetEmailSent ? (
              <>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <Text style={{ fontSize: 20, fontFamily: "Poppins_700Bold", color: "#1F2937" }}>
                    Forgot Password?
                  </Text>
                  <Pressable onPress={() => setShowForgotPasswordModal(false)}>
                    <Ionicons name="close" size={28} color="#6B7280" />
                  </Pressable>
                </View>

                <Text style={{ fontSize: 14, fontFamily: "Poppins_400Regular", color: "#6B7280", marginBottom: 20, lineHeight: 20 }}>
                  Enter your email address and we will send you a link to reset your password.
                </Text>

                <View style={{ marginBottom: 20 }}>
                  <Text style={{ fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#1F2937", marginBottom: 8 }}>
                    Email
                  </Text>
                  <TextInput
                    value={resetEmail}
                    onChangeText={setResetEmail}
                    placeholder="Enter your email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!loading}
                    style={{
                      backgroundColor: "#F3F4F6",
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      fontSize: 16,
                      fontFamily: "Poppins_400Regular",
                      color: "#1F2937",
                      borderWidth: 1,
                      borderColor: "#E5E7EB",
                    }}
                  />
                </View>

                <View style={{ flexDirection: "row", gap: 12 }}>
                  <Pressable
                    onPress={() => setShowForgotPasswordModal(false)}
                    disabled={loading}
                    style={{
                      flex: 1,
                      paddingVertical: 14,
                      borderRadius: 12,
                      backgroundColor: "#F3F4F6",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontSize: 15, fontFamily: "Poppins_600SemiBold", color: "#6B7280" }}>
                      Cancel
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={handleForgotPassword}
                    disabled={loading}
                    style={{
                      flex: 1,
                      borderRadius: 12,
                      overflow: "hidden",
                    }}
                  >
                    <LinearGradient colors={["#3B82F6", "#1D4ED8"]} style={{ paddingVertical: 14, alignItems: "center" }}>
                      {loading ? (
                        <ActivityIndicator color="white" size="small" />
                      ) : (
                        <Text style={{ fontSize: 15, fontFamily: "Poppins_600SemiBold", color: "white" }}>
                          Send Link
                        </Text>
                      )}
                    </LinearGradient>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <View style={{ alignItems: "center", paddingVertical: 20 }}>
                  <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: "#10B981", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                    <Ionicons name="checkmark" size={50} color="white" />
                  </View>
                  <Text style={{ fontSize: 22, fontFamily: "Poppins_700Bold", color: "#1F2937", marginBottom: 12, textAlign: "center" }}>
                    Password Reset Email Sent
                  </Text>
                  <Text style={{ fontSize: 14, fontFamily: "Poppins_400Regular", color: "#6B7280", textAlign: "center", lineHeight: 20, marginBottom: 8 }}>
                    We have sent password reset instructions to:
                  </Text>
                  <Text style={{ fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#3B82F6", textAlign: "center", marginBottom: 16 }}>
                    {resetEmail}
                  </Text>
                  <Text style={{ fontSize: 13, fontFamily: "Poppins_400Regular", color: "#9CA3AF", textAlign: "center", lineHeight: 18, marginBottom: 24 }}>
                    Please check your inbox or spam folder. The reset link will expire in 15 minutes.
                  </Text>
                  <Pressable
                    onPress={() => setShowForgotPasswordModal(false)}
                    style={{
                      width: "100%",
                      borderRadius: 12,
                      overflow: "hidden",
                    }}
                  >
                    <LinearGradient colors={["#3B82F6", "#1D4ED8"]} style={{ paddingVertical: 14, alignItems: "center" }}>
                      <Text style={{ fontSize: 15, fontFamily: "Poppins_600SemiBold", color: "white" }}>
                        Got It
                      </Text>
                    </LinearGradient>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AuthenticationScreen;
