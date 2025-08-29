import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Button } from "../";
import { COLORS, SPACING } from "../../theme";

const { width } = Dimensions.get("window");

interface EmptyEventsStateProps {
  onCreateEvent: () => void;
}

export function EmptyEventsState({ onCreateEvent }: EmptyEventsStateProps) {
  return (
    <View style={styles.emptyState}>
      <LinearGradient
        colors={[COLORS.surface, COLORS.background]}
        style={styles.emptyStateGradient}
      >
        <View style={styles.emptyIconContainer}>
          <Ionicons
            name="calendar-outline"
            size={80}
            color={COLORS.textTertiary}
          />
        </View>
        <Text style={styles.emptyTitle}>No Events Yet</Text>
        <Text style={styles.emptyMessage}>
          Create your first event to start building your community and making an
          impact.
        </Text>
        <Button
          title="Create Your First Event"
          onPress={onCreateEvent}
          style={styles.createFirstButton}
        />
      </LinearGradient>
    </View>
  );
}

interface LoadingStateProps {}

export function LoadingState({}: LoadingStateProps) {
  return (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>Loading your events...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
    borderRadius: 20,
    width: "100%",
  },
  emptyIconContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 32,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textAlign: "center",
  },
  emptyMessage: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: SPACING.xl,
    lineHeight: 24,
    maxWidth: width * 0.8,
  },
  createFirstButton: {
    marginTop: SPACING.md,
    minWidth: 200,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});
