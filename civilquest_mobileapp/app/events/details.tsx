import React, { useState } from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { ParticipationButtons, Button, Loading } from "../../components";
import { globalStyles, COLORS, SPACING, LAYOUT, FONTS } from "../../theme";
import { Event } from "types";
import { useManageEvents } from "hooks/useManageEvents";
import { useLocation } from "hooks/useLocation";

export default function EventDetailsScreen() {
  const params = useLocalSearchParams();
  const eventParam = Array.isArray(params.event)
    ? params.event[0]
    : params.event;
  const event = eventParam ? JSON.parse(eventParam as string) : null;
  const router = useRouter();
  const { handleParticipateInEvent } = useManageEvents();
  const { location, getCurrentLocation, errorMsg, isLoading } = useLocation();
  const [processing, setProcessing] = useState(false);

  if (!event) {
    return (
      <View style={[globalStyles.centerContainer]}>
        <Ionicons name="alert-circle" size={48} color={COLORS.error} />
        <Text style={[globalStyles.h4, { marginTop: SPACING.md }]}>
          Event not found
        </Text>
      </View>
    );
  }
  const isEventHappening = (event: Event) => {
    const now = new Date();

    const eventStart = new Date(`${event.date}T${event.startTime}:00`);
    const eventEnd = new Date(`${event.date}T${event.endTime}:00`);

    // Check if current time is between start and end
    return now >= eventStart && now <= eventEnd;
  };

  const participateEvent = async () => {
    setProcessing(true);
    await getCurrentLocation();
    if (errorMsg == null) {
      console.log("location", location);
      handleParticipateInEvent({
        eventId: event.id,
        latitude: location?.coords.latitude || 0,
        longitude: location?.coords.longitude || 0,
      });
    }
    setProcessing(false);
  };

  const statusConfig = getStatusConfig(event.status);

  return (
    <View style={globalStyles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View style={styles.header}>
          {event.image_url ? (
            <View style={styles.imageWrapper}>
              <Image source={{ uri: event.image_url }} style={styles.image} />
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.7)"]}
                style={styles.imageOverlay}
              />
              <View style={styles.headerContent}>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: statusConfig.bg },
                  ]}
                >
                  <Ionicons
                    name={statusConfig.icon as any}
                    size={14}
                    color={statusConfig.color}
                  />
                  <Text
                    style={[styles.statusText, { color: statusConfig.color }]}
                  >
                    {statusConfig.text}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={[styles.placeholderHeader]}>
              <Ionicons name="image" size={48} color={COLORS.textTertiary} />
            </View>
          )}
        </View>

        {/* Title & Type */}
        <View style={[globalStyles.card, styles.contentCard]}>
          <Text style={[globalStyles.h3, styles.title]}>
            {event.eventTitle}
          </Text>
          <Text style={[globalStyles.bodySmall, styles.type]}>
            {event.eventType}
          </Text>

          {/* Meta */}
          <View style={styles.meta}>
            <View style={styles.metaItem}>
              <Ionicons name="time" size={16} color={COLORS.textTertiary} />
              <Text style={[globalStyles.caption, styles.metaText]}>
                {formatDate(event.date, event.startTime)} — {event.endTime}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="location" size={16} color={COLORS.textTertiary} />
              <Text style={[globalStyles.caption, styles.metaText]}>
                {event.location}, {event.city}
              </Text>
            </View>
          </View>

          {/* Participation quick status */}
          {event.userApplicationStatus?.hasApplied && (
            <View style={styles.participationRow}>
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

        {/* Description */}
        <View style={[globalStyles.card, styles.section]}>
          <Text style={[globalStyles.h5, styles.sectionTitle]}>
            About this event
          </Text>
          <Text style={[globalStyles.body, styles.description]}>
            {event.eventDescription}
          </Text>
        </View>

        {/* Stats & Reward */}
        <View style={[globalStyles.card, styles.section]}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="people" size={18} color={COLORS.primary} />
              <Text style={globalStyles.bodySmall}>
                {event.participantCount || event.participant?.length || 0}{" "}
                participants
              </Text>
            </View>
            {event.sponsor?.length > 0 && (
              <View style={styles.statItem}>
                <Ionicons name="diamond" size={18} color={COLORS.secondary} />
                <Text style={globalStyles.bodySmall}>
                  {event.sponsor.length} sponsors
                </Text>
              </View>
            )}
            {!!event.reward && (
              <View style={styles.statItem}>
                <Ionicons name="trophy" size={18} color={COLORS.warning} />
                <Text style={globalStyles.bodySmall}>{event.reward}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Actions */}
        {event.status === "APPROVED" &&
          (!isEventHappening(event) ? (
            <View style={[globalStyles.card, styles.section]}>
              <Text style={[globalStyles.h5, styles.sectionTitle]}>
                Participate
              </Text>
              <ParticipationButtons
                event={event}
                initialMethod={event.userApplicationStatus?.method || null}
              />
              <Button
                title="Sponsor this Event"
                variant="secondary"
                fullWidth
                onPress={() =>
                  router.push(`/events/sponsor?eventId=${event.id}`)
                }
                style={{ marginTop: SPACING.md }}
                leftIcon={
                  <Ionicons
                    name="diamond"
                    size={18}
                    color={COLORS.background}
                  />
                }
              />
            </View>
          ) : (
            <View style={[globalStyles.card, styles.section]}>
              <Text style={styles.eventHappening}>Event is Ongoing</Text>
              <Button
                title={
                  processing ? "Processing..." : "Participate in this Event"
                }
                variant="secondary"
                fullWidth
                disabled={processing}
                onPress={participateEvent}
                style={{
                  marginTop: SPACING.md,
                  backgroundColor: COLORS.success,
                  borderColor: COLORS.success,
                }}
              />
            </View>
          ))}

        {/* Footer info */}
        <View style={[globalStyles.card, styles.section, styles.footerInfo]}>
          <Text style={globalStyles.caption}>Created by</Text>
          <Text style={globalStyles.bodySmall}>{event.createdBy}</Text>
          <Text style={[globalStyles.caption, { marginTop: SPACING.sm }]}>
            Status
          </Text>
          <Text style={globalStyles.bodySmall}>{event.status}</Text>
        </View>

        <View style={{ height: SPACING.huge }} />
      </ScrollView>
    </View>
  );
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case "APPROVED":
      return {
        color: COLORS.success,
        bg: COLORS.successBg,
        icon: "checkmark-circle",
        text: "Approved",
      } as const;
    case "PENDING":
      return {
        color: COLORS.warning,
        bg: COLORS.warningBg,
        icon: "time",
        text: "Pending",
      } as const;
    case "REJECTED":
      return {
        color: COLORS.error,
        bg: COLORS.errorBg,
        icon: "close-circle",
        text: "Rejected",
      } as const;
    default:
      return {
        color: COLORS.textTertiary,
        bg: COLORS.backgroundSecondary,
        icon: "help-circle",
        text: status,
      } as const;
  }
};

