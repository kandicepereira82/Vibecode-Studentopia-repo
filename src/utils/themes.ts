import { ThemeColor } from "../types";

export interface ThemeConfig {
  id: ThemeColor;
  name: string;
  description: string;
  // Background gradients for screens
  backgroundGradient: [string, string, string?];
  backgroundGradientDark: [string, string, string?]; // Dark mode background
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
  textPrimaryDark: string; // Dark mode text
  textSecondaryDark: string; // Dark mode text
  // Tab bar
  tabBarBackground: string;
  tabBarBackgroundDark: string; // Dark mode tab bar
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
    backgroundGradientDark: ["#1B5E20", "#2E7D32", "#388E3C"],
    cardBackground: "#FFFFFF",
    cardBackgroundDark: "#2E7D32",
    primary: "#4CAF50",
    primaryDark: "#388E3C",
    secondary: "#66BB6A",
    secondaryDark: "#4CAF50",
    textPrimary: "#1B5E20",
    textSecondary: "#2E7D32",
    textPrimaryDark: "#E8F5E9",
    textSecondaryDark: "#C8E6C9",
    tabBarBackground: "#C8E6C9",
    tabBarBackgroundDark: "#1B5E20",
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
    backgroundGradientDark: ["#004D40", "#00695C", "#00796B"],
    cardBackground: "#FFFFFF",
    cardBackgroundDark: "#00695C",
    primary: "#26C6DA",
    primaryDark: "#0097A7",
    secondary: "#4DD0E1",
    secondaryDark: "#26C6DA",
    textPrimary: "#004D40",
    textSecondary: "#00695C",
    textPrimaryDark: "#E0F7FA",
    textSecondaryDark: "#B2EBF2",
    tabBarBackground: "#E0F7FA",
    tabBarBackgroundDark: "#004D40",
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
    backgroundGradientDark: ["#311B92", "#4527A0", "#512DA8"],
    cardBackground: "#FFFFFF",
    cardBackgroundDark: "#4527A0",
    primary: "#673AB7",
    primaryDark: "#512DA8",
    secondary: "#7E57C2",
    secondaryDark: "#5E35B1",
    textPrimary: "#311B92",
    textSecondary: "#4527A0",
    textPrimaryDark: "#E1BEE7",
    textSecondaryDark: "#CE93D8",
    tabBarBackground: "#D1C4E9",
    tabBarBackgroundDark: "#311B92",
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
    backgroundGradient: ["#FFF8F8", "#FFF8F8", "#FFF8F8"],
    backgroundGradientDark: ["#1A0A33", "#2E1656", "#3B1E6F"],
    cardBackground: "#FFFFFF",
    cardBackgroundDark: "#2E1656",
    primary: "#00CED1",
    primaryDark: "#1E90FF",
    secondary: "#32CD32",
    secondaryDark: "#FF1493",
    textPrimary: "#1A0A33",
    textSecondary: "#2E1656",
    textPrimaryDark: "#F8F8FF",
    textSecondaryDark: "#E6E6FA",
    tabBarBackground: "#FFF8F8",
    tabBarBackgroundDark: "#1A0A33",
    tabBarActive: "#00CED1",
    tabBarInactive: "#32CD32",
    progressGradient: ["#FF6B9D", "#00CED1"],
    accentColor: "#FFD700",
    emoji: "🌈",
  },
  sunset: {
    id: "sunset",
    name: "Sunset",
    description: "Warm golden tones and rich amber hues",
    backgroundGradient: ["#FFCCBC", "#FFAB91", "#FF8A65"],
    backgroundGradientDark: ["#BF360C", "#D84315", "#E64A19"],
    cardBackground: "#FFFFFF",
    cardBackgroundDark: "#D84315",
    primary: "#FF5722",
    primaryDark: "#D84315",
    secondary: "#FF7043",
    secondaryDark: "#FF5722",
    textPrimary: "#BF360C",
    textSecondary: "#D84315",
    textPrimaryDark: "#FFCCBC",
    textSecondaryDark: "#FFAB91",
    tabBarBackground: "#FFCCBC",
    tabBarBackgroundDark: "#BF360C",
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
    backgroundGradientDark: ["#01579B", "#0277BD", "#0288D1"],
    cardBackground: "#FFFFFF",
    cardBackgroundDark: "#0277BD",
    primary: "#039BE5",
    primaryDark: "#0277BD",
    secondary: "#29B6F6",
    secondaryDark: "#039BE5",
    textPrimary: "#01579B",
    textSecondary: "#0277BD",
    textPrimaryDark: "#E1F5FE",
    textSecondaryDark: "#B3E5FC",
    tabBarBackground: "#F1F8FB",
    tabBarBackgroundDark: "#01579B",
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
    backgroundGradientDark: ["#E65100", "#EF6C00", "#F57C00"],
    cardBackground: "#FFFFFF",
    cardBackgroundDark: "#EF6C00",
    primary: "#FF9800",
    primaryDark: "#EF6C00",
    secondary: "#FFB74D",
    secondaryDark: "#FFA726",
    textPrimary: "#E65100",
    textSecondary: "#EF6C00",
    textPrimaryDark: "#FFE0B2",
    textSecondaryDark: "#FFCC80",
    tabBarBackground: "#FFE0B2",
    tabBarBackgroundDark: "#E65100",
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
    backgroundGradientDark: ["#880E4F", "#AD1457", "#C2185B"],
    cardBackground: "#FFFFFF",
    cardBackgroundDark: "#AD1457",
    primary: "#EC407A",
    primaryDark: "#C2185B",
    secondary: "#F06292",
    secondaryDark: "#EC407A",
    textPrimary: "#880E4F",
    textSecondary: "#AD1457",
    textPrimaryDark: "#FCE4EC",
    textSecondaryDark: "#F8BBD0",
    tabBarBackground: "#FCE4EC",
    tabBarBackgroundDark: "#880E4F",
    tabBarActive: "#EC407A",
    tabBarInactive: "#F06292",
    progressGradient: ["#F06292", "#EC407A"],
    accentColor: "#E91E63",
    emoji: "🌸",
  },
};

export const getTheme = (themeColor?: ThemeColor, darkMode?: boolean): ThemeConfig => {
  const theme = THEMES[themeColor || "nature"];

  if (darkMode) {
    // Return theme with dark mode colors applied
    return {
      ...theme,
      backgroundGradient: theme.backgroundGradientDark,
      cardBackground: theme.cardBackgroundDark,
      textPrimary: theme.textPrimaryDark,
      textSecondary: theme.textSecondaryDark,
      tabBarBackground: theme.tabBarBackgroundDark,
    };
  }

  return theme;
};
