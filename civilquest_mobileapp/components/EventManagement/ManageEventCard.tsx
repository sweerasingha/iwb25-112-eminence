import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, SPACING, LAYOUT } from "../../theme";
import { Event } from "../../types";

const { width } = Dimensions.get("window");

interface ManageEventCardProps {
  event: Event;
  onEventAction: (event: Event, action: string) => void;
  participationActions: { [key: string]: boolean };
  loadingSponsors: boolean;
  selectedEventId?: string;
}

export default function ManageEventCard({
  event,
  onEventAction,
  participationActions,
  loadingSponsors,
  selectedEventId,
}: ManageEventCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return COLORS.success;
      case "PENDING":
        return COLORS.warning;
      case "REJECTED":
        return COLORS.error;
      case "ENDED":
        return COLORS.textTertiary;
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "checkmark-circle";
      case "PENDING":
        return "time";
      case "REJECTED":
        return "close-circle";
      case "ENDED":
        return "flag";
      default:
        return "help-circle";
    }
  };

  const formatDate = (dateString: string, timeString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today at ${timeString}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow at ${timeString}`;
    } else {
      return `${date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} at ${timeString}`;
    }
  };

  return (
    <View style={styles.eventCard}>
      <LinearGradient
        colors={["#FFFFFF", "#F8F9FA"]}
        style={styles.cardGradient}
      >
        {/* Event Image */}
        <View style={styles.eventImageContainer}>
          {event.image_url ? (
            <View style={styles.eventImage}>
              <Ionicons name="image" size={40} color={COLORS.textTertiary} />
            </View>
          ) : (
            <View style={styles.eventImagePlaceholder}>
              <Ionicons name="camera" size={40} color={COLORS.textTertiary} />
              <Text style={styles.noImageText}>No Image</Text>
            </View>
          )}

          {/* Status Badge */}
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(event.status) },
            ]}
          >
            <Ionicons
              name={getStatusIcon(event.status)}
              size={12}
              color={COLORS.surface}
              style={styles.statusIcon}
            />
            <Text style={styles.statusText}>{event.status}</Text>
          </View>
        </View>

        {/* Event Content */}
        <TouchableOpacity
          onPress={() => onEventAction(event, "view_details")}
          activeOpacity={0.95}
          style={styles.eventContent}
        >
          <View style={styles.eventHeader}>
            <Text style={styles.eventTitle} numberOfLines={2}>
              {event.eventTitle}
            </Text>
            <Text style={styles.eventType}>{event.eventType}</Text>
          </View>

          <Text style={styles.eventDescription} numberOfLines={2}>
            {event.eventDescription}
          </Text>

          <View style={styles.eventMeta}>
            <View style={styles.metaRow}>
              <Ionicons name="location" size={16} color={COLORS.primary} />
              <Text style={styles.metaText} numberOfLines={1}>
                {event.location}, {event.city}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="calendar" size={16} color={COLORS.primary} />
              <Text style={styles.metaText}>
                {formatDate(event.date, event.startTime)}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="time" size={16} color={COLORS.primary} />
              <Text style={styles.metaText}>
                {event.startTime} - {event.endTime}
              </Text>
            </View>
          </View>

          <View style={styles.eventStats}>
            <View style={styles.statItem}>
              <Ionicons name="people" size={18} color={COLORS.secondary} />
              <Text style={styles.statValue}>
                {event.participantCount || 0}
              </Text>
              <Text style={styles.statLabel}>Participants</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="gift" size={18} color={COLORS.success} />
              <Text style={styles.statValue}>₨{event.reward}</Text>
              <Text style={styles.statLabel}>Reward</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="star" size={18} color={COLORS.warning} />
              <Text style={styles.statValue}>{event.sponsor?.length || 0}</Text>
              <Text style={styles.statLabel}>Sponsors</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.eventActions}>
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.participateAction]}
              onPress={() => onEventAction(event, "participate")}
              activeOpacity={0.8}
              disabled={participationActions[event.id]}
            >
              <Ionicons name="person-add" size={16} color={COLORS.white} />
              <Text style={styles.actionButtonText}>
                {participationActions[event.id] ? "Joining..." : "Participate"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.sponsorAction]}
              onPress={() => onEventAction(event, "view_sponsors")}
              activeOpacity={0.8}
            >
              <Ionicons name="gift" size={16} color={COLORS.white} />
              <Text style={styles.actionButtonText}>
                {loadingSponsors && selectedEventId === event.id
                  ? "Loading..."
                  : "Sponsors"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editAction]}
              onPress={() => onEventAction(event, "edit")}
              activeOpacity={0.8}
            >
              <Ionicons name="create" size={16} color={COLORS.primary} />
              <Text style={styles.editActionText}>Edit</Text>
            </TouchableOpacity>

            {(event.status as string) !== "ENDED" && (
              <TouchableOpacity
                style={[styles.actionButton, styles.endAction]}
                onPress={() => onEventAction(event, "end")}
                activeOpacity={0.8}
              >
                <Ionicons name="stop-circle" size={16} color={COLORS.error} />
                <Text style={styles.endActionText}>End</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  eventCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    marginBottom: SPACING.lg,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  cardGradient: {
    padding: SPACING.md,
  },
  eventImageContainer: {
    position: "relative",
    height: 120,
    marginBottom: SPACING.md,
  },
  eventImage: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: LAYOUT.borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  eventImagePlaceholder: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: LAYOUT.borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  noImageText: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
  },
  eventContent: {
    padding: SPACING.md,
  },
  eventHeader: {
    marginBottom: SPACING.md,
  },
  eventTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginRight: SPACING.sm,
    lineHeight: 26,
  },
  eventType: {
    fontSize: 14,
    color: COLORS.textTertiary,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  eventDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  statusBadge: {
    position: "absolute",
    top: SPACING.sm,
    right: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    minWidth: 80,
    alignItems: "center",
    flexDirection: "row",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.surface,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statusIcon: {
    marginRight: SPACING.xs,
  },
  eventMeta: {
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    marginLeft: SPACING.sm,
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
  },
  eventStats: {
    flexDirection: "row",
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
    marginVertical: SPACING.md,
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.border,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginVertical: SPACING.xs,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  eventActions: {
    flexDirection: "column",
    gap: SPACING.sm,
  },
  actionRow: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 12,
    flex: 1,
    justifyContent: "center",
    minHeight: 44,
  },
  sponsorAction: {
    backgroundColor: COLORS.primary,
  },
  participateAction: {
    backgroundColor: COLORS.secondary,
  },
  editAction: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  endAction: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.error,
    minWidth: 44,
    paddingHorizontal: SPACING.sm,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.white,
    marginLeft: SPACING.xs,
  },
  editActionText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  endActionText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.error,
    marginLeft: SPACING.xs,
  },
});
