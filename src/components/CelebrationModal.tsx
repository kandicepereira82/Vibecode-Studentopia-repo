import React, { useEffect } from "react";
import { Modal, View, Text, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withRepeat,
  Easing,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import StudyPal from "./StudyPal";
import useUserStore from "../state/userStore";

interface CelebrationModalProps {
  visible: boolean;
  onClose: () => void;
  taskTitle: string;
}

const CelebrationModal: React.FC<CelebrationModalProps> = ({
  visible,
  onClose,
  taskTitle,
}) => {
  const user = useUserStore((s) => s.user);
  const scale = useSharedValue(0);
  const rotation = useSharedValue(0);
  const confettiScale = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 10 });
      rotation.value = withSequence(
        withTiming(-10, { duration: 100 }),
        withRepeat(
          withSequence(
            withTiming(10, { duration: 200 }),
            withTiming(-10, { duration: 200 }),
          ),
          2,
          true,
        ),
        withTiming(0, { duration: 100 }),
      );
      confettiScale.value = withSpring(1, { damping: 8 });
    } else {
      scale.value = 0;
      confettiScale.value = 0;
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
  }));

  const confettiStyle = useAnimatedStyle(() => ({
    transform: [{ scale: confettiScale.value }],
  }));

  if (!user) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 items-center justify-center">
        <Animated.View
          style={animatedStyle}
          className="bg-white dark:bg-gray-800 rounded-3xl p-8 mx-6 max-w-sm items-center"
        >
          {/* Confetti */}
          <Animated.View style={confettiStyle} className="absolute top-0">
            <Text className="text-6xl">🎉</Text>
          </Animated.View>

          {/* Study Pal Celebrating */}
          <View className="my-4">
            <StudyPal
              animal={user.studyPalConfig.animal}
              name={user.studyPalConfig.name}
              animationsEnabled={user.studyPalConfig.animationsEnabled}
              size={100}
              mood="celebrating"
            />
          </View>

          {/* Trophy */}
          <View className="bg-amber-100 dark:bg-amber-900/30 rounded-full p-4 mb-4">
            <Ionicons name="trophy" size={48} color="#F59E0B" />
          </View>

          {/* Message */}
          <Text className="text-2xl font-bold text-gray-800 dark:text-gray-100 text-center mb-2">
            Task Completed!
          </Text>
          <Text className="text-base text-gray-600 dark:text-gray-400 text-center mb-6">
            {taskTitle}
          </Text>

          {/* Close Button */}
          <Pressable
            onPress={onClose}
            className="bg-blue-500 rounded-2xl px-8 py-3 w-full"
          >
            <Text className="text-white font-semibold text-center text-lg">
              Awesome!
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default CelebrationModal;
