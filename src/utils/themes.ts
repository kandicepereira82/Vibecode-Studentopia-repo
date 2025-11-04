import { ThemeColor } from "../types";

export interface ThemeConfig {
  id: ThemeColor;
  name: string;
  description: string;
  // Background gradients for screens
  backgroundGradient: [string, string, string?];
  // Card/component backgrounds
  cardBackground: string;
  cardBackgroundDark: string;
  // Primary accent color
  primary: string;
  primaryDark: string;
  // Secondary accent
  secondary: string;
  secondaryDark: string;
  // Text colors
  textPrimary: string;
  textSecondary: string;
  // Tab bar
  tabBarBackground: string;
  tabBarActive: string;
  tabBarInactive: string;
  // Progress bars
  progressGradient: [string, string];
  // Icons and accents
  accentColor: string;
  // Emoji representation
  emoji: string;
}

export const THEMES: Record<ThemeColor, ThemeConfig> = {
  nature: {
    id: "nature",
    name: "Nature",
    description: "Fresh greens and earthy tones",
    backgroundGradient: ["#E8F5E9", "#C8E6C9", "#A5D6A7"],
    cardBackground: "#FFFFFF",
    cardBackgroundDark: "#2E7D32",
    primary: "#4CAF50",
    primaryDark: "#2E7D32",
    secondary: "#8BC34A",
    secondaryDark: "#558B2F",
    textPrimary: "#1B5E20",
    textSecondary: "#558B2F",
    tabBarBackground: "#F1F8E9",
    tabBarActive: "#4CAF50",
    tabBarInactive: "#81C784",
    progressGradient: ["#66BB6A", "#43A047"],
    accentColor: "#7CB342",
    emoji: "🌿",
  },
  ocean: {
    id: "ocean",
    name: "Ocean",
    description: "Deep blues and aqua waves",
    backgroundGradient: ["#E1F5FE", "#B3E5FC", "#81D4FA"],
    cardBackground: "#FFFFFF",
    cardBackgroundDark: "#01579B",
    primary: "#0288D1",
    primaryDark: "#01579B",
    secondary: "#00ACC1",
    secondaryDark: "#006064",
    textPrimary: "#01579B",
    textSecondary: "#0277BD",
    tabBarBackground: "#E0F7FA",
    tabBarActive: "#00ACC1",
    tabBarInactive: "#4DD0E1",
    progressGradient: ["#26C6DA", "#00ACC1"],
    accentColor: "#00BCD4",
    emoji: "🌊",
  },
  sunset: {
    id: "sunset",
    name: "Sunset",
    description: "Warm oranges and pink skies",
    backgroundGradient: ["#FFF3E0", "#FFE0B2", "#FFCC80"],
    cardBackground: "#FFFFFF",
    cardBackgroundDark: "#E65100",
    primary: "#FF6F00",
    primaryDark: "#E65100",
    secondary: "#FF9800",
    secondaryDark: "#F57C00",
    textPrimary: "#E65100",
    textSecondary: "#F57C00",
    tabBarBackground: "#FFF8E1",
    tabBarActive: "#FF6F00",
    tabBarInactive: "#FFB74D",
    progressGradient: ["#FF9800", "#F57C00"],
    accentColor: "#FB8C00",
    emoji: "🌅",
  },
  galaxy: {
    id: "galaxy",
    name: "Galaxy",
    description: "Deep purples and cosmic vibes",
    backgroundGradient: ["#E8EAF6", "#C5CAE9", "#9FA8DA"],
    cardBackground: "#FFFFFF",
    cardBackgroundDark: "#311B92",
    primary: "#5E35B1",
    primaryDark: "#311B92",
    secondary: "#7E57C2",
    secondaryDark: "#4527A0",
    textPrimary: "#311B92",
    textSecondary: "#512DA8",
    tabBarBackground: "#EDE7F6",
    tabBarActive: "#5E35B1",
    tabBarInactive: "#9575CD",
    progressGradient: ["#7E57C2", "#5E35B1"],
    accentColor: "#673AB7",
    emoji: "🌌",
  },
  rainbow: {
    id: "rainbow",
    name: "Rainbow",
    description: "Vibrant multi-color spectrum",
    backgroundGradient: ["#FFF9C4", "#FFF59D", "#FFF176"],
    cardBackground: "#FFFFFF",
    cardBackgroundDark: "#F57F17",
    primary: "#FBC02D",
    primaryDark: "#F57F17",
    secondary: "#FF6F00",
    secondaryDark: "#E65100",
    textPrimary: "#F57F17",
    textSecondary: "#F9A825",
    tabBarBackground: "#FFFDE7",
    tabBarActive: "#FBC02D",
    tabBarInactive: "#FFD54F",
    progressGradient: ["#FFD54F", "#FBC02D"],
    accentColor: "#FFEB3B",
    emoji: "🌈",
  },
  forest: {
    id: "forest",
    name: "Forest",
    description: "Deep woods and mossy greens",
    backgroundGradient: ["#E8F5E9", "#C8E6C9", "#A5D6A7"],
    cardBackground: "#FFFFFF",
    cardBackgroundDark: "#1B5E20",
    primary: "#2E7D32",
    primaryDark: "#1B5E20",
    secondary: "#388E3C",
    secondaryDark: "#2E7D32",
    textPrimary: "#1B5E20",
    textSecondary: "#2E7D32",
    tabBarBackground: "#F1F8E9",
    tabBarActive: "#2E7D32",
    tabBarInactive: "#66BB6A",
    progressGradient: ["#43A047", "#2E7D32"],
    accentColor: "#4CAF50",
    emoji: "🌲",
  },
  desert: {
    id: "desert",
    name: "Desert",
    description: "Sandy beige and warm earth",
    backgroundGradient: ["#FFF8E1", "#FFECB3", "#FFE082"],
    cardBackground: "#FFFFFF",
    cardBackgroundDark: "#E65100",
    primary: "#F57C00",
    primaryDark: "#E65100",
    secondary: "#FF8F00",
    secondaryDark: "#EF6C00",
    textPrimary: "#E65100",
    textSecondary: "#EF6C00",
    tabBarBackground: "#FFFDE7",
    tabBarActive: "#F57C00",
    tabBarInactive: "#FFB74D",
    progressGradient: ["#FFB74D", "#FF9800"],
    accentColor: "#FF9800",
    emoji: "🏜️",
  },
  arctic: {
    id: "arctic",
    name: "Arctic",
    description: "Icy whites and cool blues",
    backgroundGradient: ["#E0F2F1", "#B2DFDB", "#80CBC4"],
    cardBackground: "#FFFFFF",
    cardBackgroundDark: "#004D40",
    primary: "#00796B",
    primaryDark: "#004D40",
    secondary: "#009688",
    secondaryDark: "#00695C",
    textPrimary: "#004D40",
    textSecondary: "#00695C",
    tabBarBackground: "#E0F7FA",
    tabBarActive: "#00796B",
    tabBarInactive: "#4DB6AC",
    progressGradient: ["#4DB6AC", "#00897B"],
    accentColor: "#00BCD4",
    emoji: "❄️",
  },
  autumn: {
    id: "autumn",
    name: "Autumn",
    description: "Golden leaves and harvest colors",
    backgroundGradient: ["#FFF3E0", "#FFE0B2", "#FFCC80"],
    cardBackground: "#FFFFFF",
    cardBackgroundDark: "#BF360C",
    primary: "#E64A19",
    primaryDark: "#BF360C",
    secondary: "#FF5722",
    secondaryDark: "#D84315",
    textPrimary: "#BF360C",
    textSecondary: "#D84315",
    tabBarBackground: "#FBE9E7",
    tabBarActive: "#E64A19",
    tabBarInactive: "#FF8A65",
    progressGradient: ["#FF7043", "#E64A19"],
    accentColor: "#FF5722",
    emoji: "🍂",
  },
  cherry: {
    id: "cherry",
    name: "Cherry Blossom",
    description: "Soft pinks and spring blooms",
    backgroundGradient: ["#FCE4EC", "#F8BBD0", "#F48FB1"],
    cardBackground: "#FFFFFF",
    cardBackgroundDark: "#880E4F",
    primary: "#C2185B",
    primaryDark: "#880E4F",
    secondary: "#E91E63",
    secondaryDark: "#AD1457",
    textPrimary: "#880E4F",
    textSecondary: "#AD1457",
    tabBarBackground: "#FFF0F5",
    tabBarActive: "#C2185B",
    tabBarInactive: "#F06292",
    progressGradient: ["#F06292", "#E91E63"],
    accentColor: "#EC407A",
    emoji: "🌸",
  },
};

export const getTheme = (themeColor?: ThemeColor): ThemeConfig => {
  return THEMES[themeColor || "nature"];
};
