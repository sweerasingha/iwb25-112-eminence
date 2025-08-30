import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, ScrollView, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { ParticipationButtons, Button, Loading } from "../../components";
import { globalStyles, COLORS, SPACING, LAYOUT, FONTS } from "../../theme";
import { Event, EventSponsor } from "types";
import { eventService } from "../../services/event";
import { useLocation } from "hooks/useLocation";

export default function EventDetailsScreen() {
  const params = useLocalSearchParams();
  const eventParam = Array.isArray(params.event)
    ? params.event[0]
    : params.event;
  const idParam = Array.isArray(params.id) ? params.id[0] : params.id;
  const initialEvent = eventParam ? JSON.parse(eventParam as string) : null;
  const [currentEvent, setCurrentEvent] = useState<Event | null>(initialEvent);
  const [loadingEvent, setLoadingEvent] = useState<boolean>(false);
  const router = useRouter();
  const { location, getCurrentLocation, errorMsg, isLoading } = useLocation();
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const idToLoad = (currentEvent?.id as string | undefined) || (idParam as string | undefined);
    if (!idToLoad) return;
    let cancelled = false;
    const load = async () => {
      setLoadingEvent(true);
      try {
        const resp = await eventService.getEventById(idToLoad);
        if (!cancelled && resp.success && resp.data) {
          setCurrentEvent(resp.data as Event);
        }
      } finally {
        if (!cancelled) setLoadingEvent(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [idParam]);

  const ev = currentEvent;
  if (!ev) {
    return (
      <View style={[globalStyles.centerContainer]}>
        <Ionicons name="alert-circle" size={48} color={COLORS.error} />
        <Text style={[globalStyles.h4, { marginTop: SPACING.md }]}>
          Event not found
        </Text>
      </View>
    );
  }
  const canParticipate = (event: Event) => {
    const now = new Date();

    const eventStart = new Date(`${event.date}T${event.startTime}:00`);
    const eventEnd = new Date(`${event.date}T${event.endTime}:00`);

    // Check if current time is between start and end
    return now >= eventStart;
  };

  const participateEvent = async () => {
    setProcessing(true);
    try {
      await getCurrentLocation();
      if (errorMsg == null) {
        console.log("location", location);
        const response = await eventService.participateInEvent({
          eventId: ev.id,
          latitude: location?.coords.latitude || 0,
          longitude: location?.coords.longitude || 0,
        });

        if (response.success) {
          Alert.alert("Success", "Successfully participated in event");
        } else {
        }
      } else {
      }
    } catch (error) {
    } finally {
      setProcessing(false);
    }
  };

  const statusConfig = getStatusConfig(ev.status);

  return (
    <View style={globalStyles.container}>
    <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View style={styles.header}>
      {ev.image_url ? (
            <View style={styles.imageWrapper}>
        <Image source={{ uri: ev.image_url }} style={styles.image} />
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
            {ev.eventTitle}
          </Text>
          <Text style={[globalStyles.bodySmall, styles.type]}>
            {ev.eventType}
          </Text>

          {/* Meta */}
          <View style={styles.meta}>
            <View style={styles.metaItem}>
              <Ionicons name="time" size={16} color={COLORS.textTertiary} />
              <Text style={[globalStyles.caption, styles.metaText]}>
                {formatDate(ev.date, ev.startTime)} — {ev.endTime}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="location" size={16} color={COLORS.textTertiary} />
              <Text style={[globalStyles.caption, styles.metaText]}>
                {ev.location}, {ev.city}
              </Text>
            </View>
          </View>

          {/* Participation quick status */}
          {ev.userApplicationStatus?.hasApplied && (
            <View style={styles.participationRow}>
              <View
                style={[
                  styles.participationBadge,
                  {
                    backgroundColor:
                      ev.userApplicationStatus.method === "WILL_JOIN"
                        ? COLORS.success
                        : COLORS.info,
                  },
                ]}
              >
                <Ionicons
                  name={
                    ev.userApplicationStatus.method === "WILL_JOIN"
                      ? "checkmark"
                      : "heart"
                  }
                  size={12}
                  color={COLORS.white}
                />
                <Text style={styles.participationText}>
                  {ev.userApplicationStatus.method === "WILL_JOIN"
                    ? "Will Join"
                    : "Interested"}
                </Text>
              </View>
              {ev.userApplicationStatus.isParticipated && (
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
            {ev.eventDescription}
          </Text>
        </View>

        {/* Stats & Reward */}
        <View style={[globalStyles.card, styles.section]}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="people" size={18} color={COLORS.primary} />
              <Text style={globalStyles.bodySmall}>
                {ev.participantCount || ev.participant?.length || 0}{" "}
                participants
              </Text>
            </View>
            {(ev.sponsors?.length ?? 0) > 0 || (ev.sponsor?.length ?? 0) > 0 ? (
              <View style={styles.statItem}>
                <Ionicons name="diamond" size={18} color={COLORS.secondary} />
                <Text style={globalStyles.bodySmall}>
                  {(ev.sponsors?.length ?? ev.sponsor?.length) || 0} sponsors
                </Text>
              </View>
    ) : null}
            {!!ev.reward && (
              <View style={styles.statItem}>
                <Ionicons name="trophy" size={18} color={COLORS.warning} />
                <Text style={globalStyles.bodySmall}>{ev.reward}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Actions */}
        {ev.status === "APPROVED" &&
          (!canParticipate(ev) ? (
            <View style={[globalStyles.card, styles.section]}>
              <Text style={[globalStyles.h5, styles.sectionTitle]}>
                Participate
              </Text>
              <ParticipationButtons
                event={ev}
                initialMethod={ev.userApplicationStatus?.method || null}
              />
              <Button
                title="Sponsor this Event"
                variant="secondary"
                fullWidth
                onPress={() =>
                  router.push(`/events/sponsor?eventId=${ev.id}`)
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

        {/* Sponsors */}
        <View style={[globalStyles.card, styles.section]}>
          <Text style={[globalStyles.h5, styles.sectionTitle]}>Sponsors</Text>
          {(ev.sponsors?.length ?? 0) > 0 ? (
            <View style={{ gap: SPACING.sm }}>
              {ev.sponsors!.map((s: EventSponsor) => (
                <View key={s._id} style={{ rowGap: 2 }}>
                  <Text style={[globalStyles.bodySmall, { fontWeight: "600" }]}>
                    {s.sponsorType === "AMOUNT"
                      ? `LKR ${s.amount ?? 0}`
                      : s.donationAmount
                      ? `Donation LKR ${s.donationAmount}`
                      : "Donation"}
                  </Text>
                  {!!s.description && (
                    <Text style={[globalStyles.caption, { color: COLORS.textSecondary }]}>
                      {s.description}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <Text style={globalStyles.bodySmall}>No sponsors for this event</Text>
          )}
        </View>

        {/* Footer info */}
        <View
          style={[
            globalStyles.card,
            styles.section,
            styles.footerInfo,
            { marginBottom: SPACING.md },
          ]}
        >
          <Text style={globalStyles.caption}>Created by</Text>
          <Text style={globalStyles.bodySmall}>{ev.createdBy}</Text>
          <Text style={[globalStyles.caption, { marginTop: SPACING.sm }]}>
            Status
          </Text>
          <Text style={globalStyles.bodySmall}>{ev.status}</Text>
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
