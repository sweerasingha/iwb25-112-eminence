import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Animated,
  Image,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { Button, InputField, Loading } from "../../components";
import { useAuth, useForm } from "../../hooks";
import { globalStyles, COLORS, SPACING, LAYOUT } from "../../theme";
import { SignupFormData, signupSchema } from "../../utils/schemas";
import { api } from "../../services/api";

export default function SignUpScreen() {
  const router = useRouter();
  const { isAuthenticated, clearError } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, router]);

  // Fade animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const { formData, errors, touched, validate, getFieldProps } =
    useForm<SignupFormData>(
      {
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      },
      signupSchema
    );

  const handleFormSubmit = async () => {
    const isValidForm = validate();
    if (isValidForm) {
      setIsSigningUp(true);
      try {
        clearError();
        const response = await api.post("/auth/register/init", {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });

        if (response.success) {
          setSignupError(null);
          router.push(
            `/auth/otp-verification?email=${encodeURIComponent(formData.email)}`
          );
        } else {
          setSignupError(
            response.error ||
              (response as any)?.data?.message ||
              "Please check your information and try again"
          );
        }
      } catch (err: any) {
        setSignupError(
          err.message || "Please check your information and try again"
        );
      } finally {
        setIsSigningUp(false);
      }
    }
  };

  const renderPasswordToggle = (isConfirm = false) => (
    <TouchableOpacity
      onPress={() =>
        isConfirm
          ? setShowConfirmPassword(!showConfirmPassword)
          : setShowPassword(!showPassword)
      }
      style={styles.passwordToggle}
    >
      <Ionicons
        name={
          isConfirm
            ? showConfirmPassword
              ? "eye-off"
              : "eye"
            : showPassword
            ? "eye-off"
            : "eye"
        }
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
        colors={[COLORS.primary, COLORS.secondary]}
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
              <Image
                source={require("../../assets/2.png")}
                style={styles.appIcon}
                resizeMode="contain"
              />
            </View>
            <Text style={[globalStyles.displayMedium, styles.appTitle]}>
              Civil Quest
            </Text>
            <Text style={[globalStyles.body, styles.appSubtitle]}>
              Join the New Era of Community Service
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Header */}
            <View style={styles.formHeader}>
              <Text style={[globalStyles.h2, styles.title]}>
                Create Account
              </Text>
              <Text style={[globalStyles.body, styles.subtitle]}>
                Sign up to get started
              </Text>
            </View>

            {/* Error Message */}
            {signupError && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color={COLORS.error} />
                <Text style={styles.errorText}>{signupError}</Text>
              </View>
            )}

            {/* Form */}
            <View style={styles.form}>
              <InputField
                label="Full Name"
                placeholder="Enter your full name"
                leftIcon="person"
                {...getFieldProps("name")}
                error={touched.name ? errors.name : undefined}
                autoCapitalize="words"
                required
                variant="filled"
              />

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
                placeholder="Create a password"
                leftIcon="lock-closed"
                rightIcon={renderPasswordToggle()}
                {...getFieldProps("password")}
                error={touched.password ? errors.password : undefined}
                secureTextEntry={!showPassword}
                required
                variant="filled"
              />

              <InputField
                label="Confirm Password"
                placeholder="Confirm your password"
                leftIcon="lock-closed"
                rightIcon={renderPasswordToggle(true)}
                {...getFieldProps("confirmPassword")}
                error={
                  touched.confirmPassword ? errors.confirmPassword : undefined
                }
                secureTextEntry={!showConfirmPassword}
                required
                variant="filled"
              />

              <Button
                title="Create Account"
                variant="primary"
                size="large"
                onPress={handleFormSubmit}
                loading={isSigningUp}
                disabled={isSigningUp}
                fullWidth
                style={styles.signupButton}
              />
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={[globalStyles.body, styles.footerText]}>
                Already have an account?{" "}
                <Link href="/auth/login" style={styles.link}>
                  Sign In
                </Link>
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Loading Overlay */}
      <Loading
        visible={isSigningUp}
        message="Creating your account..."
        variant="overlay"
        fullScreen
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
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
  signupButton: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
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
  appIcon: {
    width: 40,
    height: 40,
  },
});
