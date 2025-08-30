import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, SPACING } from "../../theme";
import { router } from "expo-router";

interface ManageEventsHeaderProps {
  eventsCount: number;
  onCreateEvent: () => void;
}

export default function ManageEventsHeader({
  eventsCount,
  onCreateEvent,
}: ManageEventsHeaderProps) {
  return (
    // <View style={styles.header}>
    //   {/* back btn */}
    //   <TouchableOpacity onPress={() => {}}>
    //     <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
    //   </TouchableOpacity>
    //   <View style={styles.headerContent}>
    //     <Text style={styles.headerTitle}>My Events</Text>
    //     <Text style={styles.headerSubtitle}>
    //       {eventsCount} event{eventsCount !== 1 ? "s" : ""}
    //     </Text>
    //   </View>
    //   <TouchableOpacity
    //     style={styles.createButton}
    //     onPress={onCreateEvent}
    //     activeOpacity={0.8}
    //   >
    //     <LinearGradient
    //       colors={[COLORS.primary, COLORS.primaryDark]}
    //       style={styles.createButtonGradient}
    //     >
    //       <Ionicons name="add" size={24} color={COLORS.surface} />
    //     </LinearGradient>
    //   </TouchableOpacity>
    // </View>
    <View style={styles.header}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={styles.headerContent}>
        <TouchableOpacity
          style={styles.backIconContainer}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.surface} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>My Events</Text>
          <Text style={styles.headerSubtitle}>
            Manage and track your events  
          </Text>
        </View>
        <TouchableOpacity
          style={styles.headerIcon}
          onPress={onCreateEvent}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle" size={32} color={COLORS.surface} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginHorizontal: -SPACING.md,
    marginTop: -SPACING.md,
    marginBottom: SPACING.lg,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: "hidden",
  },
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    paddingTop: SPACING.xl + 20,
  },
  backIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.surface,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.surface,
    opacity: 0.9,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
});
