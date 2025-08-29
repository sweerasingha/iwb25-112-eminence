import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

// Typography - Enhanced with better scale
export const FONTS = {
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
    huge: 28,
    giant: 32,
    massive: 36,
  },
  weights: {
    thin: "100" as const,
    light: "300" as const,
    regular: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
    black: "900" as const,
  },
  families: {
    regular: "System",
    medium: "System",
    bold: "System",
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8,
  },
} as const;

// Colors - Enhanced with better professional palette
export const COLORS = {
  primary: "#1B365D",      // Deep navy blue - trust, professionalism
  primaryLight: "#2E4F6E",
  primaryDark: "#0F1C2E",
  primaryAccent: "#3B82F6", // Bright blue for accents

  // Secondary colors - Construction orange
  secondary: "#F97316",     // Construction orange
  secondaryLight: "#FB923C",
  secondaryDark: "#EA580C",

  // Success colors - Professional green
  success: "#059669",
  successLight: "#10B981",
  successDark: "#047857",

  // Warning colors
  warning: "#D97706",
  warningLight: "#F59E0B",
  warningDark: "#B45309",

  // Error colors
  error: "#DC2626",
  errorLight: "#EF4444",
  errorDark: "#B91C1C",

  // Info colors
  info: "#2563EB",
  infoLight: "#3B82F6",
  infoDark: "#1D4ED8",

  // Neutral colors - Professional grays
  white: "#FFFFFF",
  black: "#000000",
  
  // Background colors
  background: "#FAFBFC",
  backgroundSecondary: "#F8FAFC",
  surface: "#FFFFFF",
  surfaceElevated: "#FFFFFF",
  
  // Text colors
  textPrimary: "#0F172A",     // Slate 900
  textSecondary: "#475569",   // Slate 600
  textTertiary: "#64748B",    // Slate 500
  textDisabled: "#94A3B8",    // Slate 400
  textInverse: "#FFFFFF",

  // Border colors
  border: "#E2E8F0",          // Slate 200
  borderLight: "#F1F5F9",     // Slate 100
  borderDark: "#CBD5E1",      // Slate 300

  // Overlay
  overlay: "rgba(15, 23, 42, 0.6)",
  overlayLight: "rgba(15, 23, 42, 0.3)",

  // Glass effect
  glass: "rgba(255, 255, 255, 0.8)",
  glassDark: "rgba(15, 23, 42, 0.8)",

  // Gradient colors
  gradientStart: "#1B365D",
  gradientEnd: "#3B82F6",

  // Status colors with opacity
  successBg: "rgba(5, 150, 105, 0.1)",
  warningBg: "rgba(217, 119, 6, 0.1)",
  errorBg: "rgba(220, 38, 38, 0.1)",
  infoBg: "rgba(37, 99, 235, 0.1)",

  // Dark theme
  dark: {
    background: "#0F172A",
    backgroundSecondary: "#1E293B",
    surface: "#1E293B",
    surfaceElevated: "#334155",
    textPrimary: "#F8FAFC",
    textSecondary: "#CBD5E1",
    textTertiary: "#94A3B8",
    border: "#334155",
    borderLight: "#475569",
  },
} as const;

// Spacing - More comprehensive scale
export const SPACING = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  xxxl: 24,
  huge: 32,
  giant: 40,
  massive: 48,
  enormous: 64,
  extreme: 80,
} as const;

// Layout - Enhanced with more professional values
export const LAYOUT = {
  window: {
    width,
    height,
  },
  isSmallDevice: width < 375,
  isTablet: width >= 768,
  headerHeight: 56,
  tabBarHeight: 88,
  
  // Border radius scale
  borderRadius: {
    none: 0,
    xs: 2,
    sm: 4,
    md: 6,
    lg: 8,
    xl: 12,
    xxl: 16,
    xxxl: 20,
    huge: 24,
    full: 9999,
  },

  // Professional shadow system
  shadows: {
    none: {
      shadowColor: "transparent",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    xs: {
      shadowColor: "#0F172A",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    sm: {
      shadowColor: "#0F172A",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    md: {
      shadowColor: "#0F172A",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 4,
    },
    lg: {
      shadowColor: "#0F172A",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.1,
      shadowRadius: 15,
      elevation: 8,
    },
    xl: {
      shadowColor: "#0F172A",
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.1,
      shadowRadius: 25,
      elevation: 12,
    },
    xxl: {
      shadowColor: "#0F172A",
      shadowOffset: { width: 0, height: 25 },
      shadowOpacity: 0.15,
      shadowRadius: 50,
      elevation: 16,
    },
  },

  // Z-index scale
  zIndex: {
    hide: -1,
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },

  // Animation durations
  durations: {
    fast: 150,
    normal: 200,
    slow: 300,
    slower: 500,
  },

  // Breakpoints
  breakpoints: {
    xs: 0,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
  },
} as const;
