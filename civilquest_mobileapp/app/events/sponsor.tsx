import React from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Redirect } from "expo-router";

import { Button, InputField, SponsorshipDropdown } from "../../components";
import { useAuth, useForm, useSponsorship } from "../../hooks";
import { globalStyles, COLORS, SPACING } from "../../theme";
import { SponsorshipFormData, sponsorshipSchema } from "../../utils/schemas";

export default function SponsorEventScreen() {
  const { eventId } = useLocalSearchParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, userEmail } = useAuth();
  const { createSponsorship, isLoading, error, clearError, getSponsorTypes } =
    useSponsorship();

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Redirect href="/auth/login" />;
  }

  const {
    formData,
    errors,
    touched,
    isValid,
    handleChange,
    handleBlur,
    validate,
    getFieldProps,
  } = useForm<SponsorshipFormData>(
    {
      sponsorType: "",
      donationAmount: "",
      donation: "",
      description: "",
    },
    sponsorshipSchema
  );

  const handleFormSubmit = async () => {
    const isValidForm = validate();
    if (isValidForm) {
      try {
        clearError();

        if (!userEmail || !eventId) {
          Alert.alert("Error", "Missing user or event information");
          return;
        }

        const success = await createSponsorship(
          userEmail,
          eventId as string,
          formData
        );

        if (success) {
          Alert.alert("Success", "Sponsorship submitted successfully!", [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ]);
        }
      } catch (err) {
        Alert.alert(
          "Submission Failed",
          "Please check your information and try again"
        );
      }
    }
  };

  const sponsorTypes = getSponsorTypes();

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
            <Text style={[globalStyles.h1, styles.title]}>Sponsor Event</Text>
            <Text style={[globalStyles.body, styles.subtitle]}>
              Submit your sponsorship details for this event
            </Text>
          </View>

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={[globalStyles.errorText, styles.errorText]}>
                {error}
              </Text>
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
            <SponsorshipDropdown
              label="Sponsor Type"
              placeholder="Select sponsor type"
              value={formData.sponsorType}
              onSelect={(value) => handleChange("sponsorType", value)}
              options={sponsorTypes}
              error={touched.sponsorType ? errors.sponsorType : undefined}
              required
            />

            <InputField
              label="Donation Amount (LKR)"
              placeholder="Enter amount (e.g., 10000.00)"
              {...getFieldProps("donationAmount")}
              error={touched.donationAmount ? errors.donationAmount : undefined}
              keyboardType="numeric"
              required
            />

            <InputField
              label="Donation Items/Services"
              placeholder="e.g., Cleaning equipment and refreshments"
              {...getFieldProps("donation")}
              error={touched.donation ? errors.donation : undefined}
              multiline
              numberOfLines={3}
              style={styles.textArea}
              required
            />

            <InputField
              label="Description"
              placeholder="e.g., Equipment and refreshment sponsorship"
              {...getFieldProps("description")}
              error={touched.description ? errors.description : undefined}
              multiline
              numberOfLines={4}
              style={styles.textArea}
              required
            />

            <Button
              title="Submit Sponsorship"
              variant="primary"
              onPress={handleFormSubmit}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
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
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  submitButton: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  debugSection: {
    margin: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007AFF",
    marginBottom: SPACING.xs,
  },
  debugText: {
    fontSize: 12,
    color: "#666",
    fontFamily: "monospace",
    lineHeight: 16,
  },
});
