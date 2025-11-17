import React, { useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from "react-native-reanimated";

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
}

interface ToastProps extends Toast {
  onDismiss: (id: string) => void;
}

const ToastComponent: React.FC<ToastProps> = ({
  id,
  message,
  type,
  duration = 3000,
  onDismiss,
}) => {
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Fade in
    opacity.value = withTiming(1, { duration: 300 });

    // Auto dismiss
    if (duration > 0) {
      const timer = setTimeout(() => {
        // Fade out
        opacity.value = withTiming(0, { duration: 300 }, (finished) => {
          if (finished) {
            runOnJS(onDismiss)(id);
          }
        });
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, opacity, id, onDismiss]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return "#10B981";
      case "error":
        return "#EF4444";
      case "warning":
        return "#F59E0B";
      case "info":
        return "#3B82F6";
      default:
        return "#6B7280";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return "checkmark-circle";
      case "error":
        return "close-circle";
      case "warning":
        return "alert-circle";
      case "info":
        return "information-circle";
      default:
        return "alert";
    }
  };

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          marginHorizontal: 16,
          marginVertical: 8,
        },
      ]}
    >
      <View
        style={{
          backgroundColor: getBackgroundColor(),
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <Ionicons name={getIcon()} size={20} color="white" />
          <Text
            style={{
              color: "white",
              fontSize: 14,
              fontFamily: "Poppins_500Medium",
              marginLeft: 12,
              flex: 1,
            }}
          >
            {message}
          </Text>
        </View>
        <Pressable onPress={() => onDismiss(id)} style={{ padding: 4 }}>
          <Ionicons name="close" size={18} color="white" />
        </Pressable>
      </View>
    </Animated.View>
  );
};

export default ToastComponent;
