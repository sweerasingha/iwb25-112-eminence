import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
  View,
} from "react-native";
import { COLORS, FONTS, SPACING } from "../../theme";

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "small" | "medium" | "large";
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = "primary",
  size = "medium",
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  ...props
}) => {
  const isDisabled = disabled || loading;

  const buttonStyle: ViewStyle[] = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    style,
  ].filter(Boolean) as ViewStyle[];

  const textStyle: TextStyle[] = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    isDisabled && styles.disabledText,
  ].filter(Boolean) as TextStyle[];

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.contentContainer}>
          <ActivityIndicator
            size="small"
            color={getSpinnerColor(variant)}
            style={styles.spinner}
          />
          <Text style={textStyle}>{title}</Text>
        </View>
      );
    }

    return (
      <View style={styles.contentContainer}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <Text style={textStyle}>{title}</Text>
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={buttonStyle}
      disabled={isDisabled}
      activeOpacity={0.7}
      {...props}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const getSpinnerColor = (variant: string): string => {
  switch (variant) {
    case "primary":
    case "secondary":
    case "danger":
      return COLORS.background;
    case "outline":
    case "ghost":
      return COLORS.primary;
    default:
      return COLORS.background;
  }
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    minHeight: 48,
    borderWidth: 1,
    borderColor: "transparent",
  },

  // Variants
  primary: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  outline: {
    backgroundColor: "transparent",
    borderColor: COLORS.primary,
    borderWidth: 1,
  },
  ghost: {
    backgroundColor: "transparent",
    borderColor: "transparent",
  },
  danger: {
    backgroundColor: COLORS.error,
    borderColor: COLORS.error,
  },

  // Sizes
  small: {
    minHeight: 36,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
  },
  medium: {
    minHeight: 48,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 12,
  },
  large: {
    minHeight: 56,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 16,
  },

  // States
  disabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: "100%",
  },

  // Text styles
  text: {
    fontFamily: FONTS.families.medium,
    fontWeight: FONTS.weights.semibold,
    textAlign: "center",
    flexShrink: 1,
  },

  // Text variants
  primaryText: {
    color: COLORS.background,
    fontSize: FONTS.sizes.md,
  },
  secondaryText: {
    color: COLORS.background,
    fontSize: FONTS.sizes.md,
  },
  outlineText: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.md,
  },
  ghostText: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.md,
  },
  dangerText: {
    color: COLORS.background,
    fontSize: FONTS.sizes.md,
  },

  // Text sizes
  smallText: {
    fontSize: FONTS.sizes.sm,
  },
  mediumText: {
    fontSize: FONTS.sizes.md,
  },
  largeText: {
    fontSize: FONTS.sizes.lg,
  },

  disabledText: {
    opacity: 0.7,
  },

  // Content layout
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  leftIcon: {
    marginRight: SPACING.xs,
  },
  rightIcon: {
    marginLeft: SPACING.xs,
  },
  spinner: {
    marginRight: SPACING.xs,
  },
});
