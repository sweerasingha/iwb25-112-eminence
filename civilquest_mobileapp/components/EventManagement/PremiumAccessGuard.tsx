import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Button } from "../";
import { globalStyles, COLORS, SPACING } from "../../theme";

const { width } = Dimensions.get("window");

interface PremiumAccessGuardProps {
  isPremium: boolean;
  children: React.ReactNode;
}

export default function PremiumAccessGuard({
  isPremium,
  children,
}: PremiumAccessGuardProps) {
  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <View style={[globalStyles.container, styles.centered]}>
      <LinearGradient
        colors={[COLORS.primary + "20", COLORS.secondary + "20"]}
        style={styles.premiumBackground}
      >
        <View style={styles.premiumIconContainer}>
          <Ionicons name="diamond" size={64} color={COLORS.warning} />
        </View>
        <Text style={styles.accessTitle}>Premium Feature</Text>
        <Text style={styles.accessMessage}>
          Event management is only available for Premium users.
        </Text>
        <Text style={styles.accessSubmessage}>
          Upgrade to Premium to create and manage your events.
        </Text>
        <Button
          title="Upgrade to Premium"
          onPress={() => router.push("/profile/apply-premium")}
          style={styles.upgradeButton}
        />
        <Button
          title="Go Back"
          variant="outline"
          onPress={() => router.back()}
          style={styles.backButton}
        />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  premiumBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  premiumIconContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 32,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  accessTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    textAlign: "center",
  },
  accessMessage: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: SPACING.sm,
    lineHeight: 24,
    maxWidth: width * 0.8,
  },
  accessSubmessage: {
    fontSize: 14,
    color: COLORS.textTertiary,
    textAlign: "center",
    marginBottom: SPACING.xl,
    lineHeight: 20,
  },
  upgradeButton: {
    marginBottom: SPACING.md,
    minWidth: 200,
  },
  backButton: {
    marginTop: SPACING.sm,
    minWidth: 200,
  },
});
