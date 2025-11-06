// StudyPal Component - Displays animated study companion animal
import React, { useEffect } from "react";
import { View, Text, Image } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { StudyPalAnimal, StudyPalMood, AvatarCustomization } from "../types";

interface StudyPalProps {
  animal: StudyPalAnimal;
  name: string;
  animationsEnabled: boolean;
  size?: number;
  message?: string;
  mood?: StudyPalMood;
  showName?: boolean;
  showMessage?: boolean;
  customAvatar?: AvatarCustomization;
}

const StudyPal: React.FC<StudyPalProps> = React.memo(({
  animal,
  name,
  animationsEnabled,
  size = 80,
  message,
  mood = "neutral",
  showName = true,
  showMessage = true,
  customAvatar,
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
        case "redpanda":
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
        case "chipmunk":
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
        case "reindeer":
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
        case "chick":
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
        case "horse":
          translateY.value = withRepeat(
            withSequence(
              withTiming(-10, { duration: 350, easing: Easing.out(Easing.ease) }),
              withTiming(0, { duration: 350, easing: Easing.in(Easing.ease) }),
              withTiming(0, { duration: 1000 }),
            ),
            -1,
            false,
          );
          break;
        case "turtle":
          translateY.value = withRepeat(
            withSequence(
              withTiming(-2, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
              withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
            ),
            -1,
            false,
          );
          break;
        case "pig":
          translateY.value = withRepeat(
            withSequence(
              withTiming(-8, { duration: 350, easing: Easing.out(Easing.ease) }),
              withTiming(0, { duration: 350, easing: Easing.in(Easing.ease) }),
              withTiming(0, { duration: 1100 }),
            ),
            -1,
            false,
          );
          break;
        case "alpaca":
          rotation.value = withRepeat(
            withSequence(
              withTiming(7, { duration: 600 }),
              withTiming(-7, { duration: 600 }),
            ),
            -1,
            true,
          );
          break;
        case "sloth":
          translateY.value = withRepeat(
            withSequence(
              withTiming(-2, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
              withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
            ),
            -1,
            false,
          );
          break;
        case "goldfish":
          rotation.value = withRepeat(
            withSequence(
              withTiming(10, { duration: 700 }),
              withTiming(-10, { duration: 700 }),
            ),
            -1,
            true,
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

  const getAnimalImage = (animal: StudyPalAnimal) => {
    const imageMap: Record<StudyPalAnimal, any> = {
      tiger: require("../../assets/image-1762363413.png"),
      turtle: require("../../assets/image-1762363411.png"),
      sloth: require("../../assets/image-1762363415.png"),
      chipmunk: require("../../assets/image-1762363447.png"),
      reindeer: require("../../assets/image-1762363417.png"),
      hedgehog: require("../../assets/image-1762363434.png"),
      penguin: require("../../assets/image-1762363422.png"),
      monkey: require("../../assets/image-1762363426.png"),
      owl: require("../../assets/image-1762363424.png"),
      chick: require("../../assets/image-1762363449.png"),
      lion: require("../../assets/image-1762363428.png"),
      horse: require("../../assets/image-1762363432.png"),
      koala: require("../../assets/image-1762363431.png"),
      hamster: require("../../assets/image-1762363420.png"),
      giraffe: require("../../assets/image-1762363438.png"),
      frog: require("../../assets/image-1762363440.png"),
      alpaca: require("../../assets/image-1762363456.png"),
      goldfish: require("../../assets/image-1762363442.png"),
      dog: require("../../assets/image-1762363445.png"),
      bunny: require("../../assets/image-1762363453.png"),
      cat: require("../../assets/image-1762363451.png"),
      bear: require("../../assets/image-1762363455.png"),
      elephant: require("../../assets/image-1762363444.png"),
      redpanda: require("../../assets/image-1762363418.png"),
      pig: require("../../assets/image-1762363420.png"),
    };
    return imageMap[animal] || imageMap.cat;
  };

  const getAnimalEmoji = (animal: StudyPalAnimal): string => {
    const emojiMap: Record<StudyPalAnimal, string> = {
      cat: "🐱",
      redpanda: "🦊",
      owl: "🦉",
      penguin: "🐧",
      horse: "🐴",
      dog: "🐶",
      chick: "🐥",
      bear: "🐻",
      hedgehog: "🦔",
      tiger: "🐯",
      turtle: "🐢",
      bunny: "🐰",
      giraffe: "🦒",
      pig: "🐷",
      alpaca: "🦙",
      lion: "🦁",
      frog: "🐸",
      koala: "🐨",
      sloth: "🦥",
      monkey: "🐵",
      hamster: "🐹",
      reindeer: "🦌",
      chipmunk: "🐿️",
      elephant: "🐘",
      goldfish: "🐠",
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

  // Get fur color from avatar customization
  const getFurColorTint = (): string | undefined => {
    if (!customAvatar?.furColor) return undefined;

    const furColorMap: Record<string, string> = {
      natural: "#D97706",
      light: "#FDE68A",
      dark: "#78350F",
      grey: "#6B7280",
      white: "#F3F4F6",
      cream: "#FEF3C7",
      golden: "#F59E0B",
      chocolate: "#7C2D12",
      red: "#EF4444",
      pink: "#EC4899",
      blue: "#3B82F6",
      yellow: "#FBBF24",
      green: "#10B981",
      orange: "#F97316",
      purple: "#A855F7",
      cyan: "#06B6D4",
    };

    return furColorMap[customAvatar.furColor];
  };

  // Get background color based on animal type for kawaii styling
  const getAnimalBackgroundColor = (animal: StudyPalAnimal): string => {
    // If custom fur color, use that
    const customFurColor = getFurColorTint();
    if (customFurColor) return customFurColor;

    const colorMap: Record<StudyPalAnimal, string> = {
      cat: "#FFE5B4",      // Peach
      redpanda: "#FFB366", // Light orange
      owl: "#D4BF9F",      // Light brown
      penguin: "#E0F4FF",  // Light blue
      horse: "#E8D4B8",    // Cream
      dog: "#E8D4B8",      // Cream
      chick: "#FFEB3B",    // Yellow
      bear: "#D4A574",     // Tan
      hedgehog: "#D2B48C", // Tan
      tiger: "#FFB347",    // Orange
      turtle: "#90EE90",   // Light green
      bunny: "#FFD4E5",    // Light pink
      giraffe: "#F4E4C1",  // Cream
      pig: "#FFC0CB",      // Pink
      alpaca: "#F4E4C1",   // Cream
      lion: "#FFD700",     // Gold
      frog: "#90EE90",     // Light green
      koala: "#C8C8C8",    // Light gray
      sloth: "#C8A882",    // Light brown
      monkey: "#C8A882",   // Light brown
      hamster: "#FFE4B5",  // Moccasin
      reindeer: "#C8A882", // Tan
      chipmunk: "#D2B48C", // Tan
      elephant: "#B0C4DE", // Light steel blue
      goldfish: "#FFA500", // Orange
    };
    return colorMap[animal] || "#FFE5B4";
  };

  // Get outfit emoji
  const getOutfitEmoji = (): string | null => {
    if (!customAvatar?.outfit) return null;

    const outfitMap: Record<string, string> = {
      casual: "👕",
      formal: "👔",
      sporty: "🏃",
      cozy: "🧶",
      hoodie: "🧥",
      sweater: "🧵",
      uniform: "🎓",
    };

    return outfitMap[customAvatar.outfit] || null;
  };

  // Get accessory emoji
  const getAccessoryEmoji = (): string | null => {
    if (!customAvatar?.accessory || customAvatar.accessory === "none") return null;

    const accessoryMap: Record<string, string> = {
      backpack: "🎒",
      book: "📚",
      pencil: "✏️",
      scarf: "🧣",
      hat: "🎩",
      bowtie: "🎀",
    };

    return accessoryMap[customAvatar.accessory] || null;
  };

  // Get hair emoji
  const getHairEmoji = (): string | null => {
    if (!customAvatar?.hairStyle || customAvatar.hairStyle === "none") return null;

    const hairMap: Record<string, string> = {
      short: "✂️",
      long: "💇",
      curly: "🌀",
      spiky: "⚡",
      ponytail: "🎀",
      bun: "🍔",
    };

    return hairMap[customAvatar.hairStyle] || null;
  };

  return (
    <View className="items-center">
      {/* Kawaii style animal with circular background */}
      <View style={{ position: "relative" }}>
        {animationsEnabled ? (
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
            <Image
              source={getAnimalImage(animal)}
              style={{ width: size, height: size }}
              resizeMode="contain"
            />
          </Animated.View>
        ) : (
          <View
            style={{
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
            }}
          >
            <Image
              source={getAnimalImage(animal)}
              style={{ width: size, height: size }}
              resizeMode="contain"
            />
          </View>
        )}

        {/* Avatar Customization Overlays */}
        {customAvatar && (
          <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" }}>
            {/* Hair on top */}
            {getHairEmoji() && (
              <Text style={{ position: "absolute", top: size * -0.15, fontSize: size * 0.4, zIndex: 10 }}>
                {getHairEmoji()}
              </Text>
            )}

            {/* Glasses in middle */}
            {customAvatar.glasses && (
              <Text style={{ position: "absolute", top: size * 0.3, fontSize: size * 0.45, zIndex: 5 }}>
                👓
              </Text>
            )}

            {/* Headphones on top */}
            {customAvatar.headphones && (
              <Text style={{ position: "absolute", top: size * 0.05, fontSize: size * 0.55, zIndex: 8 }}>
                🎧
              </Text>
            )}

            {/* Outfit at bottom center */}
            {getOutfitEmoji() && (
              <Text style={{ position: "absolute", bottom: size * 0.1, fontSize: size * 0.4, zIndex: 3 }}>
                {getOutfitEmoji()}
              </Text>
            )}

            {/* Accessory on the side */}
            {getAccessoryEmoji() && (
              <Text style={{ position: "absolute", bottom: size * 0.15, right: size * -0.1, fontSize: size * 0.35, zIndex: 4 }}>
                {getAccessoryEmoji()}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Name label below animal */}
      {showName && (
        <Text
          className="text-xs font-semibold mt-2"
          style={{
            color: "#4A4A4A",
            textAlign: "center",
          }}
        >
          {name}
        </Text>
      )}

      {showMessage && displayMessage && (
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
});

StudyPal.displayName = 'StudyPal';

export default StudyPal;
