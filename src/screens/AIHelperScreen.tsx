import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import useUserStore from "../state/userStore";
import { useTranslation } from "../utils/translations";
import { getTheme } from "../utils/themes";
import { getOpenAITextResponse } from "../api/chat-service";
import { AIChatMessage, AIChatMode } from "../types";
import { cn } from "../utils/cn";

const AIHelperScreen = () => {
  const user = useUserStore((s) => s.user);
  const { t } = useTranslation(user?.language || "en");
  const theme = getTheme(user?.themeColor);

  const [mode, setMode] = useState<AIChatMode>("chat");
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: AIChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      const systemPrompt = mode === "grammar"
        ? `You are a grammar checker. Check the following text for grammar, spelling, and punctuation errors. Provide corrections and explanations. Respond in ${user?.language || "English"}.`
        : `You are a helpful AI tutor assistant for students. Help them with homework, projects, research, and studying. Provide clear explanations and suggest relevant resources when appropriate. Respond in ${user?.language || "English"}.`;

      const response = await getOpenAITextResponse([
        { role: "system", content: systemPrompt },
        ...messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        { role: "user", content: inputText },
      ]);

      const assistantMessage: AIChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: AIChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.backgroundGradient[0] }}>
    <SafeAreaView className="flex-1" edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* Header with Poppins */}
        <View style={{
          paddingHorizontal: 24,
          paddingTop: 16,
          paddingBottom: 12,
          backgroundColor: theme.backgroundGradient[0],
          borderBottomWidth: 1,
          borderBottomColor: theme.textSecondary + "20"
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{
              fontSize: 32,
              fontFamily: 'Poppins_700Bold',
              color: theme.textPrimary
            }}>
              {t("aiHelper")}
            </Text>
            {messages.length > 0 && (
              <Pressable onPress={clearChat} style={{ padding: 8 }}>
                <Ionicons name="trash-outline" size={24} color="#EF4444" />
              </Pressable>
            )}
          </View>

          {/* Mode Toggle */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable
              onPress={() => setMode("chat")}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 16,
                alignItems: 'center',
                backgroundColor: mode === "chat" ? theme.primary : 'white',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 1
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons
                  name="chatbubbles"
                  size={18}
                  color={mode === "chat" ? "white" : theme.textSecondary}
                />
                <Text
                  style={{
                    marginLeft: 8,
                    fontFamily: 'Poppins_600SemiBold',
                    fontSize: 14,
                    color: mode === "chat" ? "white" : theme.textSecondary
                  }}
                >
                  {t("chatMode")}
                </Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => setMode("grammar")}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 16,
                alignItems: 'center',
                backgroundColor: mode === "grammar" ? theme.secondary : 'white',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 1
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons
                  name="checkmark-done"
                  size={18}
                  color={mode === "grammar" ? "white" : theme.textSecondary}
                />
                <Text
                  style={{
                    marginLeft: 8,
                    fontFamily: 'Poppins_600SemiBold',
                    fontSize: 14,
                    color: mode === "grammar" ? "white" : theme.textSecondary
                  }}
                >
                  {t("grammarMode")}
                </Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 16 }}
        >
          {messages.length === 0 ? (
            <View className="flex-1 items-center justify-center py-20">
              <Ionicons
                name={mode === "chat" ? "chatbubbles-outline" : "checkmark-done-outline"}
                size={80}
                color={theme.textSecondary}
              />
              <Text className="text-lg mt-4 text-center" style={{ color: theme.textSecondary }}>
                {mode === "chat"
                  ? "Ask me anything about your homework or studies!"
                  : "Paste your text to check for grammar errors"}
              </Text>
            </View>
          ) : (
            <View>
              {messages.map((message) => (
                <View
                  key={message.id}
                  className={cn(
                    "mb-4",
                    message.role === "user" ? "items-end" : "items-start"
                  )}
                >
                  <View
                    className="max-w-[80%] px-4 py-3 rounded-2xl"
                    style={{
                      backgroundColor: message.role === "user"
                        ? theme.primary
                        : theme.cardBackground
                    }}
                  >
                    <Text
                      className="text-base"
                      style={{
                        color: message.role === "user"
                          ? "white"
                          : theme.textPrimary
                      }}
                    >
                      {message.content}
                    </Text>
                  </View>
                  <Text className="text-xs mt-1 px-2" style={{ color: theme.textSecondary }}>
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              ))}
              {isLoading && (
                <View className="items-start mb-4">
                  <View className="px-4 py-3 rounded-2xl" style={{ backgroundColor: theme.cardBackground }}>
                    <ActivityIndicator size="small" color={theme.primary} />
                  </View>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View className="px-6 py-3 border-t" style={{ backgroundColor: theme.backgroundGradient[0], borderTopColor: theme.textSecondary + "20" }}>
          <View className="flex-row items-end gap-2">
            <View className="flex-1 rounded-2xl px-4 py-2" style={{ backgroundColor: theme.cardBackground }}>
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder={t("askQuestion")}
                placeholderTextColor={theme.textSecondary}
                multiline
                maxLength={1000}
                className="text-base max-h-32"
                style={{ color: theme.textPrimary }}
                editable={!isLoading}
              />
            </View>
            <Pressable
              onPress={handleSend}
              disabled={!inputText.trim() || isLoading}
              className="w-12 h-12 rounded-full items-center justify-center"
              style={{
                backgroundColor: inputText.trim() && !isLoading
                  ? (mode === "chat" ? theme.primary : theme.secondary)
                  : theme.textSecondary + "50"
              }}
            >
              <Ionicons
                name="send"
                size={20}
                color={inputText.trim() && !isLoading ? "white" : theme.textSecondary}
              />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
    </View>
  );
};

export default AIHelperScreen;
