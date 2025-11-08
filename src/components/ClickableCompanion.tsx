import React from "react";
import { Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import StudyPal from "./StudyPal";
import { StudyPalAnimal, AvatarCustomization } from "../types";
import { RootTabParamList } from "../navigation/BottomTabNavigator";

interface ClickableCompanionProps {
  animal: StudyPalAnimal;
  name: string;
  animationsEnabled?: boolean;
  size?: number;
  showName?: boolean;
  showMessage?: boolean;
  customAvatar?: AvatarCustomization;
  disabled?: boolean;
}

type NavigationProp = BottomTabNavigationProp<RootTabParamList>;

/**
 * ClickableCompanion - A wrapper around StudyPal that opens Settings when tapped
 *
 * This component makes the companion interactive across all pages, providing
 * consistent access to Settings with press animations and smooth transitions.
 * Now navigates to Profile → Settings instead of showing a modal.
 */
const ClickableCompanion: React.FC<ClickableCompanionProps> = ({
  animal,
  name,
  animationsEnabled = false,
  size = 50,
  showName = false,
  showMessage = false,
  customAvatar,
  disabled = false,
}) => {
  const navigation = useNavigation<NavigationProp>();

  const handlePress = () => {
    // Navigate to Profile tab, which will open the ProfileStack
    // Then navigate to Settings within that stack
    navigation.navigate("Profile", {
      screen: "Settings",
    } as any);
  };

  if (disabled) {
    // If disabled, render regular StudyPal without interaction
    return (
      <StudyPal
        animal={animal}
        name={name}
        animationsEnabled={animationsEnabled}
        size={size}
        showName={showName}
        showMessage={showMessage}
        customAvatar={customAvatar}
      />
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.95 : 1 }],
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <StudyPal
        animal={animal}
        name={name}
        animationsEnabled={animationsEnabled}
        size={size}
        showName={showName}
        showMessage={showMessage}
        customAvatar={customAvatar}
      />
    </Pressable>
  );
};

export default ClickableCompanion;
