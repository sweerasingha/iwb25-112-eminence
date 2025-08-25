import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { z } from "zod";

import { Button, InputField } from "../../components";
import { useForm } from "../../hooks";
import { globalStyles, COLORS, SPACING } from "../../theme";
import { api } from "../../services/api";

const emailSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email"),
});

const resetSchema = z.object({
  otp: z
    .string()
    .min(1, "OTP is required")
    .length(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
});

type EmailFormData = z.infer<typeof emailSchema>;
type ResetFormData = z.infer<typeof resetSchema>;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Email form
  const emailForm = useForm<EmailFormData>({ email: "" }, emailSchema);

  // Reset form
  const resetForm = useForm<ResetFormData>(
    { otp: "", newPassword: "" },
    resetSchema
  );

  const handleEmailSubmit = async () => {
    const isValidForm = emailForm.validate();
    if (isValidForm) {
      setIsLoading(true);
      setError(null);

      try {
        const response = await api.post("/auth/password/reset/request", {
          email: emailForm.formData.email,
        });

        if (response.success) {
          setEmail(emailForm.formData.email);
          setStep("reset");
          Alert.alert(
            "OTP Sent",
            `A password reset code has been sent to ${emailForm.formData.email}`
          );
        } else {
          setError(
            response.error || "Failed to send reset code. Please try again."
          );
        }
      } catch (err: any) {
        setError(err.message || "Failed to send reset code. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleResetSubmit = async () => {
    const isValidForm = resetForm.validate();
    if (isValidForm) {
      setIsLoading(true);
      setError(null);

      try {
        const response = await api.post("/auth/password/reset/verify", {
          email: email,
          otp: resetForm.formData.otp,
          newPassword: resetForm.formData.newPassword,
        });

        if (response.success) {
          Alert.alert(
            "Password Reset Successful",
            "Your password has been reset successfully. You can now log in with your new password.",
            [
              {
                text: "OK",
                onPress: () => router.replace("/auth/login"),
              },
            ]
          );
        } else {
          setError(
            response.error || "Failed to reset password. Please try again."
          );
        }
      } catch (err: any) {
        setError(err.message || "Failed to reset password. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleResendOTP = async () => {
    try {
      const response = await api.post("/auth/password/reset/request", {
        email: email,
      });

      if (response.success) {
        Alert.alert(
          "OTP Resent",
          "A new password reset code has been sent to your email."
        );
      } else {
        Alert.alert("Error", "Failed to resend OTP. Please try again.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to resend OTP. Please try again.");
    }
  };

  const renderEmailStep = () => (
    <>
      <View style={styles.header}>
        <Text style={[globalStyles.h1, styles.title]}>Reset Password</Text>
        <Text style={[globalStyles.body, styles.subtitle]}>
          Enter your email address and we'll send you a code to reset your
          password
        </Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={[globalStyles.errorText, styles.errorText]}>
            {error}
          </Text>
        </View>
      )}

      <View style={styles.form}>
        <InputField
          label="Email Address"
          placeholder="Enter your email"
          {...emailForm.getFieldProps("email")}
          error={emailForm.touched.email ? emailForm.errors.email : undefined}
          autoCapitalize="none"
          keyboardType="email-address"
          autoFocus
          required
        />

        <Button
          title="Send Reset Code"
          variant="primary"
          onPress={handleEmailSubmit}
          loading={isLoading}
          disabled={isLoading}
          fullWidth
          style={styles.submitButton}
        />
      </View>
    </>
  );

  const renderResetStep = () => (
    <>
      <View style={styles.header}>
        <Text style={[globalStyles.h1, styles.title]}>Enter Reset Code</Text>
        <Text style={[globalStyles.body, styles.subtitle]}>
          We've sent a 6-digit code to{"\n"}
          <Text style={styles.email}>{email}</Text>
        </Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={[globalStyles.errorText, styles.errorText]}>
            {error}
          </Text>
        </View>
      )}

      <View style={styles.form}>
        <InputField
          label="Reset Code"
          placeholder="Enter 6-digit code"
          {...resetForm.getFieldProps("otp")}
          error={resetForm.touched.otp ? resetForm.errors.otp : undefined}
          keyboardType="numeric"
          maxLength={6}
          autoFocus
          required
        />

        <InputField
          label="New Password"
          placeholder="Enter new password"
          {...resetForm.getFieldProps("newPassword")}
          error={
            resetForm.touched.newPassword
              ? resetForm.errors.newPassword
              : undefined
          }
          secureTextEntry
          required
        />

        <Button
          title="Reset Password"
          variant="primary"
          onPress={handleResetSubmit}
          loading={isLoading}
          disabled={isLoading}
          fullWidth
          style={styles.submitButton}
        />

        <Button
          title="Resend Code"
          variant="ghost"
          onPress={handleResendOTP}
          fullWidth
          style={styles.resendButton}
        />
      </View>
    </>
  );

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
          {step === "email" ? renderEmailStep() : renderResetStep()}

          <View style={styles.footer}>
            <Text style={[globalStyles.body, styles.footerText]}>
              Remember your password?{" "}
              <Text style={styles.link} onPress={() => router.back()}>
                Back to Login
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
  submitButton: {
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
