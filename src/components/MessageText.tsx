import React from "react";
import { Text, Linking, Alert } from "react-native";

interface MessageTextProps {
  content: string;
  color: string;
  isUserMessage: boolean;
}

/**
 * Renders message text with clickable links
 * Detects URLs and formats them as pressable links
 */
const MessageText: React.FC<MessageTextProps> = ({ content, color, isUserMessage }) => {
  // Regex to detect URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = content.split(urlRegex);

  const handleLinkPress = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "Cannot open this link");
      }
    } catch {
      Alert.alert("Error", "Failed to open link");
    }
  };

  return (
    <Text style={{ fontSize: 15, fontFamily: "Poppins_400Regular", lineHeight: 22 }}>
      {parts.map((part, index) => {
        // Check if this part is a URL
        if (urlRegex.test(part)) {
          return (
            <Text
              key={index}
              onPress={() => handleLinkPress(part)}
              style={{
                color: isUserMessage ? "#E0F2FE" : "#3B82F6",
                textDecorationLine: "underline",
                fontFamily: "Poppins_600SemiBold",
              }}
            >
              {part}
            </Text>
          );
        }
        // Regular text - preserve formatting like bold and emoji
        return (
          <Text key={index} style={{ color }}>
            {part}
          </Text>
        );
      })}
    </Text>
  );
};

export default MessageText;
