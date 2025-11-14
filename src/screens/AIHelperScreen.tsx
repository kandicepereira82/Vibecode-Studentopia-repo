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
import useUserStore from "../state/userStore";
import { useTranslation } from "../utils/translations";
import { getTheme } from "../utils/themes";
import { getOpenAITextResponse } from "../api/chat-service";
import { AIChatMessage, AIChatMode } from "../types";
import { cn } from "../utils/cn";
import ClickableCompanion from "../components/ClickableCompanion";
import MessageText from "../components/MessageText";
import { useGlobalToast } from "../context/ToastContext";
import { parseError, logError } from "../utils/errorUtils";
import { generateVideoSuggestionsForPrompt } from "../utils/videoLibrary";
import { containsInappropriateContent } from "../utils/contentModeration";

const AIHelperScreen = () => {
  const user = useUserStore((s) => s.user);
  const { t } = useTranslation(user?.language || "en");
  const theme = getTheme(user?.themeColor);
  const toast = useGlobalToast();

  const [mode, setMode] = useState<AIChatMode>("chat");
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [inputError, setInputError] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    // CONTENT MODERATION: Check for inappropriate content
    if (containsInappropriateContent(inputText)) {
      setInputError("Your message contains inappropriate content. Please revise.");
      return;
    }

    setInputError(""); // Clear any previous errors

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
      // Generate video suggestions based on the question
      const videoSuggestions = generateVideoSuggestionsForPrompt(inputText);

      const systemPrompt = mode === "grammar"
        ? `You are a professional grammar checker and writing assistant for educators. Check the following text for grammar, spelling, and punctuation errors. Provide clear corrections and explanations that a teacher can use. Maintain a professional, helpful tone. Respond in ${user?.language || "English"}.`
        : `You are a professional AI assistant for teachers at Studentopia. Help them with lesson planning, teaching strategies, classroom management, curriculum development, and educational resources with expertise and professionalism.

Your personality:
- Professional and knowledgeable, like an experienced educational consultant
- Use supportive phrases like "Great approach!", "Consider this strategy...", "Here's a research-backed method..."
- Provide practical, actionable advice that teachers can implement immediately
- When relevant videos are available, include them naturally in your response with the 📺 emoji

IMPORTANT: When you mention video resources, format them EXACTLY like this:
📺 Watch this video on [topic]: [full URL]

Be professional, supportive, and focus on helping teachers succeed in their educational goals! Respond in ${user?.language || "English"}.${videoSuggestions}`;

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
      logError("AIHelperScreen:handleSend", error);
      const errorInfo = parseError(error);
      toast.error(errorInfo.userMessage);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const clearChat = () => {
    setMessages([]);
    toast.info("Chat cleared");
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
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Text style={{
                fontSize: 32,
                fontFamily: 'Poppins_700Bold',
                color: theme.textPrimary
              }}>
                {t("aiHelper")}
              </Text>
              {user && (
                <View style={{ marginLeft: 16 }}>
                  <ClickableCompanion
                    animal={user.studyPalConfig.animal}
                    name={user.studyPalConfig.name}
                    animationsEnabled={false}
                    size={35}
                    showName={false}
                    showMessage={false}
                    customAvatar={user.studyPalConfig.avatar}
                  />
                </View>
              )}
            </View>
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
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: 'Poppins_600SemiBold',
                  color: theme.textPrimary,
                  marginTop: 16,
                  textAlign: 'center',
                  paddingHorizontal: 32
                }}
              >
                {mode === "chat"
                  ? `Hi ${user?.username || "there"}! 👋`
                  : "Grammar Checker Ready"}
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: 'Poppins_400Regular',
                  color: theme.textSecondary,
                  marginTop: 8,
                  textAlign: 'center',
                  paddingHorizontal: 32,
                  lineHeight: 22
                }}
              >
                {mode === "chat"
                  ? "Ask me anything about lesson planning, teaching strategies, or educational resources. I'm here to help you succeed as an educator!"
                  : "Paste your text below and I'll check it for grammar, spelling, and punctuation errors with professional feedback."}
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
                        : theme.cardBackground,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 3,
                      elevation: 2
                    }}
                  >
                    <MessageText
                      content={message.content}
                      color={message.role === "user" ? "white" : theme.textPrimary}
                      isUserMessage={message.role === "user"}
                    />
                  </View>
                  <Text className="text-xs mt-1 px-2" style={{ color: theme.textSecondary, fontFamily: 'Poppins_400Regular' }}>
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
                onChangeText={(text) => {
                  setInputText(text);
                  // Real-time validation
                  if (text.trim().length > 0 && containsInappropriateContent(text)) {
                    setInputError("Your message contains inappropriate content");
                  } else {
                    setInputError("");
                  }
                }}
                placeholder={t("askQuestion")}
                placeholderTextColor={theme.textSecondary}
                multiline
                maxLength={1000}
                className="text-base max-h-32"
                style={{ 
                  color: theme.textPrimary,
                  borderWidth: inputError ? 2 : 0,
                  borderColor: inputError ? "#EF4444" : "transparent",
                }}
                editable={!isLoading}
              />
              {inputError && (
                <Text style={{ 
                  color: "#EF4444", 
                  fontSize: 12, 
                  marginTop: 4,
                  fontFamily: "Poppins_400Regular"
                }}>
                  {inputError}
                </Text>
              )}
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
