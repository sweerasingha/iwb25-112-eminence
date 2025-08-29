import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

import { COLORS, FONTS, SPACING, LAYOUT } from "../../theme";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  variant?: "default" | "gradient" | "transparent" | "blur";
  centerTitle?: boolean;
  elevation?: boolean;
  backgroundColor?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title = "",
  subtitle,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  variant = "default",
  centerTitle = true,
  elevation = true,
  backgroundColor,
}) => {
  const insets = useSafeAreaInsets();

  const containerStyle = [
    styles.container,
    { paddingTop: insets.top },
    elevation && LAYOUT.shadows.sm,
    backgroundColor && { backgroundColor },
  ];

  const renderContent = () => (
    <View style={styles.content}>
      {/* Left Icon */}
      <View style={styles.leftSection}>
        {leftIcon && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onLeftPress}
            activeOpacity={0.7}
          >
            <Ionicons name={leftIcon} size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Title Section */}
      <View style={[styles.titleSection, centerTitle && styles.titleCentered]}>
        {title && (
          <Text
            style={[styles.title, centerTitle && styles.titleTextCentered]}
            numberOfLines={1}
          >
            {title}
          </Text>
        )}
        {subtitle && (
          <Text
            style={[
              styles.subtitle,
              centerTitle && styles.subtitleTextCentered,
            ]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}
      </View>

      {/* Right Icon */}
      <View style={styles.rightSection}>
        {rightIcon && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onRightPress}
            activeOpacity={0.7}
          >
            <Ionicons name={rightIcon} size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (variant === "gradient") {
    return (
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientEnd]}
        style={containerStyle}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <StatusBar
          barStyle="light-content"
          backgroundColor={COLORS.gradientStart}
        />
        {renderContent()}
      </LinearGradient>
    );
  }

  if (variant === "blur") {
    return (
      <BlurView intensity={95} style={containerStyle}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent
        />
        {renderContent()}
      </BlurView>
    );
  }

  if (variant === "transparent") {
    return (
      <View style={[containerStyle, { backgroundColor: "transparent" }]}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent
        />
        {renderContent()}
      </View>
    );
  }

  return (
    <View
      style={[
        containerStyle,
        { backgroundColor: backgroundColor || COLORS.surface },
      ]}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={backgroundColor || COLORS.surface}
      />
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    minHeight: LAYOUT.headerHeight,
  },
  leftSection: {
    width: 40,
    alignItems: "flex-start",
  },
  rightSection: {
    width: 40,
    alignItems: "flex-end",
  },
  titleSection: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  titleCentered: {
    alignItems: "center",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: LAYOUT.borderRadius.lg,
    backgroundColor: COLORS.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
    ...LAYOUT.shadows.xs,
  },
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.white,
    lineHeight: FONTS.sizes.xl * FONTS.lineHeights.tight,
  },
  titleTextCentered: {
    textAlign: "center",
  },
  subtitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.regular,
    color: COLORS.white,
    marginTop: SPACING.xs,
    lineHeight: FONTS.sizes.sm * FONTS.lineHeights.normal,
  },
  subtitleTextCentered: {
    textAlign: "center",
  },
});
