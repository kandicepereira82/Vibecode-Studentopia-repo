import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, Modal, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { AvatarCustomization, StudyPalAnimal, ThemeColor } from "../types";
import { getTheme } from "../utils/themes";
import StudyPal from "./StudyPal";

interface AvatarCreatorProps {
  visible: boolean;
  onClose: () => void;
  currentAnimal: StudyPalAnimal;
  currentAvatar?: AvatarCustomization;
  currentTheme: ThemeColor;
  onSave: (avatar: AvatarCustomization) => void;
}

const HAIR_STYLES = [
  { id: "none", name: "None", emoji: "🚫" },
  { id: "short", name: "Short", emoji: "✂️" },
  { id: "long", name: "Long", emoji: "💇" },
  { id: "curly", name: "Curly", emoji: "🌀" },
  { id: "spiky", name: "Spiky", emoji: "⚡" },
  { id: "ponytail", name: "Ponytail", emoji: "🎀" },
  { id: "bun", name: "Bun", emoji: "🍔" },
];

const HAIR_COLORS = [
  { id: "black", name: "Black", color: "#1F2937" },
  { id: "brown", name: "Brown", color: "#92400E" },
  { id: "blonde", name: "Blonde", color: "#FCD34D" },
  { id: "red", name: "Red", color: "#DC2626" },
  { id: "blue", name: "Blue", color: "#3B82F6" },
  { id: "pink", name: "Pink", color: "#EC4899" },
  { id: "purple", name: "Purple", color: "#9333EA" },
  { id: "green", name: "Green", color: "#10B981" },
];

const FUR_COLORS = [
  { id: "natural", name: "Natural", color: "#D97706" },
  { id: "light", name: "Light", color: "#FDE68A" },
  { id: "dark", name: "Dark", color: "#78350F" },
  { id: "grey", name: "Grey", color: "#6B7280" },
  { id: "white", name: "White", color: "#F3F4F6" },
  { id: "cream", name: "Cream", color: "#FEF3C7" },
  { id: "golden", name: "Golden", color: "#F59E0B" },
  { id: "chocolate", name: "Chocolate", color: "#7C2D12" },
  // Primary Colors
  { id: "red", name: "Red", color: "#EF4444" },
  { id: "pink", name: "Pink", color: "#EC4899" },
  { id: "blue", name: "Blue", color: "#3B82F6" },
  { id: "yellow", name: "Yellow", color: "#FBBF24" },
  { id: "green", name: "Green", color: "#10B981" },
  { id: "orange", name: "Orange", color: "#F97316" },
  { id: "purple", name: "Purple", color: "#A855F7" },
  { id: "cyan", name: "Cyan", color: "#06B6D4" },
];

const OUTFITS = [
  { id: "none", name: "None", emoji: "🚫" },
  { id: "study_hoodie", name: "Study Hoodie", emoji: "🧥" },
  { id: "cozy_sweater", name: "Cosy Sweater", emoji: "🧶" },
  { id: "academic_robe", name: "Academic Robe", emoji: "🎓" },
  { id: "sporty_tracksuit", name: "Sporty Tracksuit", emoji: "🏃" },
  { id: "exam_power", name: "Exam Power Outfit", emoji: "💼" },
  { id: "sleepy_pyjamas", name: "Sleepy Pyjamas", emoji: "🌙" },
  { id: "raincoat", name: "Raincoat", emoji: "☔" },
  { id: "focus_tee", name: "Focus Mode Tee", emoji: "👕" },
  { id: "adventure", name: "Adventure Outfit", emoji: "🎒" },
  { id: "meditation_robe", name: "Mindful Meditation Robe", emoji: "🧘" },
];

const BACKGROUND_COLORS = [
  { id: "none", name: "None", color: "#FFFFFF" },
  { id: "soft_pink", name: "Soft Pink", color: "#FFC0CB" },
  { id: "lavender", name: "Lavender", color: "#E6E6FA" },
  { id: "mint", name: "Mint", color: "#B2F5EA" },
  { id: "peach", name: "Peach", color: "#FFDAB9" },
  { id: "sky_blue", name: "Sky Blue", color: "#87CEEB" },
  { id: "lemon", name: "Lemon", color: "#FFF68F" },
  { id: "coral", name: "Coral", color: "#FF7F50" },
  { id: "lilac", name: "Lilac", color: "#DDA0DD" },
  { id: "aqua", name: "Aqua", color: "#7FDBFF" },
  { id: "cream", name: "Cream", color: "#FFF8DC" },
  { id: "rose", name: "Rose", color: "#FFB6C1" },
  { id: "sage", name: "Sage", color: "#C3E6CB" },
  { id: "butter", name: "Butter", color: "#FFFACD" },
  { id: "periwinkle", name: "Periwinkle", color: "#CCCCFF" },
  { id: "apricot", name: "Apricot", color: "#FBCEB1" },
  { id: "powder_blue", name: "Powder Blue", color: "#B0E0E6" },
  { id: "champagne", name: "Champagne", color: "#F7E7CE" },
];

