import React, { useState } from "react";
import { Pressable, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import StudyPal from "./StudyPal";
import SettingsScreen from "../screens/SettingsScreen";
import { StudyPalAnimal, AvatarCustomization } from "../types";
import { Ionicons } from "@expo/vector-icons";
import { View, Text } from "react-native";

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

/**
 * ClickableCompanion - A wrapper around StudyPal that opens Settings when tapped
 *
 * This component makes the companion interactive across all pages, providing
 * consistent access to Settings with press animations and smooth transitions.
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
  const [showSettings, setShowSettings] = useState(false);

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
    <>
      <Pressable
        onPress={() => setShowSettings(true)}
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

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSettings(false)}
      >
        <SettingsScreen />
        <SafeAreaView edges={["bottom"]}>
          <Pressable
            onPress={() => setShowSettings(false)}
            style={{
              marginHorizontal: 24,
              marginBottom: 16,
              backgroundColor: "#3B82F6",
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontWeight: "600", fontSize: 16 }}>
              Close
            </Text>
          </Pressable>
        </SafeAreaView>
      </Modal>
    </>
  );
};

export default ClickableCompanion;
