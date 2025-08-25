import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

import { AppliedEvent } from "../types";
import { globalStyles, COLORS, SPACING, LAYOUT } from "../theme";

export interface AppliedEventCardProps {
  appliedEvent: AppliedEvent;
  onPress?: () => void;
}

export const AppliedEventCard: React.FC<AppliedEventCardProps> = ({
  appliedEvent,
  onPress,
}) => {
  const router = useRouter();
  const { event, method, isParticipated, appliedAt } = appliedEvent;

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/events/details?id=${appliedEvent.eventId}`);
    }
  };

  const getStatusColor = () => {
    switch (event.status) {
      case "APPROVED":
        return COLORS.success;
      case "PENDING":
        return COLORS.warning;

      default:
        return COLORS.error;
    }
  };

  const getMethodIcon = () => {
    return method === "WILL_JOIN" ? "checkmark-circle" : "heart";
  };

  const getMethodColor = () => {
    return method === "WILL_JOIN" ? COLORS.success : COLORS.warning;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const time = new Date();
    time.setHours(parseInt(hours), parseInt(minutes));
    return time.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[COLORS.surface, COLORS.backgroundSecondary]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Event Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: event.image_url }} style={styles.eventImage} />
          <View style={styles.imageOverlay}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor() },
              ]}
            >
              <Text style={styles.statusText}>{event.status}</Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[globalStyles.h4, styles.title]} numberOfLines={2}>
              {event.title}
            </Text>
            <View
              style={[
                styles.methodBadge,
                { backgroundColor: getMethodColor() },
              ]}
            >
              <Ionicons name={getMethodIcon()} size={16} color={COLORS.white} />
            </View>
          </View>

          {/* Event Details */}
          <View style={styles.details}>
            <View style={styles.detailRow}>
              <Ionicons
                name="calendar-outline"
                size={16}
                color={COLORS.textSecondary}
              />
              <Text style={styles.detailText}>
                {formatDate(event.date)} • {formatTime(event.startTime)} -{" "}
                {formatTime(event.endTime)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons
                name="location-outline"
                size={16}
                color={COLORS.textSecondary}
              />
              <Text style={styles.detailText}>{event.city}</Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons
                name="gift-outline"
                size={16}
                color={COLORS.textSecondary}
              />
              <Text style={styles.detailText}>{event.reward} points</Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.appliedInfo}>
              <Text style={styles.appliedLabel}>Applied</Text>
              <Text style={styles.appliedDate}>{formatDate(appliedAt)}</Text>
            </View>

            {isParticipated && (
              <View style={styles.participatedBadge}>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={COLORS.success}
                />
                <Text style={styles.participatedText}>Participated</Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: LAYOUT.borderRadius.xl,
    ...LAYOUT.shadows.lg,
  },
  gradient: {
    borderRadius: LAYOUT.borderRadius.xl,
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
    height: 180,
  },
  eventImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "space-between",
    padding: SPACING.md,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: LAYOUT.borderRadius.sm,
  },
  statusText: {
    ...globalStyles.caption,
    color: COLORS.white,
    fontWeight: "600",
  },
  content: {
    padding: SPACING.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.md,
  },
  title: {
    flex: 1,
    marginRight: SPACING.md,
    color: COLORS.textPrimary,
  },
  methodBadge: {
    width: 32,
    height: 32,
    borderRadius: LAYOUT.borderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  details: {
    marginBottom: SPACING.lg,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  detailText: {
    ...globalStyles.bodySmall,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  appliedInfo: {
    flex: 1,
  },
  appliedLabel: {
    ...globalStyles.caption,
    color: COLORS.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  appliedDate: {
    ...globalStyles.bodySmall,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  participatedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.success + "20",
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: LAYOUT.borderRadius.sm,
  },
  participatedText: {
    ...globalStyles.caption,
    color: COLORS.success,
    fontWeight: "600",
    marginLeft: SPACING.xs,
  },
});

export default AppliedEventCard;
