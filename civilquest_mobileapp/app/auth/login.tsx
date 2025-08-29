import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { Button, InputField, Loading } from "../../components";
import { useAuth, useForm } from "../../hooks";
import { globalStyles, COLORS, SPACING, LAYOUT } from "../../theme";
import { LoginFormData, loginSchema } from "../../utils/schemas";

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error, clearError, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const {
    formData,
    errors,
    touched,
    isValid,
    handleChange,
    handleBlur,
    validate,
    getFieldProps,
  } = useForm<LoginFormData>(
    {
      email: "",
      password: "",
    },
    loginSchema
  );

  const handleFormSubmit = async () => {
    const isValidForm = validate();
    if (isValidForm) {
      try {
        clearError();
        const data = {
          email: formData.email,
          password: formData.password,
        };
        const success = await login(data);
        if (success) {
          router.replace("/(tabs)");
        }
      } catch (err) {
        Alert.alert(
          "Login Failed",
          "Please check your credentials and try again"
        );
      }
    }
  };

  const renderPasswordToggle = () => (
    <TouchableOpacity
      onPress={() => setShowPassword(!showPassword)}
      style={styles.passwordToggle}
    >
      <Ionicons
        name={showPassword ? "eye-off" : "eye"}
        size={20}
        color={COLORS.textTertiary}
      />
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Background Gradient */}
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientEnd]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Ionicons name="construct" size={48} color={COLORS.white} />
            </View>
            <Text style={[globalStyles.displayMedium, styles.appTitle]}>
              Civil Quest
            </Text>
            <Text style={[globalStyles.body, styles.appSubtitle]}>
              New Era of Community Service
            </Text>
          </View>

          {/* Login Form Card */}
          <View style={styles.formCard}>
            {/* Header */}
            <View style={styles.formHeader}>
              <Text style={[globalStyles.h2, styles.title]}>Welcome Back</Text>
              <Text style={[globalStyles.body, styles.subtitle]}>
                Sign in to your account to continue
              </Text>
            </View>

            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color={COLORS.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Form */}
            <View style={styles.form}>
              <InputField
                label="Email Address"
                placeholder="Enter your email"
                leftIcon="mail"
                {...getFieldProps("email")}
                error={touched.email ? errors.email : undefined}
                autoCapitalize="none"
                keyboardType="email-address"
                required
                variant="filled"
              />

              <InputField
                label="Password"
                placeholder="Enter your password"
                leftIcon="lock-closed"
                rightIcon={renderPasswordToggle()}
                {...getFieldProps("password")}
                error={touched.password ? errors.password : undefined}
                secureTextEntry={!showPassword}
                required
                variant="filled"
              />

              <Button
                title="Sign In"
                variant="primary"
                size="large"
                onPress={handleFormSubmit}
                loading={isLoading}
                disabled={isLoading}
                fullWidth
                style={styles.loginButton}
              />
            </View>

            {/* Footer Links */}
            <View style={styles.footer}>
              <Text style={[globalStyles.body, styles.footerText]}>
                Don't have an account?{" "}
                <Link href="/auth/signup" style={styles.link}>
                  Sign Up
                </Link>
              </Text>

              <Link href="/auth/forgot-password" style={styles.forgotPassword}>
                <Text style={styles.link}>Forgot Password?</Text>
              </Link>
            </View>
          </View>

        
        </Animated.View>
      </ScrollView>

      {/* Loading Overlay */}
      <Loading
        visible={isLoading}
        message="Signing you in..."
        variant="overlay"
        fullScreen
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: SPACING.huge,
  },
  content: {
    paddingHorizontal: SPACING.xl,
  },

  // Logo Section
  logoSection: {
    alignItems: "center",
    marginBottom: SPACING.huge,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.white + "20",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.lg,
    ...LAYOUT.shadows.md,
  },
  appTitle: {
    color: COLORS.white,
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  appSubtitle: {
    color: COLORS.white + "CC",
    textAlign: "center",
  },

  // Form Card
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.borderRadius.xxl,
    padding: SPACING.huge,
    marginBottom: SPACING.huge,
    ...LAYOUT.shadows.lg,
  },
  formHeader: {
    alignItems: "center",
    marginBottom: SPACING.huge,
  },
  title: {
    textAlign: "center",
    marginBottom: SPACING.md,
    color: COLORS.textPrimary,
  },
  subtitle: {
    textAlign: "center",
    color: COLORS.textSecondary,
  },

  // Error
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.errorBg,
    padding: SPACING.lg,
    borderRadius: LAYOUT.borderRadius.lg,
    marginBottom: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  errorText: {
    flex: 1,
    marginLeft: SPACING.md,
    color: COLORS.error,
    fontWeight: "500",
  },

  // Form
  form: {
    marginBottom: SPACING.xl,
  },
  passwordToggle: {
    padding: SPACING.sm,
  },
  loginButton: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  demoButton: {
    borderColor: COLORS.borderLight,
    backgroundColor: COLORS.backgroundSecondary,
  },

  // Footer
  footer: {
    alignItems: "center",
    gap: SPACING.lg,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  footerText: {
    textAlign: "center",
    color: COLORS.textSecondary,
  },
  link: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  forgotPassword: {
    marginTop: SPACING.sm,
  },

  // Features
  featuresSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
  },
  feature: {
    alignItems: "center",
    gap: SPACING.md,
  },
  featureText: {
    color: COLORS.white + "CC",
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
});
