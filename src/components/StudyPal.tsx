import React, { useEffect } from "react";
import { View, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { StudyPalAnimal, StudyPalMood } from "../types";

interface StudyPalProps {
  animal: StudyPalAnimal;
  name: string;
  animationsEnabled: boolean;
  size?: number;
  message?: string;
  mood?: StudyPalMood;
}

const StudyPal: React.FC<StudyPalProps> = ({
  animal,
  name,
  animationsEnabled,
  size = 80,
  message,
  mood = "neutral",
}) => {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    if (animationsEnabled) {
      // Reset animations
      scale.value = 1;
      rotation.value = 0;
      translateY.value = 0;

      // Mood-based animations override
      if (mood === "celebrating") {
        scale.value = withRepeat(
          withSequence(
            withTiming(1.2, { duration: 300 }),
            withTiming(1, { duration: 300 }),
          ),
          3,
          false,
        );
        rotation.value = withRepeat(
          withSequence(
            withTiming(15, { duration: 150 }),
            withTiming(-15, { duration: 300 }),
            withTiming(0, { duration: 150 }),
          ),
          3,
          false,
        );
        return;
      }

      // Animal-specific animations
      switch (animal) {
        case "cat":
          scale.value = withRepeat(
            withSequence(
              withTiming(1, { duration: 2000 }),
              withTiming(0.9, { duration: 100 }),
              withTiming(1, { duration: 100 }),
            ),
            -1,
            false,
          );
          break;
        case "bunny":
          translateY.value = withRepeat(
            withSequence(
              withTiming(-10, { duration: 300, easing: Easing.out(Easing.ease) }),
              withTiming(0, { duration: 300, easing: Easing.in(Easing.ease) }),
              withTiming(0, { duration: 1000 }),
            ),
            -1,
            false,
          );
          break;
        case "bear":
          rotation.value = withRepeat(
            withSequence(
              withTiming(0, { duration: 1000 }),
              withTiming(15, { duration: 200 }),
              withTiming(-15, { duration: 400 }),
              withTiming(15, { duration: 400 }),
              withTiming(0, { duration: 200 }),
            ),
            -1,
            false,
          );
          break;
        case "dog":
          rotation.value = withRepeat(
            withSequence(
              withTiming(5, { duration: 200 }),
              withTiming(-5, { duration: 200 }),
            ),
            -1,
            true,
          );
          break;
        case "fox":
          rotation.value = withRepeat(
            withSequence(
              withTiming(10, { duration: 1000 }),
              withTiming(0, { duration: 1000 }),
              withTiming(-10, { duration: 1000 }),
              withTiming(0, { duration: 1000 }),
            ),
            -1,
            false,
          );
          break;
        case "panda":
          translateY.value = withRepeat(
            withSequence(
              withTiming(-5, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
              withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
            ),
            -1,
            false,
          );
          break;
        case "koala":
          translateY.value = withRepeat(
            withSequence(
              withTiming(-3, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
              withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
            ),
            -1,
            false,
          );
          break;
        case "owl":
          rotation.value = withRepeat(
            withSequence(
              withTiming(0, { duration: 2000 }),
              withTiming(20, { duration: 300 }),
              withTiming(-20, { duration: 600 }),
              withTiming(0, { duration: 300 }),
            ),
            -1,
            false,
          );
          break;
        case "penguin":
          rotation.value = withRepeat(
            withSequence(
              withTiming(8, { duration: 400 }),
              withTiming(-8, { duration: 400 }),
            ),
            -1,
            true,
          );
          break;
        case "lion":
          scale.value = withRepeat(
            withSequence(
              withTiming(1.1, { duration: 800 }),
              withTiming(1, { duration: 800 }),
            ),
            -1,
            false,
          );
          break;
        case "tiger":
          translateY.value = withRepeat(
            withSequence(
              withTiming(-8, { duration: 400, easing: Easing.out(Easing.ease) }),
              withTiming(0, { duration: 400, easing: Easing.in(Easing.ease) }),
              withTiming(0, { duration: 800 }),
            ),
            -1,
            false,
          );
          break;
        case "monkey":
          translateY.value = withRepeat(
            withSequence(
              withTiming(-12, { duration: 250, easing: Easing.out(Easing.ease) }),
              withTiming(0, { duration: 250, easing: Easing.in(Easing.ease) }),
              withTiming(-8, { duration: 200, easing: Easing.out(Easing.ease) }),
              withTiming(0, { duration: 200, easing: Easing.in(Easing.ease) }),
              withTiming(0, { duration: 600 }),
            ),
            -1,
            false,
          );
          break;
        case "elephant":
          rotation.value = withRepeat(
            withSequence(
              withTiming(5, { duration: 1200 }),
              withTiming(-5, { duration: 1200 }),
            ),
            -1,
            true,
          );
          break;
        case "giraffe":
          translateY.value = withRepeat(
            withSequence(
              withTiming(-6, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
              withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
            ),
            -1,
            false,
          );
          break;
        case "hamster":
          rotation.value = withRepeat(
            withSequence(
              withTiming(10, { duration: 150 }),
              withTiming(-10, { duration: 150 }),
            ),
            -1,
            true,
          );
          break;
        case "raccoon":
          scale.value = withRepeat(
            withSequence(
              withTiming(1, { duration: 1500 }),
              withTiming(0.95, { duration: 100 }),
              withTiming(1, { duration: 100 }),
            ),
            -1,
            false,
          );
          break;
        case "hedgehog":
          translateY.value = withRepeat(
            withSequence(
              withTiming(-4, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
              withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
            ),
            -1,
            false,
          );
          break;
        case "deer":
          translateY.value = withRepeat(
            withSequence(
              withTiming(-7, { duration: 400, easing: Easing.out(Easing.ease) }),
              withTiming(0, { duration: 400, easing: Easing.in(Easing.ease) }),
              withTiming(0, { duration: 1200 }),
            ),
            -1,
            false,
          );
          break;
        case "duck":
          rotation.value = withRepeat(
            withSequence(
              withTiming(6, { duration: 500 }),
              withTiming(-6, { duration: 500 }),
            ),
            -1,
            true,
          );
          break;
        case "frog":
          translateY.value = withRepeat(
            withSequence(
              withTiming(-15, { duration: 250, easing: Easing.out(Easing.ease) }),
              withTiming(0, { duration: 250, easing: Easing.in(Easing.ease) }),
              withTiming(0, { duration: 1500 }),
            ),
            -1,
            false,
          );
          break;
      }
    }
  }, [animal, animationsEnabled, mood]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
      { translateY: translateY.value },
    ],
  }));

  const getAnimalEmoji = (animal: StudyPalAnimal): string => {
    const emojiMap: Record<StudyPalAnimal, string> = {
      cat: "🐱",
      bunny: "🐰",
      bear: "🐻",
      dog: "🐶",
      fox: "🦊",
      panda: "🐼",
      koala: "🐨",
      owl: "🦉",
      penguin: "🐧",
      lion: "🦁",
      tiger: "🐯",
      monkey: "🐵",
      elephant: "🐘",
      giraffe: "🦒",
      hamster: "🐹",
      raccoon: "🦝",
      hedgehog: "🦔",
      deer: "🦌",
      duck: "🦆",
      frog: "🐸",
    };
    return emojiMap[animal] || "🐱";
  };

  const getMoodMessage = (): string => {
    switch (mood) {
      case "happy":
        return "You're doing great!";
      case "focused":
        return "Stay focused!";
      case "celebrating":
        return "Amazing job! 🎉";
      case "relaxed":
        return "Take it easy...";
      default:
        return message || "";
    }
  };

  const displayMessage = message || getMoodMessage();

  // Get background color based on animal type for kawaii styling
  const getAnimalBackgroundColor = (animal: StudyPalAnimal): string => {
    const colorMap: Record<StudyPalAnimal, string> = {
      cat: "#FFE5B4",      // Peach
      bunny: "#FFD4E5",    // Light pink
      bear: "#D4A574",     // Tan
      dog: "#E8D4B8",      // Cream
      fox: "#FFB366",      // Light orange
      panda: "#FFFFFF",    // White
      koala: "#C8C8C8",    // Light gray
      owl: "#D4BF9F",      // Light brown
      penguin: "#E0F4FF",  // Light blue
      lion: "#FFD700",     // Gold
      tiger: "#FFB347",    // Orange
      monkey: "#C8A882",   // Light brown
      elephant: "#B0C4DE", // Light steel blue
      giraffe: "#F4E4C1",  // Cream
      hamster: "#FFE4B5",  // Moccasin
      raccoon: "#A9A9A9",  // Dark gray
      hedgehog: "#D2B48C", // Tan
      deer: "#C8A882",     // Tan
      duck: "#FFEB3B",     // Yellow
      frog: "#90EE90",     // Light green
    };
    return colorMap[animal] || "#FFE5B4";
  };

  return (
    <View className="items-center">
      {/* Kawaii style animal with circular background */}
      <Animated.View
        style={[
          animatedStyle,
          {
            backgroundColor: getAnimalBackgroundColor(animal),
            width: size * 1.4,
            height: size * 1.4,
            borderRadius: size * 0.7,
            justifyContent: "center",
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
            elevation: 4,
          }
        ]}
      >
        <Text style={{ fontSize: size * 0.75 }}>{getAnimalEmoji(animal)}</Text>
      </Animated.View>

      {/* Name label below animal */}
      <Text
        className="text-xs font-semibold mt-2"
        style={{
          color: "#4A4A4A",
          textAlign: "center",
        }}
      >
        {name}
      </Text>

      {displayMessage && (
        <View className="mt-2 rounded-2xl px-4 py-2 max-w-xs" style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}>
          <Text className="text-xs font-semibold" style={{ color: "#666" }}>
            {name} says:
          </Text>
          <Text className="text-sm mt-1" style={{ color: "#333" }}>
            {displayMessage}
          </Text>
        </View>
      )}
    </View>
  );
};

export default StudyPal;
