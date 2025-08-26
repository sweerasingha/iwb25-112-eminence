import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Event } from "../../types";
import { globalStyles, COLORS, SPACING, LAYOUT } from "../../theme";

interface EventCardProps {
  event: Event;
  onPress: () => void;
  variant?: "default" | "featured" | "compact";
}

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - SPACING.xl * 2;

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onPress,
  variant = "default",
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "APPROVED":
        return {
          color: COLORS.success,
          bg: COLORS.successBg,
          icon: "checkmark-circle",
          text: "Approved",
        };
      case "PENDING":
        return {
          color: COLORS.warning,
          bg: COLORS.warningBg,
          icon: "time",
          text: "Pending",
        };
      case "REJECTED":
        return {
          color: COLORS.error,
          bg: COLORS.errorBg,
          icon: "close-circle",
          text: "Rejected",
        };
      default:
        return {
          color: COLORS.textTertiary,
          bg: COLORS.backgroundSecondary,
          icon: "help-circle",
          text: status,
        };
    }
  };

  const statusConfig = getStatusConfig(event.status);

  const renderCompactCard = () => (
    <TouchableOpacity
      style={[styles.container, styles.compactContainer]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.compactContent}>
        <View style={styles.compactInfo}>
          <Text
            style={[globalStyles.h5, styles.compactTitle]}
            numberOfLines={1}
          >
            {event.eventTitle}
          </Text>
          <Text style={[globalStyles.bodySmall, styles.compactDate]}>
            {formatDate(event.date + "T" + event.startTime)}
          </Text>
        </View>

        <View
          style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}
        >
          <Ionicons
            name={statusConfig.icon as any}
            size={12}
            color={statusConfig.color}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFeaturedCard = () => (
    <TouchableOpacity
      style={[styles.container, styles.featuredContainer]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {event.image_url && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: event.image_url }}
            style={styles.featuredImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.7)"]}
            style={styles.imageOverlay}
          />
          <View style={styles.imageContent}>
            <View
              style={[
                styles.statusBadge,
                styles.imageStatusBadge,
                { backgroundColor: statusConfig.bg },
              ]}
            >
              <Ionicons
                name={statusConfig.icon as any}
                size={14}
                color={statusConfig.color}
              />
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.text}
              </Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.featuredContent}>
        <View style={styles.header}>
          <Text style={[globalStyles.h4, styles.title]} numberOfLines={2}>
            {event.eventTitle}
          </Text>
          <Text style={[globalStyles.bodySmall, styles.type]}>
            {event.eventType}
          </Text>
        </View>

        <Text style={[globalStyles.body, styles.description]} numberOfLines={2}>
          {event.eventDescription}
        </Text>

        <View style={styles.metaInfo}>
          <View style={styles.metaItem}>
            <Ionicons name="location" size={16} color={COLORS.textTertiary} />
            <Text
              style={[globalStyles.caption, styles.metaText]}
              numberOfLines={1}
            >
              {event.location}, {event.city}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Ionicons name="time" size={16} color={COLORS.textTertiary} />
            <Text style={[globalStyles.caption, styles.metaText]}>
              {formatDate(event.date + "T" + event.startTime)}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Ionicons name="people" size={16} color={COLORS.primary} />
              <Text style={[globalStyles.caption, styles.statText]}>
                {event.participantCount || event.participant.length}
              </Text>
            </View>

            {event.sponsor.length > 0 && (
              <View style={styles.statItem}>
                <Ionicons name="diamond" size={16} color={COLORS.secondary} />
                <Text style={[globalStyles.caption, styles.statText]}>
                  {event.sponsor.length}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.reward}>
            <Ionicons name="trophy" size={16} color={COLORS.warning} />
            <Text style={[globalStyles.caption, styles.rewardText]}>
              {event.reward}
            </Text>
          </View>
        </View>

        {event.userApplicationStatus?.hasApplied && (
          <View style={styles.participationStatus}>
            <View
              style={[
                styles.participationBadge,
                {
                  backgroundColor:
                    event.userApplicationStatus.method === "WILL_JOIN"
                      ? COLORS.success
                      : COLORS.info,
                },
              ]}
            >
              <Ionicons
                name={
                  event.userApplicationStatus.method === "WILL_JOIN"
                    ? "checkmark"
                    : "heart"
                }
                size={12}
                color={COLORS.white}
              />
              <Text style={styles.participationText}>
                {event.userApplicationStatus.method === "WILL_JOIN"
                  ? "Joining"
                  : "Interested"}
              </Text>
            </View>
            {event.userApplicationStatus.isParticipated && (
              <View
                style={[
                  styles.participationBadge,
                  { backgroundColor: COLORS.primary },
                ]}
              >
                <Ionicons name="trophy" size={12} color={COLORS.white} />
                <Text style={styles.participationText}>Participated</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderDefaultCard = () => (
    <TouchableOpacity
      style={[styles.container, styles.defaultContainer]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {event.image_url && (
        <Image
          source={{ uri: event.image_url }}
          style={styles.image}
          resizeMode="cover"
        />
      )}

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={[globalStyles.h4, styles.title]} numberOfLines={2}>
              {event.eventTitle}
            </Text>
            <Text style={[globalStyles.bodySmall, styles.type]}>
              {event.eventType}
            </Text>
          </View>

          <View
            style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}
          >
            <Ionicons
              name={statusConfig.icon as any}
              size={12}
              color={statusConfig.color}
            />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.text}
            </Text>
          </View>
        </View>

        <Text style={[globalStyles.body, styles.description]} numberOfLines={2}>
          {event.eventDescription}
        </Text>

        <View style={styles.metaInfo}>
          <View style={styles.metaItem}>
            <Ionicons name="location" size={14} color={COLORS.textTertiary} />
            <Text
              style={[globalStyles.caption, styles.metaText]}
              numberOfLines={1}
            >
              {event.location}, {event.city}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Ionicons name="time" size={14} color={COLORS.textTertiary} />
            <Text style={[globalStyles.caption, styles.metaText]}>
              {formatDate(event.date + "T" + event.startTime)}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.stats}>
            <Text style={[globalStyles.caption, styles.statText]}>
              👥 {event.participantCount || event.participant.length}
            </Text>
            {event.sponsor.length > 0 && (
              <Text style={[globalStyles.caption, styles.statText]}>
                {event.sponsor.length}
              </Text>
            )}
          </View>

          <Text style={[globalStyles.caption, styles.rewardText]}>
            {event.reward}
          </Text>
        </View>

        {event.userApplicationStatus?.hasApplied && (
          <View style={styles.participationStatus}>
            <View
              style={[
                styles.participationBadge,
                {
                  backgroundColor:
                    event.userApplicationStatus.method === "WILL_JOIN"
                      ? COLORS.success
                      : COLORS.info,
                },
              ]}
            >
              <Text style={styles.participationText}>
                {event.userApplicationStatus.method === "WILL_JOIN"
                  ? " Joining"
                  : " Interested"}
              </Text>
            </View>
            {event.userApplicationStatus.isParticipated && (
              <View
                style={[
                  styles.participationBadge,
                  { backgroundColor: COLORS.primary },
                ]}
              >
                <Text style={styles.participationText}> Participated</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (variant === "compact") return renderCompactCard();
  if (variant === "featured") return renderFeaturedCard();
  return renderDefaultCard();
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.borderRadius.xl,
    marginBottom: SPACING.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...LAYOUT.shadows.sm,
  },

  // Default variant
  defaultContainer: {
    width: CARD_WIDTH,
  },

  // Featured variant
  featuredContainer: {
    width: CARD_WIDTH + SPACING.lg,
    ...LAYOUT.shadows.md,
  },

  // Compact variant
  compactContainer: {
    width: CARD_WIDTH,
    padding: SPACING.lg,
  },
  compactContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  compactInfo: {
    flex: 1,
  },
  compactTitle: {
    marginBottom: SPACING.sm,
  },
  compactDate: {
    color: COLORS.textTertiary,
  },

  // Image styles
  imageContainer: {
    position: "relative",
    height: 200,
  },
  image: {
    width: "100%",
    height: 160,
  },
  featuredImage: {
    width: "100%",
    height: 200,
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  imageContent: {
    position: "absolute",
    top: SPACING.lg,
    right: SPACING.lg,
  },
  imageStatusBadge: {
    backgroundColor: COLORS.glass,
  },

  // Content styles
  content: {
    padding: SPACING.xl,
  },
  featuredContent: {
    padding: SPACING.xxl,
  },

  header: {
    marginBottom: SPACING.lg,
  },
  titleContainer: {
    flex: 1,
    marginRight: SPACING.md,
  },
  title: {
    marginBottom: SPACING.sm,
    color: COLORS.textPrimary,
  },
  type: {
    color: COLORS.primary,
    fontWeight: "600",
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: LAYOUT.borderRadius.full,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: SPACING.sm,
    textTransform: "capitalize",
  },

  description: {
    marginBottom: SPACING.lg,
    lineHeight: 22,
    color: COLORS.textSecondary,
  },

  metaInfo: {
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  metaText: {
    flex: 1,
    color: COLORS.textTertiary,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },

  stats: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.lg,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  statText: {
    color: COLORS.textTertiary,
    fontWeight: "500",
  },

  reward: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  rewardText: {
    color: COLORS.warning,
    fontWeight: "600",
  },

  participationStatus: {
    flexDirection: "row",
    marginTop: SPACING.lg,
    gap: SPACING.md,
  },
  participationBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: LAYOUT.borderRadius.lg,
    gap: SPACING.sm,
  },
  participationText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.white,
  },
});

export default EventCard;
