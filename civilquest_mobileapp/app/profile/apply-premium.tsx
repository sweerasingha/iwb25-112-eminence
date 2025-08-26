import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { z } from "zod";
import { InputField, Button } from "../../components";
import { useForm } from "../../hooks";
import { globalStyles, COLORS, SPACING } from "../../theme";

// Define the form schema
const premiumApplicationSchema = z.object({
  id_photo_url: z
    .string()
    .min(1, "ID Photo URL is required")
    .url("Please enter a valid URL"),
  reason: z.string().min(10, "Reason must be at least 10 characters"),
});

type PremiumApplicationFormData = z.infer<typeof premiumApplicationSchema>;

export default function ApplyPremiumScreen() {
  const [isLoading, setIsLoading] = useState(false);

  const {
    formData,
    errors,
    touched,
    isValid,
    handleChange,
    handleBlur,
    validate,
    getFieldProps,
  } = useForm<PremiumApplicationFormData>(
    {
      id_photo_url: "",
      reason: "",
    },
    premiumApplicationSchema
  );

  const handleSubmit = async () => {
    const isValidForm = validate();
    if (isValidForm) {
      setIsLoading(true);
      try {
        

        Alert.alert("Success", "Premium application submitted successfully!");
      } catch (error) {
        Alert.alert("Error", "Failed to submit application. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text style={[globalStyles.h1, styles.title]}>Apply for Premium</Text>
          <Text style={[globalStyles.body, styles.subtitle]}>
            Fill in the details below to apply for premium access
          </Text>

          <View style={styles.form}>
            <InputField
              label="ID Photo URL"
              placeholder="Enter ID photo URL"
              {...getFieldProps("id_photo_url")}
              error={touched.id_photo_url ? errors.id_photo_url : undefined}
              autoCapitalize="none"
              keyboardType="url"
              required
            />

            <InputField
              label="Reason for Premium Access"
              placeholder="Enter your reason for premium access"
              {...getFieldProps("reason")}
              error={touched.reason ? errors.reason : undefined}
              multiline
              numberOfLines={4}
              required
            />

            <Button
              title="Submit Application"
              variant="primary"
              onPress={handleSubmit}
              loading={isLoading}
              disabled={isLoading}
              fullWidth
              style={styles.submitButton}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  content: {
    padding: SPACING.xl,
    justifyContent: "center",
    minHeight: "80%",
  },
  title: {
    textAlign: "center",
    marginBottom: SPACING.md,
    color: COLORS.textPrimary,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: SPACING.huge,
    color: COLORS.textSecondary,
  },
  form: {
    marginBottom: SPACING.xl,
  },
  submitButton: {
    marginTop: SPACING.lg,
  },
});
