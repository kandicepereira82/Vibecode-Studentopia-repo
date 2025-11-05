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
    description: "Fresh greens inspired by lush forests and meadows",
    backgroundGradient: ["#C8E6C9", "#A5D6A7", "#81C784"],
    cardBackground: "#FFFFFF",
    cardBackgroundDark: "#388E3C",
    primary: "#4CAF50",
    primaryDark: "#388E3C",
    secondary: "#66BB6A",
    secondaryDark: "#4CAF50",
    textPrimary: "#1B5E20",
    textSecondary: "#2E7D32",
    tabBarBackground: "#C8E6C9",
    tabBarActive: "#4CAF50",
    tabBarInactive: "#66BB6A",
    progressGradient: ["#66BB6A", "#4CAF50"],
    accentColor: "#388E3C",
    emoji: "🌿",
  },
  ocean: {
    id: "ocean",
    name: "Ocean",
    description: "Blues and turquoise inspired by ocean depths",
    backgroundGradient: ["#E0F7FA", "#B2EBF2", "#80DEEA"],
    cardBackground: "#FFFFFF",
    cardBackgroundDark: "#0097A7",
    primary: "#26C6DA",
    primaryDark: "#0097A7",
    secondary: "#4DD0E1",
    secondaryDark: "#26C6DA",
    textPrimary: "#004D40",
    textSecondary: "#00695C",
    tabBarBackground: "#E0F7FA",
    tabBarActive: "#26C6DA",
    tabBarInactive: "#4DD0E1",
    progressGradient: ["#4DD0E1", "#26C6DA"],
    accentColor: "#00BCD4",
    emoji: "🌊",
  },
  galaxy: {
    id: "galaxy",
    name: "Galaxy",
    description: "Deep indigo, purple, and cosmic blues of the galaxy",
    backgroundGradient: ["#D1C4E9", "#B39DDB", "#9575CD"],
    cardBackground: "#FFFFFF",
    cardBackgroundDark: "#512DA8",
    primary: "#673AB7",
    primaryDark: "#512DA8",
    secondary: "#7E57C2",
    secondaryDark: "#5E35B1",
    textPrimary: "#311B92",
    textSecondary: "#4527A0",
    tabBarBackground: "#D1C4E9",
    tabBarActive: "#673AB7",
    tabBarInactive: "#7E57C2",
    progressGradient: ["#7E57C2", "#673AB7"],
    accentColor: "#5E35B1",
    emoji: "🌌",
  },
  rainbow: {
    id: "rainbow",
    name: "Rainbow",
    description: "All 7 colors of the rainbow in soft harmony",
    backgroundGradient: ["#FFE5E5", "#FFF4CC", "#E5F9E5"],
    cardBackground: "#FFFFFF",
    cardBackgroundDark: "#5A9BD5",
    primary: "#6AADE4",
    primaryDark: "#5A9BD5",
    secondary: "#A8D5BA",
    secondaryDark: "#7CB9E8",
    textPrimary: "#2C5F7C",
    textSecondary: "#3D7BA3",
    tabBarBackground: "#FFF9F0",
    tabBarActive: "#6AADE4",
    tabBarInactive: "#A8D5BA",
    progressGradient: ["#A8D5BA", "#6AADE4"],
    accentColor: "#5A9BD5",
    emoji: "🌈",
  },
  sunset: {
    id: "sunset",
    name: "Sunset",
    description: "Warm golden tones and rich amber hues",
    backgroundGradient: ["#FFCCBC", "#FFAB91", "#FF8A65"],
    cardBackground: "#FFFFFF",
    cardBackgroundDark: "#D84315",
    primary: "#FF5722",
    primaryDark: "#D84315",
    secondary: "#FF7043",
    secondaryDark: "#FF5722",
    textPrimary: "#BF360C",
    textSecondary: "#D84315",
    tabBarBackground: "#FFCCBC",
    tabBarActive: "#FF5722",
    tabBarInactive: "#FF7043",
    progressGradient: ["#FF7043", "#FF5722"],
    accentColor: "#E64A19",
    emoji: "🌅",
  },
  arctic: {
    id: "arctic",
    name: "Arctic",
    description: "Whites and icy blues of arctic landscapes",
    backgroundGradient: ["#F1F8FB", "#E1F5FE", "#B3E5FC"],
    cardBackground: "#FFFFFF",
    cardBackgroundDark: "#0277BD",
    primary: "#039BE5",
    primaryDark: "#0277BD",
    secondary: "#29B6F6",
    secondaryDark: "#039BE5",
    textPrimary: "#01579B",
    textSecondary: "#0277BD",
    tabBarBackground: "#F1F8FB",
    tabBarActive: "#039BE5",
    tabBarInactive: "#29B6F6",
    progressGradient: ["#29B6F6", "#039BE5"],
    accentColor: "#0288D1",
    emoji: "❄️",
  },
  golden: {
    id: "golden",
    name: "Golden",
    description: "Warm golds, rusts, and browns of autumn foliage",
    backgroundGradient: ["#FFE0B2", "#FFCC80", "#FFAB40"],
    cardBackground: "#FFFFFF",
    cardBackgroundDark: "#EF6C00",
    primary: "#FF9800",
    primaryDark: "#EF6C00",
    secondary: "#FFB74D",
    secondaryDark: "#FFA726",
    textPrimary: "#E65100",
    textSecondary: "#EF6C00",
    tabBarBackground: "#FFE0B2",
    tabBarActive: "#FF9800",
    tabBarInactive: "#FFB74D",
    progressGradient: ["#FFB74D", "#FF9800"],
    accentColor: "#F57C00",
    emoji: "🍂",
  },
  cherry: {
    id: "cherry",
    name: "Cherry Blossom",
    description: "Soft pinks, whites, and touches of red from cherry blossoms",
    backgroundGradient: ["#FCE4EC", "#F8BBD0", "#F48FB1"],
    cardBackground: "#FFFFFF",
    cardBackgroundDark: "#C2185B",
    primary: "#EC407A",
    primaryDark: "#C2185B",
    secondary: "#F06292",
    secondaryDark: "#EC407A",
    textPrimary: "#880E4F",
    textSecondary: "#AD1457",
    tabBarBackground: "#FCE4EC",
    tabBarActive: "#EC407A",
    tabBarInactive: "#F06292",
    progressGradient: ["#F06292", "#EC407A"],
    accentColor: "#E91E63",
    emoji: "🌸",
  },
};

export const getTheme = (themeColor?: ThemeColor): ThemeConfig => {
  return THEMES[themeColor || "nature"];
};
