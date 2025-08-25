import React, { useState, forwardRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  Animated,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, LAYOUT } from "../../theme";

export interface InputFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  leftIcon?: string;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
}

export const InputField = forwardRef<TextInput, InputFieldProps>(
  (
    {
      label,
      error,
      helperText,
      required = false,
      leftIcon,
      rightIcon,
      variant = 'outlined',
      size = 'medium',
      disabled = false,
      style,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [animatedValue] = useState(new Animated.Value(0));

    const handleFocus = (e: any) => {
      setIsFocused(true);
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
      props.onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
      props.onBlur?.(e);
    };

    const getContainerStyle = () => {
      const baseStyle: any[] = [styles.container];
      
      if (variant === 'filled') {
        baseStyle.push(styles.containerFilled);
      } else {
        baseStyle.push(styles.containerOutlined);
      }

      if (size === 'small') {
        baseStyle.push(styles.containerSmall);
      } else if (size === 'large') {
        baseStyle.push(styles.containerLarge);
      } else {
        baseStyle.push(styles.containerMedium);
      }

      if (isFocused) {
        baseStyle.push(styles.containerFocused);
      }

      if (error) {
        baseStyle.push(styles.containerError);
      }

      if (disabled) {
        baseStyle.push(styles.containerDisabled);
      }

      return baseStyle;
    };

    const getInputStyle = () => {
      const baseStyle: any[] = [styles.input];

      if (size === 'small') {
        baseStyle.push(styles.inputSmall);
      } else if (size === 'large') {
        baseStyle.push(styles.inputLarge);
      } else {
        baseStyle.push(styles.inputMedium);
      }

      if (leftIcon) {
        baseStyle.push(styles.inputWithLeftIcon);
      }

      if (rightIcon) {
        baseStyle.push(styles.inputWithRightIcon);
      }

      return baseStyle;
    };

    const borderColor = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [error ? COLORS.error : COLORS.border, COLORS.primary],
    });

    return (
      <View style={styles.fieldContainer}>
        {/* Label */}
        {label && (
          <View style={styles.labelContainer}>
            <Text style={styles.label}>
              {label}
              {required && <Text style={styles.required}> *</Text>}
            </Text>
          </View>
        )}

        {/* Input Container */}
        <Animated.View
          style={[
            getContainerStyle(),
            variant === 'outlined' && { borderColor },
          ]}
        >
          {/* Left Icon */}
          {leftIcon && (
            <View style={styles.leftIconContainer}>
              <Ionicons
                name={leftIcon as any}
                size={20}
                color={isFocused ? COLORS.primary : COLORS.textTertiary}
              />
            </View>
          )}

          {/* Text Input */}
          <TextInput
            ref={ref}
            style={getInputStyle()}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholderTextColor={COLORS.textTertiary}
            selectionColor={COLORS.primary}
            editable={!disabled}
            {...props}
          />

          {/* Right Icon */}
          {rightIcon && (
            <View style={styles.rightIconContainer}>
              {rightIcon}
            </View>
          )}
        </Animated.View>

        {/* Helper Text or Error */}
        {(error || helperText) && (
          <View style={styles.feedbackContainer}>
            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color={COLORS.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : (
              <Text style={styles.helperText}>{helperText}</Text>
            )}
          </View>
        )}
      </View>
    );
  }
);

InputField.displayName = 'InputField';

const styles = StyleSheet.create({
  fieldContainer: {
    marginBottom: SPACING.xl,
  },
  labelContainer: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textPrimary,
  },
  required: {
    color: COLORS.error,
  },

  // Container variants
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: LAYOUT.borderRadius.lg,
    backgroundColor: COLORS.surface,
  },
  containerOutlined: {
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  containerFilled: {
    backgroundColor: COLORS.backgroundSecondary,
  },
  containerFocused: {
    ...LAYOUT.shadows.sm,
  },
  containerError: {
    borderColor: COLORS.error,
  },
  containerDisabled: {
    backgroundColor: COLORS.backgroundSecondary,
    opacity: 0.6,
  },

  // Container sizes
  containerSmall: {
    minHeight: 44,
    paddingHorizontal: SPACING.lg,
  },
  containerMedium: {
    minHeight: 56,
    paddingHorizontal: SPACING.xl,
  },
  containerLarge: {
    minHeight: 64,
    paddingHorizontal: SPACING.xl,
  },

  // Input styles
  input: {
    flex: 1,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.regular,
    color: COLORS.textPrimary,
    padding: 0,
  },
  inputSmall: {
    fontSize: FONTS.sizes.md,
  },
  inputMedium: {
    fontSize: FONTS.sizes.lg,
  },
  inputLarge: {
    fontSize: FONTS.sizes.xl,
  },
  inputWithLeftIcon: {
    marginLeft: SPACING.lg,
  },
  inputWithRightIcon: {
    marginRight: SPACING.lg,
  },

  // Icon containers
  leftIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 24,
    height: 24,
  },
  rightIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 24,
    height: 24,
  },

  // Feedback
  feedbackContainer: {
    marginTop: SPACING.md,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.error,
    fontWeight: FONTS.weights.medium,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  helperText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textTertiary,
    fontWeight: FONTS.weights.regular,
  },
});
