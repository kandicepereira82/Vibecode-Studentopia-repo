import React, { useEffect } from "react";
import { Modal, View, Text, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withRepeat,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import StudyPal from "./StudyPal";
import useUserStore from "../state/userStore";
import { getTheme } from "../utils/themes";

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
  const theme = getTheme(user?.themeColor);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          style={[animatedStyle, { backgroundColor: theme.cardBackground }]}
          className="rounded-3xl p-8 mx-6 max-w-sm items-center"
        >
          {/* Confetti */}
          <Animated.View style={confettiStyle} className="absolute top-0">
            <Text className="text-6xl">🎉</Text>
          </Animated.View>

          {/* Studentopia Companion Celebrating */}
          <View className="my-4">
            <StudyPal
              animal={user.studyPalConfig.animal}
              name={user.studyPalConfig.name}
              animationsEnabled={false}
              size={100}
              mood="celebrating"
              showName={true}
              showMessage={false}
            />
          </View>

          {/* Trophy */}
          <View className="rounded-full p-4 mb-4" style={{ backgroundColor: theme.secondary + "20" }}>
            <Ionicons name="trophy" size={48} color={theme.secondary} />
          </View>

          {/* Message */}
          <Text className="text-2xl font-bold text-center mb-2" style={{ color: theme.textPrimary }}>
            Task Completed!
          </Text>
          <Text className="text-base text-center mb-6" style={{ color: theme.textSecondary }}>
            {taskTitle}
          </Text>

          {/* Close Button */}
          <Pressable
            onPress={onClose}
            className="rounded-2xl px-8 py-3 w-full"
            style={{ backgroundColor: theme.primary }}
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