const ACCESSORIES = [
  { id: "none", name: "None", emoji: "🚫" },
  { id: "backpack", name: "Backpack", emoji: "🎒" },
  { id: "book", name: "Books", emoji: "📚" },
  { id: "pencil", name: "Pen", emoji: "✏️" },
  { id: "water", name: "Water Bottle", emoji: "💧" },
  { id: "plant", name: "Study Plant", emoji: "🪴" },
  { id: "study_pet", name: "Smaller Study Pet", emoji: "🐹" },
  { id: "knitting", name: "Knitting Yarn", emoji: "🧶" },
  { id: "stars", name: "Stars", emoji: "⭐" },
  { id: "paws", name: "Paws", emoji: "🐾" },
  { id: "leaf", name: "Leaf", emoji: "🍃" },
  { id: "flower", name: "Flower", emoji: "🌸" },
  { id: "football", name: "Football", emoji: "⚽" },
  { id: "basketball", name: "Basketball", emoji: "🏀" },
  { id: "speaker", name: "Music Speaker", emoji: "🔊" },
  { id: "paint", name: "Paint Paddle", emoji: "🎨" },
];

const AvatarCreator: React.FC<AvatarCreatorProps> = ({
  visible,
  onClose,
  currentAnimal,
  currentAvatar = {},
  currentTheme,
  onSave,
}) => {
  const theme = getTheme(currentTheme);
  const [activeTab, setActiveTab] = useState<"background" | "accessories">("background");

  const [avatar, setAvatar] = useState<AvatarCustomization>({
    hairStyle: currentAvatar.hairStyle || "none",
    hairColor: currentAvatar.hairColor || "brown",
    furColor: currentAvatar.furColor || "natural",
    outfit: currentAvatar.outfit || "none",
    accessory: currentAvatar.accessory || "none",
    backgroundColor: currentAvatar.backgroundColor || "none",
    glasses: currentAvatar.glasses || false,
    headphones: currentAvatar.headphones || false,
  });

  const handleSave = () => {
    onSave(avatar);
    onClose();
  };

  const handleReset = () => {
    setAvatar({
      hairStyle: "none",
      hairColor: "brown",
      furColor: "natural",
      outfit: "none",
      accessory: "none",
      backgroundColor: "none",
      glasses: false,
      headphones: false,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: theme.backgroundGradient[0] }}>
        <LinearGradient
          colors={[theme.backgroundGradient[0], theme.backgroundGradient[1]]}
          style={{ flex: 1 }}
        >
          {/* Header */}
          <View style={{
            paddingHorizontal: 24,
            paddingTop: 60,
            paddingBottom: 20,
            borderBottomWidth: 1,
            borderBottomColor: theme.textSecondary + "20"
          }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 28, fontFamily: "Poppins_700Bold", color: theme.textPrimary }}>
                  Companion Customisation
                </Text>
                <Text style={{ fontSize: 14, fontFamily: "Poppins_400Regular", color: theme.textSecondary, marginTop: 4 }}>
                  Customise your studentopia companion
                </Text>
              </View>
              <Pressable
                onPress={onClose}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "white",
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Ionicons name="close" size={24} color={theme.textPrimary} />
              </Pressable>
            </View>
          </View>

          {/* Preview */}
          <View style={{
            paddingVertical: 32,
            alignItems: "center",
            backgroundColor: "white",
            marginHorizontal: 24,
            marginTop: 20,
            borderRadius: 24,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 5,
          }}>
            <Text style={{ fontSize: 16, fontFamily: "Poppins_600SemiBold", color: theme.textSecondary, marginBottom: 16 }}>
              Preview
            </Text>
            <StudyPal
              animal={currentAnimal}
              name=""
              animationsEnabled={false}
              size={120}
              showName={false}
              showMessage={false}
              customAvatar={avatar}
            />
          </View>

          {/* Tabs */}
          <View style={{ paddingHorizontal: 24, paddingVertical: 16 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {(["background", "accessories"] as const).map((tab) => (
                <Pressable
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={{
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    borderRadius: 16,
                    backgroundColor: activeTab === tab ? theme.primary : "white",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                    elevation: 1,
                  }}
                >
                  <Text style={{
                    fontFamily: "Poppins_600SemiBold",
                    fontSize: 14,
                    color: activeTab === tab ? "white" : theme.textSecondary,
                  }}>
                    {tab === "background" ? "Choose Background Colour" : "Accessories"}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Options */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          >
            {activeTab === "background" && (
              <View>
                <Text style={{ fontSize: 16, fontFamily: "Poppins_600SemiBold", color: theme.textPrimary, marginBottom: 12 }}>
                  Background Colour
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                  {BACKGROUND_COLORS.map((color) => (
                    <Pressable
                      key={color.id}
                      onPress={() => setAvatar({ ...avatar, backgroundColor: color.id })}
                      style={{
                        width: 95,
                        paddingVertical: 14,
                        borderRadius: 16,
                        backgroundColor: color.color,
                        borderWidth: 3,
                        borderColor: avatar.backgroundColor === color.id ? theme.primary : "#E5E7EB",
                        alignItems: "center",
                        justifyContent: "center",
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 2,
                      }}
                    >
                      <Text style={{
                        fontFamily: "Poppins_600SemiBold",
                        fontSize: 11,
                        color: color.id === "none" ? theme.textPrimary : ["soft_pink", "mint", "lemon", "cream", "butter", "powder_blue", "champagne", "lavender", "peach", "aqua"].includes(color.id) ? theme.textPrimary : "#333",
                        textAlign: "center",
                      }}>
                        {color.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {activeTab === "accessories" && (
              <View style={{ gap: 20 }}>
                {/* Accessories */}
                <View>
                  <Text style={{ fontSize: 16, fontFamily: "Poppins_600SemiBold", color: theme.textPrimary, marginBottom: 12 }}>
                    Accessory
                  </Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                    {ACCESSORIES.map((accessory) => (
                      <Pressable
                        key={accessory.id}
                        onPress={() => setAvatar({ ...avatar, accessory: accessory.id })}
                        style={{
                          paddingHorizontal: 16,
                          paddingVertical: 12,
                          borderRadius: 16,
                          backgroundColor: avatar.accessory === accessory.id ? theme.primary : "white",
                          borderWidth: 2,
                          borderColor: avatar.accessory === accessory.id ? theme.primary : "#E5E7EB",
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <Text style={{ fontSize: 20 }}>{accessory.emoji}</Text>
                        <Text style={{
                          fontFamily: "Poppins_500Medium",
                          fontSize: 13,
                          color: avatar.accessory === accessory.id ? "white" : theme.textPrimary,
                        }}>
                          {accessory.name}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Glasses */}
                <View>
                  <Pressable
                    onPress={() => setAvatar({ ...avatar, glasses: !avatar.glasses })}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      backgroundColor: "white",
                      padding: 16,
                      borderRadius: 16,
                      borderWidth: 2,
                      borderColor: avatar.glasses ? theme.primary : "#E5E7EB",
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                      <Text style={{ fontSize: 24 }}>👓</Text>
                      <Text style={{ fontSize: 15, fontFamily: "Poppins_600SemiBold", color: theme.textPrimary }}>
                        Glasses
                      </Text>
                    </View>
                    <View style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: avatar.glasses ? theme.primary : "#E5E7EB",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      {avatar.glasses && <Ionicons name="checkmark" size={16} color="white" />}
                    </View>
                  </Pressable>
                </View>

                {/* Headphones */}
                <View>
                  <Pressable
                    onPress={() => setAvatar({ ...avatar, headphones: !avatar.headphones })}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      backgroundColor: "white",
                      padding: 16,
                      borderRadius: 16,
                      borderWidth: 2,
                      borderColor: avatar.headphones ? theme.primary : "#E5E7EB",
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                      <Text style={{ fontSize: 24 }}>🎧</Text>
                      <Text style={{ fontSize: 15, fontFamily: "Poppins_600SemiBold", color: theme.textPrimary }}>
                        Headphones
                      </Text>
                    </View>
                    <View style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: avatar.headphones ? theme.primary : "#E5E7EB",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      {avatar.headphones && <Ionicons name="checkmark" size={16} color="white" />}
                    </View>
                  </Pressable>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Footer Actions */}
          <View style={{
            paddingHorizontal: 24,
            paddingVertical: 16,
            paddingBottom: 40,
            backgroundColor: "white",
            borderTopWidth: 1,
            borderTopColor: theme.textSecondary + "20",
          }}>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <Pressable
                onPress={handleReset}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 16,
                  backgroundColor: "#F3F4F6",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 15, fontFamily: "Poppins_600SemiBold", color: theme.textSecondary }}>
                  Reset
                </Text>
              </Pressable>
              <Pressable
                onPress={handleSave}
                style={{
                  flex: 2,
                  paddingVertical: 14,
                  borderRadius: 16,
                  backgroundColor: theme.primary,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 15, fontFamily: "Poppins_600SemiBold", color: "white" }}>
                  Save Avatar
                </Text>
              </Pressable>
            </View>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
};

export default AvatarCreator;
