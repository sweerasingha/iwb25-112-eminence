import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { z } from "zod";

import { Button, InputField } from "../../components";
import { useAuth, useForm } from "../../hooks";
import { globalStyles, COLORS, SPACING } from "../../theme";
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

  const {
    formData,
    errors,
    touched,
    handleChange,
    handleBlur,
    validate,
    getFieldProps,
  } = useForm<OTPFormData>(
    {
      otp: "",
    },
    otpSchema
  );

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
          email: email,
          otp: formData.otp,
        });

        if (response.success) {
          Alert.alert(
            "Registration Complete!",
            "Your account has been successfully created. You can now log in.",
            [
              {
                text: "OK",
                onPress: () => router.replace("/auth/login"),
              },
            ]
          );
        } else {
          Alert.alert(
            "Verification Failed",
            (response.error || (response as any)?.data?.message || "Invalid OTP. Please try again.") as string
          );
        }
      } catch (error: any) {
        Alert.alert(
          "Error",
          error.message || "Failed to verify OTP. Please try again."
        );
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
    } catch (error) {
      Alert.alert("Error", "Failed to resend OTP. Please try again.");
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
            <Text style={[globalStyles.h1, styles.title]}>
              Verify Your Email
            </Text>
            <Text style={[globalStyles.body, styles.subtitle]}>
              We've sent a 6-digit verification code to{"\n"}
              <Text style={styles.email}>{email || "(no email)"}</Text>
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <InputField
              label="Verification Code"
              placeholder="Enter 6-digit code"
              {...getFieldProps("otp")}
              error={touched.otp ? errors.otp : undefined}
              keyboardType="numeric"
              maxLength={6}
              autoFocus
              required
            />

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
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[globalStyles.body, styles.footerText]}>
              Didn't receive the code? Check your spam folder or{" "}
              <Text style={styles.link} onPress={handleResendOTP}>
                resend it
              </Text>
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
  email: {
    fontWeight: "600",
    color: COLORS.primary,
  },
  form: {
    marginBottom: SPACING.xl,
  },
  verifyButton: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  resendButton: {
    marginTop: SPACING.sm,
  },
  footer: {
    alignItems: "center",
  },
  footerText: {
    textAlign: "center",
    color: COLORS.textSecondary,
  },
  link: {
    color: COLORS.primary,
    fontWeight: "600",
  },
});
