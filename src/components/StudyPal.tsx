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
import { ANIMAL_IMAGE_CACHE } from "../utils/animalImageCache";

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animal, animationsEnabled, mood]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
      { translateY: translateY.value },
    ],
  }));

  const getAnimalImage = (animal: StudyPalAnimal) => {
    return ANIMAL_IMAGE_CACHE[animal] || ANIMAL_IMAGE_CACHE.cat;
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
    // If custom background color is set, use that first
    if (customAvatar?.backgroundColor && customAvatar.backgroundColor !== "none") {
      const backgroundColorMap: Record<string, string> = {
        red: "#FF4444",
        blue: "#4A90E2",
        yellow: "#FFD93D",
        green: "#6BCF7F",
        pink: "#FF69B4",
        purple: "#9B59B6",
        orange: "#FF8C42",
        teal: "#20B2AA",
        cyan: "#00CED1",
        magenta: "#E91E63",
        lavender: "#E6E6FA",
        gold: "#FFD700",
        coral: "#FF7F50",
        lime: "#BFFF00",
        peach: "#FFDAB9",
        navy: "#1E3A8A",
        turquoise: "#40E0D0",
        violet: "#8B5CF6",
        mint: "#98FF98",
        amber: "#FFBF00",
        rose: "#FF66B2",
        beige: "#F5F5DC",
        chocolate: "#8B4513",
        grey: "#9CA3AF",
      };
      const customBgColor = backgroundColorMap[customAvatar.backgroundColor];
      if (customBgColor) return customBgColor;
    }

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
      duck: "#FFEB3B",     // Yellow
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
      shark: "#4682B4",    // Steel blue
      wolf: "#808080",     // Gray
      zebra: "#F0F0F0",    // Light gray with black stripes
      snake: "#8FBC8F",    // Dark sea green
      rooster: "#DC143C",  // Crimson red
      otter: "#8B4513",    // Saddle brown
      lovebird: "#00CED1", // Dark turquoise
      lizard: "#9ACD32",   // Yellow green
      dinosaur: "#556B2F", // Dark olive green
      arcticfox: "#FFFFFF", // White
    };
    return colorMap[animal] || "#FFE5B4";
  };

  // Get outfit emoji
  const getOutfitEmoji = (): string | null => {
    if (!customAvatar?.outfit || customAvatar.outfit === "none") return null;

    const outfitMap: Record<string, string> = {
      study_hoodie: "🧥",
      cozy_sweater: "🧶",
      academic_robe: "🎓",
      sporty_tracksuit: "🏃",
      exam_power: "💼",
      sleepy_pyjamas: "🌙",
      raincoat: "☔",
      focus_tee: "👕",
      adventure: "🎒",
      meditation_robe: "🧘",
    };

    return outfitMap[customAvatar.outfit] || null;
  };

  // Get accessory emoji
  const getAccessoryEmoji = (): string | null => {
    if (!customAvatar?.accessory || customAvatar.accessory === "none") return null;

    const accessoryMap: Record<string, string> = {
      backpack: "🎒",
      book: "📚",
      pencil: "🖊️",
      water: "🎙️",
      plant: "🪴",
      study_pet: "🎋",
      knitting: "🧶",
      stars: "⭐",
      paws: "🐾",
      leaf: "🍃",
      flower: "🌸",
      football: "⚽",
      basketball: "🏀",
      speaker: "🔊",
      paint: "🎨",
      smiley: "😊",
      dancing: "💃🕺",
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

  // Animal-specific positioning for customizations
  const getAnimalPositioning = () => {
    // Different animals have different proportions
    const positionMap: Record<StudyPalAnimal, {
      hairTop: number;
      hairSize: number;
      glassesTop: number;
      glassesSize: number;
      headphonesTop: number;
      headphonesSize: number;
      outfitBottom: number;
      outfitSize: number;
      accessoryBottom: number;
      accessoryRight: number;
      accessorySize: number;
    }> = {
      // Tall animals - giraffe, horse, reindeer
      giraffe: {
        hairTop: -0.25,
        hairSize: 0.35,
        glassesTop: 0.15,
        glassesSize: 0.4,
        headphonesTop: -0.05,
        headphonesSize: 0.5,
        outfitBottom: 0.15,
        outfitSize: 0.45,
        accessoryBottom: 0.2,
        accessoryRight: -0.15,
        accessorySize: 0.3,
      },
      horse: {
        hairTop: -0.2,
        hairSize: 0.4,
        glassesTop: 0.25,
        glassesSize: 0.45,
        headphonesTop: 0.0,
        headphonesSize: 0.55,
        outfitBottom: 0.12,
        outfitSize: 0.4,
        accessoryBottom: 0.18,
        accessoryRight: -0.12,
        accessorySize: 0.32,
      },
      reindeer: {
        hairTop: -0.22,
        hairSize: 0.38,
        glassesTop: 0.2,
        glassesSize: 0.42,
        headphonesTop: -0.02,
        headphonesSize: 0.52,
        outfitBottom: 0.13,
        outfitSize: 0.42,
        accessoryBottom: 0.19,
        accessoryRight: -0.13,
        accessorySize: 0.31,
      },
      // Large animals - bear, elephant, lion, tiger
      bear: {
        hairTop: -0.15,
        hairSize: 0.42,
        glassesTop: 0.3,
        glassesSize: 0.48,
        headphonesTop: 0.05,
        headphonesSize: 0.58,
        outfitBottom: 0.08,
        outfitSize: 0.45,
        accessoryBottom: 0.12,
        accessoryRight: -0.08,
        accessorySize: 0.35,
      },
      elephant: {
        hairTop: -0.18,
        hairSize: 0.4,
        glassesTop: 0.28,
        glassesSize: 0.5,
        headphonesTop: 0.03,
        headphonesSize: 0.6,
        outfitBottom: 0.1,
        outfitSize: 0.48,
        accessoryBottom: 0.15,
        accessoryRight: -0.1,
        accessorySize: 0.36,
      },
      lion: {
        hairTop: -0.15,
        hairSize: 0.4,
        glassesTop: 0.3,
        glassesSize: 0.45,
        headphonesTop: 0.05,
        headphonesSize: 0.55,
        outfitBottom: 0.1,
        outfitSize: 0.4,
        accessoryBottom: 0.15,
        accessoryRight: -0.1,
        accessorySize: 0.33,
      },
      tiger: {
        hairTop: -0.15,
        hairSize: 0.4,
        glassesTop: 0.3,
        glassesSize: 0.45,
        headphonesTop: 0.05,
        headphonesSize: 0.55,
        outfitBottom: 0.1,
        outfitSize: 0.4,
        accessoryBottom: 0.15,
        accessoryRight: -0.1,
        accessorySize: 0.33,
      },
      // Medium animals - cat, dog, bunny, redpanda, koala, monkey, alpaca, pig
      cat: {
        hairTop: -0.15,
        hairSize: 0.4,
        glassesTop: 0.3,
        glassesSize: 0.45,
        headphonesTop: 0.05,
        headphonesSize: 0.55,
        outfitBottom: 0.1,
        outfitSize: 0.4,
        accessoryBottom: 0.15,
        accessoryRight: -0.1,
        accessorySize: 0.35,
      },
      dog: {
        hairTop: -0.15,
        hairSize: 0.4,
        glassesTop: 0.3,
        glassesSize: 0.45,
        headphonesTop: 0.05,
        headphonesSize: 0.55,
        outfitBottom: 0.1,
        outfitSize: 0.4,
        accessoryBottom: 0.15,
        accessoryRight: -0.1,
        accessorySize: 0.35,
      },
      bunny: {
        hairTop: -0.2,
        hairSize: 0.38,
        glassesTop: 0.28,
        glassesSize: 0.43,
        headphonesTop: 0.0,
        headphonesSize: 0.53,
        outfitBottom: 0.12,
        outfitSize: 0.38,
        accessoryBottom: 0.17,
        accessoryRight: -0.12,
        accessorySize: 0.33,
      },
      redpanda: {
        hairTop: -0.15,
        hairSize: 0.4,
        glassesTop: 0.3,
        glassesSize: 0.45,
        headphonesTop: 0.05,
        headphonesSize: 0.55,
        outfitBottom: 0.1,
        outfitSize: 0.4,
        accessoryBottom: 0.15,
        accessoryRight: -0.1,
        accessorySize: 0.35,
      },
      koala: {
        hairTop: -0.15,
        hairSize: 0.4,
        glassesTop: 0.3,
        glassesSize: 0.45,
        headphonesTop: 0.05,
        headphonesSize: 0.55,
        outfitBottom: 0.1,
        outfitSize: 0.4,
        accessoryBottom: 0.15,
        accessoryRight: -0.1,
        accessorySize: 0.35,
      },
      monkey: {
        hairTop: -0.15,
        hairSize: 0.4,
        glassesTop: 0.3,
        glassesSize: 0.45,
        headphonesTop: 0.05,
        headphonesSize: 0.55,
        outfitBottom: 0.1,
        outfitSize: 0.4,
        accessoryBottom: 0.15,
        accessoryRight: -0.1,
        accessorySize: 0.35,
      },
      alpaca: {
        hairTop: -0.18,
        hairSize: 0.38,
        glassesTop: 0.25,
        glassesSize: 0.43,
        headphonesTop: 0.02,
        headphonesSize: 0.53,
        outfitBottom: 0.12,
        outfitSize: 0.42,
        accessoryBottom: 0.17,
        accessoryRight: -0.12,
        accessorySize: 0.33,
      },
      pig: {
        hairTop: -0.15,
        hairSize: 0.4,
        glassesTop: 0.3,
        glassesSize: 0.45,
        headphonesTop: 0.05,
        headphonesSize: 0.55,
        outfitBottom: 0.1,
        outfitSize: 0.4,
        accessoryBottom: 0.15,
        accessoryRight: -0.1,
        accessorySize: 0.35,
      },
      // Small animals - hamster, hedgehog, chipmunk, duck, frog, turtle, sloth
      hamster: {
        hairTop: -0.12,
        hairSize: 0.42,
        glassesTop: 0.32,
        glassesSize: 0.47,
        headphonesTop: 0.08,
        headphonesSize: 0.57,
        outfitBottom: 0.08,
        outfitSize: 0.42,
        accessoryBottom: 0.13,
        accessoryRight: -0.08,
        accessorySize: 0.37,
      },
      hedgehog: {
        hairTop: -0.12,
        hairSize: 0.42,
        glassesTop: 0.32,
        glassesSize: 0.47,
        headphonesTop: 0.08,
        headphonesSize: 0.57,
        outfitBottom: 0.08,
        outfitSize: 0.42,
        accessoryBottom: 0.13,
        accessoryRight: -0.08,
        accessorySize: 0.37,
      },
      chipmunk: {
        hairTop: -0.12,
        hairSize: 0.42,
        glassesTop: 0.32,
        glassesSize: 0.47,
        headphonesTop: 0.08,
        headphonesSize: 0.57,
        outfitBottom: 0.08,
        outfitSize: 0.42,
        accessoryBottom: 0.13,
        accessoryRight: -0.08,
        accessorySize: 0.37,
      },
      duck: {
        hairTop: -0.12,
        hairSize: 0.42,
        glassesTop: 0.32,
        glassesSize: 0.47,
        headphonesTop: 0.08,
        headphonesSize: 0.57,
        outfitBottom: 0.08,
        outfitSize: 0.42,
        accessoryBottom: 0.13,
        accessoryRight: -0.08,
        accessorySize: 0.37,
      },
      frog: {
        hairTop: -0.12,
        hairSize: 0.42,
        glassesTop: 0.32,
        glassesSize: 0.47,
        headphonesTop: 0.08,
        headphonesSize: 0.57,
        outfitBottom: 0.08,
        outfitSize: 0.42,
        accessoryBottom: 0.13,
        accessoryRight: -0.08,
        accessorySize: 0.37,
      },
      turtle: {
        hairTop: -0.12,
        hairSize: 0.42,
        glassesTop: 0.32,
        glassesSize: 0.47,
        headphonesTop: 0.08,
        headphonesSize: 0.57,
        outfitBottom: 0.08,
        outfitSize: 0.42,
        accessoryBottom: 0.13,
        accessoryRight: -0.08,
        accessorySize: 0.37,
      },
      sloth: {
        hairTop: -0.15,
        hairSize: 0.4,
        glassesTop: 0.3,
        glassesSize: 0.45,
        headphonesTop: 0.05,
        headphonesSize: 0.55,
        outfitBottom: 0.1,
        outfitSize: 0.4,
        accessoryBottom: 0.15,
        accessoryRight: -0.1,
        accessorySize: 0.35,
      },
      // Bird animals - owl, penguin
      owl: {
        hairTop: -0.15,
        hairSize: 0.4,
        glassesTop: 0.3,
        glassesSize: 0.45,
        headphonesTop: 0.05,
        headphonesSize: 0.55,
        outfitBottom: 0.1,
        outfitSize: 0.4,
        accessoryBottom: 0.15,
        accessoryRight: -0.1,
        accessorySize: 0.35,
      },
      penguin: {
        hairTop: -0.15,
        hairSize: 0.4,
        glassesTop: 0.3,
        glassesSize: 0.45,
        headphonesTop: 0.05,
        headphonesSize: 0.55,
        outfitBottom: 0.1,
        outfitSize: 0.4,
        accessoryBottom: 0.15,
        accessoryRight: -0.1,
        accessorySize: 0.35,
      },
      // Fish
      goldfish: {
        hairTop: -0.12,
        hairSize: 0.42,
        glassesTop: 0.32,
        glassesSize: 0.47,
        headphonesTop: 0.08,
        headphonesSize: 0.57,
        outfitBottom: 0.08,
        outfitSize: 0.42,
        accessoryBottom: 0.13,
        accessoryRight: -0.08,
        accessorySize: 0.37,
      },
      shark: {
        hairTop: -0.12,
        hairSize: 0.42,
        glassesTop: 0.32,
        glassesSize: 0.47,
        headphonesTop: 0.08,
        headphonesSize: 0.57,
        outfitBottom: 0.08,
        outfitSize: 0.42,
        accessoryBottom: 0.13,
        accessoryRight: -0.08,
        accessorySize: 0.37,
      },
      wolf: {
        hairTop: -0.15,
        hairSize: 0.4,
        glassesTop: 0.3,
        glassesSize: 0.45,
        headphonesTop: 0.05,
        headphonesSize: 0.55,
        outfitBottom: 0.1,
        outfitSize: 0.4,
        accessoryBottom: 0.15,
        accessoryRight: -0.1,
        accessorySize: 0.35,
      },
      // New animals
      zebra: {
        hairTop: -0.2,
        hairSize: 0.4,
        glassesTop: 0.25,
        glassesSize: 0.45,
        headphonesTop: 0.0,
        headphonesSize: 0.55,
        outfitBottom: 0.12,
        outfitSize: 0.4,
        accessoryBottom: 0.18,
        accessoryRight: -0.12,
        accessorySize: 0.32,
      },
      snake: {
        hairTop: -0.12,
        hairSize: 0.42,
        glassesTop: 0.32,
        glassesSize: 0.47,
        headphonesTop: 0.08,
        headphonesSize: 0.57,
        outfitBottom: 0.08,
        outfitSize: 0.42,
        accessoryBottom: 0.13,
        accessoryRight: -0.08,
        accessorySize: 0.37,
      },
      rooster: {
        hairTop: -0.15,
        hairSize: 0.4,
        glassesTop: 0.3,
        glassesSize: 0.45,
        headphonesTop: 0.05,
        headphonesSize: 0.55,
        outfitBottom: 0.1,
        outfitSize: 0.4,
        accessoryBottom: 0.15,
        accessoryRight: -0.1,
        accessorySize: 0.35,
      },
      otter: {
        hairTop: -0.15,
        hairSize: 0.4,
        glassesTop: 0.3,
        glassesSize: 0.45,
        headphonesTop: 0.05,
        headphonesSize: 0.55,
        outfitBottom: 0.1,
        outfitSize: 0.4,
        accessoryBottom: 0.15,
        accessoryRight: -0.1,
        accessorySize: 0.35,
      },
      lovebird: {
        hairTop: -0.12,
        hairSize: 0.42,
        glassesTop: 0.32,
        glassesSize: 0.47,
        headphonesTop: 0.08,
        headphonesSize: 0.57,
        outfitBottom: 0.08,
        outfitSize: 0.42,
        accessoryBottom: 0.13,
        accessoryRight: -0.08,
        accessorySize: 0.37,
      },
      lizard: {
        hairTop: -0.12,
        hairSize: 0.42,
        glassesTop: 0.32,
        glassesSize: 0.47,
        headphonesTop: 0.08,
        headphonesSize: 0.57,
        outfitBottom: 0.08,
        outfitSize: 0.42,
        accessoryBottom: 0.13,
        accessoryRight: -0.08,
        accessorySize: 0.37,
      },
      dinosaur: {
        hairTop: -0.18,
        hairSize: 0.4,
        glassesTop: 0.28,
        glassesSize: 0.5,
        headphonesTop: 0.03,
        headphonesSize: 0.6,
        outfitBottom: 0.1,
        outfitSize: 0.48,
        accessoryBottom: 0.15,
        accessoryRight: -0.1,
        accessorySize: 0.36,
      },
      arcticfox: {
        hairTop: -0.15,
        hairSize: 0.4,
        glassesTop: 0.3,
        glassesSize: 0.45,
        headphonesTop: 0.05,
        headphonesSize: 0.55,
        outfitBottom: 0.1,
        outfitSize: 0.4,
        accessoryBottom: 0.15,
        accessoryRight: -0.1,
        accessorySize: 0.35,
      },
    };

    return positionMap[animal] || positionMap.cat; // Default to cat proportions
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
              fadeDuration={0}
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
              fadeDuration={0}
            />
          </View>
        )}

        {/* Avatar Customization Overlays */}
        {customAvatar && (() => {
          const positioning = getAnimalPositioning();
          return (
            <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" }}>
              {/* Hair on top */}
              {getHairEmoji() && (
                <Text style={{
                  position: "absolute",
                  top: size * positioning.hairTop,
                  fontSize: size * positioning.hairSize,
                  zIndex: 10
                }}>
                  {getHairEmoji()}
                </Text>
              )}

              {/* Glasses in middle */}
              {customAvatar.glasses && (
                <Text style={{
                  position: "absolute",
                  top: size * positioning.glassesTop,
                  fontSize: size * positioning.glassesSize,
                  zIndex: 6
                }}>
                  👓
                </Text>
              )}

              {/* Headphones over head */}
              {customAvatar.headphones && (
                <Text style={{
                  position: "absolute",
                  top: size * positioning.headphonesTop,
                  fontSize: size * positioning.headphonesSize,
                  zIndex: 8
                }}>
                  🎧
                </Text>
              )}

              {/* Outfit at bottom center */}
              {getOutfitEmoji() && (
                <Text style={{
                  position: "absolute",
                  bottom: size * positioning.outfitBottom,
                  fontSize: size * positioning.outfitSize,
                  zIndex: 3
                }}>
                  {getOutfitEmoji()}
                </Text>
              )}

              {/* Accessory on the side */}
              {getAccessoryEmoji() && (
                <Text style={{
                  position: "absolute",
                  bottom: size * positioning.accessoryBottom,
                  right: size * positioning.accessoryRight,
                  fontSize: size * positioning.accessorySize,
                  zIndex: 4
                }}>
                  {getAccessoryEmoji()}
                </Text>
              )}
            </View>
          );
        })()}
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
