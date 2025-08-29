import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Animated,
  Image,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { z } from "zod";

import { Button, InputField, Loading } from "../../components";
import { useForm } from "../../hooks";
import { globalStyles, COLORS, SPACING, LAYOUT } from "../../theme";
import { api } from "../../services/api";

const otpSchema = z.object({
  otp: z
    .string()
    .min(1, "OTP is required")
    .length(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});

type OTPFormData = z.infer<typeof otpSchema>;

export default function OTPVerificationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string | string[] }>();
  const email = Array.isArray(params.email)
    ? params.email[0]
    : params.email || "";

  const [isVerifying, setIsVerifying] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

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
    validate,
    getFieldProps,
  } = useForm<OTPFormData>({ otp: "" }, otpSchema);

  const handleOTPSubmit = async () => {
    const isValidForm = validate();
    if (!email) {
      Alert.alert(
        "Missing email",
        "Email is required for verification. Please restart signup.",
        [{ text: "Go to Sign Up", onPress: () => router.replace("/auth/signup") }]
      );
      return;
    }
    if (isValidForm) {
      setIsVerifying(true);
      try {
        const response = await api.post("/auth/register/complete", {
          email,
          otp: formData.otp,
        });

        if (response.success) {
          Alert.alert("Success", "Your account has been created!", [
            { text: "OK", onPress: () => router.replace("/auth/login") },
          ]);
        } else {
          Alert.alert(
            "Verification Failed",
            response.error ||
              (response as any)?.data?.message ||
              "Invalid OTP. Please try again."
          );
        }
      } catch (error: any) {
        Alert.alert("Error", error.message || "Something went wrong.");
      } finally {
        setIsVerifying(false);
      }
    }
  };

  const handleResendOTP = async () => {
    try {
      if (!email) {
        Alert.alert("Missing email", "Please go back and enter your email.");
        return;
      }
      await api.post("/auth/register/init", { email });
      Alert.alert("OTP Resent", "A new OTP has been sent to your email.");
    } catch {
      Alert.alert("Error", "Failed to resend OTP. Please try again.");
    }
  };

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
              Secure Account Verification
            </Text>
          </View>

          {/* OTP Card */}
          <View style={styles.formCard}>
            {/* Header */}
            <View style={styles.formHeader}>
              <Text style={[globalStyles.h2, styles.title]}>
                Verify Your Email
              </Text>
              <Text style={[globalStyles.body, styles.subtitle]}>
                Enter the 6-digit code sent to{" "}
                <Text style={styles.email}>{email || "(no email)"}</Text>
              </Text>
            </View>

            {/* Input */}
            <InputField
              label="Verification Code"
              placeholder="Enter 6-digit code"
              {...getFieldProps("otp")}
              error={touched.otp ? errors.otp : undefined}
              keyboardType="numeric"
              maxLength={6}
              required
              variant="filled"
            />

            {/* Buttons */}
            <Button
              title="Verify & Complete Registration"
              variant="primary"
              onPress={handleOTPSubmit}
              loading={isVerifying}
              disabled={isVerifying}
              fullWidth
              style={styles.verifyButton}
            />

            <Button
              title="Resend Code"
              variant="ghost"
              onPress={handleResendOTP}
              fullWidth
              style={styles.resendButton}
            />

            {/* Footer */}
            <Text style={[globalStyles.body, styles.footerText]}>
              Didn’t receive the code?{" "}
              <Text style={styles.link} onPress={handleResendOTP}>
                Resend
              </Text>
            </Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Loading Overlay */}
      <Loading
        visible={isVerifying}
        message="Verifying your account..."
        variant="overlay"
        fullScreen
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
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

  // OTP Card
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
  email: {
    fontWeight: "600",
    color: COLORS.primary,
  },

  verifyButton: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  resendButton: {
    marginBottom: SPACING.lg,
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