const formatDate = (date: string, startTime: string) => {
  try {
    return new Date(`${date}T${startTime}`).toLocaleString();
  } catch {
    return `${date} ${startTime}`;
  }
};

const styles = StyleSheet.create({
  header: {
    width: "100%",
    height: 220,
    backgroundColor: COLORS.surface,
  },
  imageWrapper: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
  },
  headerContent: {
    position: "absolute",
    right: SPACING.xl,
    top: SPACING.xl,
  },
  placeholderHeader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: LAYOUT.borderRadius.full,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: SPACING.sm,
    textTransform: "capitalize",
  },
  contentCard: {
    marginTop: -SPACING.xl,
    marginHorizontal: SPACING.xl,
  },
  title: {
    marginBottom: SPACING.xs,
  },
  type: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  meta: {
    marginTop: SPACING.lg,
    gap: SPACING.md,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  metaText: {
    color: COLORS.textTertiary,
  },
  participationRow: {
    flexDirection: "row",
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  participationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: LAYOUT.borderRadius.lg,
  },
  participationText: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: "700",
  },
  section: {
    marginTop: SPACING.lg,
    marginHorizontal: SPACING.xl,
  },
  sectionTitle: {
    marginBottom: SPACING.sm,
  },
  description: {
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACING.lg,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  footerInfo: {
    backgroundColor: COLORS.surface,
  },
  eventHappening: {
    textAlign: "center",
    color: COLORS.success,
    fontSize: FONTS.sizes.lg,
    fontWeight: "700",
    padding: SPACING.md,
  },
});
