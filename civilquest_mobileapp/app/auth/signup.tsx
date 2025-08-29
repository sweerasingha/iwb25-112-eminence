import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Link, useRouter } from "expo-router";

import { Button, InputField } from "../../components";
import { useAuth, useForm } from "../../hooks";
import { globalStyles, COLORS, SPACING } from "../../theme";
import { SignupFormData, signupSchema } from "../../utils/schemas";
import { api } from "../../services/api";
import { Ionicons } from "@expo/vector-icons";

export default function SignUpScreen() {
  const router = useRouter();
  const { isAuthenticated, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, router]);

  const {
    formData,
    errors,
    touched,
    isValid,
    handleChange,
    handleBlur,
    validate,
    getFieldProps,
  } = useForm<SignupFormData>(
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
          // Clear any previous errors
          setSignupError(null);

          // Navigate to OTP verification with email
          router.push(
            `/auth/otp-verification?email=${encodeURIComponent(formData.email)}`
          );
        } else {
          setSignupError(
            (response.error ||
              (response as any)?.data?.message ||
              "Please check your information and try again") as string
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

  return (
    <KeyboardAvoidingView
      style={globalStyles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[globalStyles.h1, styles.title]}>Create Account</Text>
            <Text style={[globalStyles.body, styles.subtitle]}>
              Sign up to get started with our events platform
            </Text>
          </View>

          {/* Error Message */}
          {signupError && (
            <View style={styles.errorContainer}>
              <Text style={[globalStyles.errorText, styles.errorText]}>
                {signupError}
              </Text>
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
            <InputField
              label="Full Name"
              placeholder="Enter your full name"
              {...getFieldProps("name")}
              error={touched.name ? errors.name : undefined}
              autoCapitalize="words"
              required
            />

            <InputField
              label="Email Address"
              placeholder="Enter your email"
              {...getFieldProps("email")}
              error={touched.email ? errors.email : undefined}
              autoCapitalize="none"
              keyboardType="email-address"
              required
            />

            <InputField
              label="Password"
              placeholder="Create a password"
              {...getFieldProps("password")}
              error={touched.password ? errors.password : undefined}
              secureTextEntry={!showPassword}
              required
              rightIcon={
                <TouchableOpacity
                  onPress={() => setShowPassword((prev) => !prev)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color={COLORS.textTertiary}
                  />
                </TouchableOpacity>
              }
            />

            <InputField
              label="Confirm Password"
              placeholder="Confirm your password"
              {...getFieldProps("confirmPassword")}
              error={
                touched.confirmPassword ? errors.confirmPassword : undefined
              }
              secureTextEntry={!showConfirmPassword}
              required
              rightIcon={
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword((prev) => !prev)}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-off" : "eye"}
                    size={20}
                    color={COLORS.textTertiary}
                  />
                </TouchableOpacity>
              }
            />

            <Button
              title="Create Account"
              variant="primary"
              onPress={handleFormSubmit}
              loading={isSigningUp}
              disabled={isSigningUp}
              fullWidth
              style={styles.signupButton}
            />
          </View>

          {/* Footer Links */}
          <View style={styles.footer}>
            <Text style={[globalStyles.body, styles.footerText]}>
              Already have an account?{" "}
              <Link href="/auth/login" style={styles.link}>
                Sign In
              </Link>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  content: {
    padding: SPACING.lg,
    justifyContent: "center",
    minHeight: "80%",
  },
  header: {
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  title: {
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  subtitle: {
    textAlign: "center",
    color: COLORS.textSecondary,
  },
  errorContainer: {
    backgroundColor: COLORS.error + "10",
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  errorText: {
    textAlign: "center",
  },
  form: {
    marginBottom: SPACING.xl,
  },
  passwordToggle: {
    fontSize: 18,
  },
  signupButton: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  footer: {
    alignItems: "center",
    gap: SPACING.md,
  },
  footerText: {
    textAlign: "center",
  },
  link: {
    color: COLORS.primary,
    fontWeight: "600",
  },
});
