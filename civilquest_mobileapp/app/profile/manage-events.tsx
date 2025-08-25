import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
  Modal,
  TextInput,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { fetchMyEvents } from "../../store/slices/eventsSlice";
import { Button } from "../../components";
import { globalStyles, COLORS, SPACING, LAYOUT } from "../../theme";
import { Event } from "../../types";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { eventService } from "../../services/event";

const { width } = Dimensions.get("window");

export default function ManageMyEventsScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { tokenUser } = useSelector((state: RootState) => state.auth);
  const { myEvents } = useSelector((state: RootState) => state.events);
  const [refreshing, setRefreshing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [sponsorsModalVisible, setSponsorsModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [loadingSponsors, setLoadingSponsors] = useState(false);
  const [sponsorActions, setSponsorActions] = useState<{
    [key: string]: boolean;
  }>({});
  const [participationActions, setParticipationActions] = useState<{
    [key: string]: boolean;
  }>({});
  const [updating, setUpdating] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    eventTitle: "",
    eventDescription: "",
    reward: "",
  });

  // Check if user is premium
  const isPremium = tokenUser?.role === "PREMIUM_USER";

  useEffect(() => {
    // Redirect non-premium users
    if (!isPremium) {
      Alert.alert(
        "Premium Feature",
        "This feature is only available for premium users. Please upgrade your account.",
        [{ text: "OK", onPress: () => router.back() }]
      );
      return;
    }

    dispatch(fetchMyEvents());
  }, [dispatch, isPremium]);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (isPremium) {
      await dispatch(fetchMyEvents());
    }
    setRefreshing(false);
  };

  const handleCreateEvent = () => {
    router.push("/events/create");
  };

  const handleEventAction = (event: Event, action: string) => {
    switch (action) {
      case "view_details":
        router.push(`/events/details?id=${event.id}`);
        break;
      case "view_sponsorships":
        router.push(`/profile/sponsorship-approval?eventId=${event.id}`);
        break;
      case "view_sponsors":
        handleFetchSponsors(event);
        break;
      case "edit":
        setSelectedEvent(event);
        setEditForm({
          eventTitle: event.eventTitle || "",
          eventDescription: event.eventDescription || "",
          reward: event.reward || "",
        });
        setEditModalVisible(true);
        break;
      case "end":
        Alert.alert(
          "End Event",
          "Are you sure you want to end this event? This action cannot be undone.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "End Event",
              style: "destructive",
              onPress: () => handleEndEvent(event.id),
            },
          ]
        );
        break;
      default:
        break;
    }
  };

  const handleUpdateEvent = async () => {
    if (!selectedEvent) return;

    try {
      setUpdating(true);
      const response = await eventService.updateEvent(
        selectedEvent.id,
        editForm
      );

      if (response.success) {
        Alert.alert("Success", "Event updated successfully");
        setEditModalVisible(false);
        setSelectedEvent(null);
        dispatch(fetchMyEvents());
      } else {
        Alert.alert("Error", response.error || "Failed to update event");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update event");
    } finally {
      setUpdating(false);
    }
  };

  const handleEndEvent = async (eventId: string) => {
    try {
      const response = await eventService.endEvent(eventId);

      if (response.success) {
        Alert.alert("Success", "Event ended successfully");
        dispatch(fetchMyEvents());
      } else {
        Alert.alert("Error", response.error || "Failed to end event");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to end event");
    }
  };

  const handleFetchSponsors = async (event: Event) => {
    try {
      setLoadingSponsors(true);
      setSelectedEvent(event);
      const response = await eventService.getEventSponsors(event.id);

      if (response.success) {
        setSponsors(response.data || []);
        setSponsorsModalVisible(true);
      } else {
        Alert.alert("Error", response.error || "Failed to fetch sponsors");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch sponsors");
    } finally {
      setLoadingSponsors(false);
    }
  };

  const handleApproveSponsor = async (sponsorId: string) => {
    try {
      setSponsorActions((prev) => ({ ...prev, [sponsorId]: true }));
      const response = await eventService.approveSponsor(sponsorId);

      if (response.success) {
        Alert.alert("Success", "Sponsor approved successfully");
        // Refresh sponsors list
        if (selectedEvent) {
          const updatedResponse = await eventService.getEventSponsors(
            selectedEvent.id
          );
          if (updatedResponse.success) {
            setSponsors(updatedResponse.data || []);
          }
        }
        // Refresh my events to update sponsor count
        dispatch(fetchMyEvents());
      } else {
        Alert.alert("Error", response.error || "Failed to approve sponsor");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to approve sponsor");
    } finally {
      setSponsorActions((prev) => ({ ...prev, [sponsorId]: false }));
    }
  };

  const handleRejectSponsor = async (sponsorId: string) => {
    Alert.alert(
      "Reject Sponsor",
      "Are you sure you want to reject this sponsorship? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: async () => {
            try {
              setSponsorActions((prev) => ({ ...prev, [sponsorId]: true }));
              const response = await eventService.rejectSponsor(sponsorId);

              if (response.success) {
                Alert.alert("Success", "Sponsor rejected successfully");
                // Refresh sponsors list
                if (selectedEvent) {
                  const updatedResponse = await eventService.getEventSponsors(
                    selectedEvent.id
                  );
                  if (updatedResponse.success) {
                    setSponsors(updatedResponse.data || []);
                  }
                }
                // Refresh my events to update sponsor count
                dispatch(fetchMyEvents());
              } else {
                Alert.alert(
                  "Error",
                  response.error || "Failed to reject sponsor"
                );
              }
            } catch (error) {
              Alert.alert("Error", "Failed to reject sponsor");
            } finally {
              setSponsorActions((prev) => ({ ...prev, [sponsorId]: false }));
            }
          },
        },
      ]
    );
  };

  const handleParticipateInEvent = async (eventId: string) => {
    try {
      setParticipationActions((prev) => ({ ...prev, [eventId]: true }));
      const response = await eventService.participateInEvent(eventId);

      if (response.success) {
        Alert.alert("Success", "Successfully participated in event");
        // Refresh my events to update participation status
        dispatch(fetchMyEvents());
      } else {
        Alert.alert(
          "Error",
          response.error || "Failed to participate in event"
        );
      }
    } catch (error) {
      Alert.alert("Error", "Failed to participate in event");
    } finally {
      setParticipationActions((prev) => ({ ...prev, [eventId]: false }));
    }
  };

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

  const renderEventCard = ({ item }: { item: Event }) => {
    return (
      <View style={styles.eventCard}>
        <LinearGradient
          colors={["#FFFFFF", "#F8F9FA"]}
          style={styles.cardGradient}
        >
          {/* Event Image */}
          <View style={styles.eventImageContainer}>
            {item.image_url ? (
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
                { backgroundColor: getStatusColor(item.status) },
              ]}
            >
              <Ionicons
                name={getStatusIcon(item.status)}
                size={12}
                color={COLORS.surface}
                style={styles.statusIcon}
              />
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>

          {/* Event Content */}
          <TouchableOpacity
            onPress={() => handleEventAction(item, "view_details")}
            activeOpacity={0.95}
            style={styles.eventContent}
          >
            <View style={styles.eventHeader}>
              <Text style={styles.eventTitle} numberOfLines={2}>
                {item.eventTitle}
              </Text>
              <Text style={styles.eventType}>{item.eventType}</Text>
            </View>

            <Text style={styles.eventDescription} numberOfLines={2}>
              {item.eventDescription}
            </Text>

            <View style={styles.eventMeta}>
              <View style={styles.metaRow}>
                <Ionicons name="location" size={16} color={COLORS.primary} />
                <Text style={styles.metaText} numberOfLines={1}>
                  {item.location}, {item.city}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Ionicons name="calendar" size={16} color={COLORS.primary} />
                <Text style={styles.metaText}>
                  {formatDate(item.date, item.startTime)}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Ionicons name="time" size={16} color={COLORS.primary} />
                <Text style={styles.metaText}>
                  {item.startTime} - {item.endTime}
                </Text>
              </View>
            </View>

            <View style={styles.eventStats}>
              <View style={styles.statItem}>
                <Ionicons name="people" size={18} color={COLORS.secondary} />
                <Text style={styles.statValue}>
                  {item.participantCount || 0}
                </Text>
                <Text style={styles.statLabel}>Participants</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="gift" size={18} color={COLORS.success} />
                <Text style={styles.statValue}>₨{item.reward}</Text>
                <Text style={styles.statLabel}>Reward</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="star" size={18} color={COLORS.warning} />
                <Text style={styles.statValue}>
                  {item.sponsor?.length || 0}
                </Text>
                <Text style={styles.statLabel}>Sponsors</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Action Buttons */}
          <View style={styles.eventActions}>
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.participateAction]}
                onPress={() => handleParticipateInEvent(item.id)}
                activeOpacity={0.8}
                disabled={participationActions[item.id]}
              >
                <Ionicons name="person-add" size={16} color={COLORS.white} />
                <Text style={styles.actionButtonText}>
                  {participationActions[item.id] ? "Joining..." : "Participate"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.sponsorAction]}
                onPress={() => handleEventAction(item, "view_sponsors")}
                activeOpacity={0.8}
              >
                <Ionicons name="gift" size={16} color={COLORS.white} />
                <Text style={styles.actionButtonText}>
                  {loadingSponsors && selectedEvent?.id === item.id
                    ? "Loading..."
                    : "Sponsors"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.editAction]}
                onPress={() => handleEventAction(item, "edit")}
                activeOpacity={0.8}
              >
                <Ionicons name="create" size={16} color={COLORS.primary} />
                <Text style={styles.editActionText}>Edit</Text>
              </TouchableOpacity>

              {(item.status as string) !== "ENDED" && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.endAction]}
                  onPress={() => handleEventAction(item, "end")}
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
  };

  if (!isPremium) {
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

  return (
    <View style={[globalStyles.container, { flex: 1 }]}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>My Events</Text>
          <Text style={styles.headerSubtitle}>
            {myEvents.data.length} event{myEvents.data.length !== 1 ? "s" : ""}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateEvent}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            style={styles.createButtonGradient}
          >
            <Ionicons name="add" size={24} color={COLORS.surface} />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {myEvents.loading === "loading" && myEvents.data.length === 0 ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your events...</Text>
        </View>
      ) : myEvents.data.length === 0 ? (
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
              Create your first event to start building your community and
              making an impact.
            </Text>
            <Button
              title="Create Your First Event"
              onPress={handleCreateEvent}
              style={styles.createFirstButton}
            />
          </LinearGradient>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <FlatList
            data={myEvents.data}
            keyExtractor={(item) => item.id}
            renderItem={renderEventCard}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={COLORS.primary}
                colors={[COLORS.primary]}
              />
            }
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      {/* Edit Event Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setEditModalVisible(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Event</Text>
            <View style={styles.modalHeaderSpace} />
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Event Title</Text>
              <TextInput
                style={styles.input}
                value={editForm.eventTitle}
                onChangeText={(text) =>
                  setEditForm((prev) => ({ ...prev, eventTitle: text }))
                }
                placeholder="Enter event title"
                placeholderTextColor={COLORS.textTertiary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Event Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editForm.eventDescription}
                onChangeText={(text) =>
                  setEditForm((prev) => ({ ...prev, eventDescription: text }))
                }
                placeholder="Enter event description"
                placeholderTextColor={COLORS.textTertiary}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Reward Points</Text>
              <TextInput
                style={styles.input}
                value={editForm.reward}
                onChangeText={(text) =>
                  setEditForm((prev) => ({ ...prev, reward: text }))
                }
                placeholder="Enter reward points"
                placeholderTextColor={COLORS.textTertiary}
                keyboardType="numeric"
              />
            </View>

            <Button
              title="Update Event"
              variant="primary"
              fullWidth
              onPress={handleUpdateEvent}
              loading={updating}
              disabled={updating}
              style={styles.updateButton}
            />
          </ScrollView>
        </View>
      </Modal>

      {/* Sponsors Modal */}
      <Modal
        visible={sponsorsModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSponsorsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setSponsorsModalVisible(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {selectedEvent?.eventTitle} - Sponsors
            </Text>
            <View style={styles.modalHeaderSpace} />
          </View>

          <ScrollView style={styles.modalContent}>
            {sponsors.length === 0 ? (
              <View style={styles.emptySponsorsContainer}>
                <Ionicons
                  name="gift-outline"
                  size={64}
                  color={COLORS.textTertiary}
                />
                <Text style={styles.emptySponsorsTitle}>No Sponsors Yet</Text>
                <Text style={styles.emptySponsorsMessage}>
                  This event doesn't have any sponsors at the moment.
                </Text>
              </View>
            ) : (
              sponsors.map((sponsor, index) => (
                <View key={index} style={styles.sponsorCard}>
                  <View style={styles.sponsorHeader}>
                    <View style={styles.sponsorIcon}>
                      <Ionicons
                        name="business"
                        size={24}
                        color={COLORS.primary}
                      />
                    </View>
                    <View style={styles.sponsorInfo}>
                      <Text style={styles.sponsorName}>
                        {sponsor.userId
                          ?.split("@")[0]
                          ?.replace(/\./g, " ")
                          .replace(/\b\w/g, (l: string) => l.toUpperCase()) ||
                          `Sponsor ${index + 1}`}
                      </Text>
                      <Text style={styles.sponsorType}>
                        {sponsor.sponsorType || "General Sponsor"} Sponsor
                      </Text>
                      <Text style={styles.sponsorEmail}>{sponsor.userId}</Text>
                    </View>
                    <View style={styles.sponsorAmount}>
                      <Text style={styles.sponsorAmountText}>
                        ₨{sponsor.amount || "0"}
                      </Text>
                    </View>
                  </View>
                  {sponsor.description && (
                    <Text style={styles.sponsorDescription}>
                      {sponsor.description}
                    </Text>
                  )}
                  <View style={styles.sponsorMeta}>
                    <View style={styles.sponsorDates}>
                      {sponsor.createdAt && (
                        <Text style={styles.sponsorDate}>
                          Applied:{" "}
                          {new Date(sponsor.createdAt).toLocaleDateString()}
                        </Text>
                      )}
                      {sponsor.updatedAt &&
                        sponsor.approvedStatus === "APPROVED" && (
                          <Text style={styles.sponsorDate}>
                            Approved:{" "}
                            {new Date(sponsor.updatedAt).toLocaleDateString()}
                          </Text>
                        )}
                    </View>
                    <View style={styles.sponsorStatus}>
                      <Text
                        style={[
                          styles.sponsorStatusText,
                          {
                            color: getStatusColor(
                              sponsor.approvedStatus || "PENDING"
                            ),
                          },
                        ]}
                      >
                        {sponsor.approvedStatus || "PENDING"}
                      </Text>
                    </View>
                  </View>

                  {/* Action buttons for pending sponsors */}
                  {sponsor.approvedStatus === "PENDING" && (
                    <View style={styles.sponsorActions}>
                      <TouchableOpacity
                        style={[
                          styles.sponsorActionButton,
                          styles.approveButton,
                        ]}
                        onPress={() => handleApproveSponsor(sponsor.id)}
                        disabled={sponsorActions[sponsor.id]}
                        activeOpacity={0.8}
                      >
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color={COLORS.white}
                        />
                        <Text style={styles.sponsorActionButtonText}>
                          {sponsorActions[sponsor.id]
                            ? "Approving..."
                            : "Approve"}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.sponsorActionButton,
                          styles.rejectButton,
                        ]}
                        onPress={() => handleRejectSponsor(sponsor.id)}
                        disabled={sponsorActions[sponsor.id]}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="close" size={16} color={COLORS.white} />
                        <Text style={styles.sponsorActionButtonText}>
                          {sponsorActions[sponsor.id]
                            ? "Rejecting..."
                            : "Reject"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: SPACING.sm,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  createButton: {
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  createButtonGradient: {
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xxl,
    paddingTop: SPACING.sm,
  },
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
  headerContent: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.backgroundSecondary,
    backgroundColor: COLORS.surface,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  modalHeaderSpace: {
    width: 32,
  },
  modalContent: {
    flex: 1,
    padding: SPACING.lg,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.backgroundSecondary,
    borderRadius: LAYOUT.borderRadius.md,
    padding: SPACING.md,
    fontSize: 16,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.surface,
    minHeight: 48,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  updateButton: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  emptySponsorsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: SPACING.xxl,
  },
  emptySponsorsTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptySponsorsMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    maxWidth: 250,
  },
  sponsorCard: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.borderRadius.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.backgroundSecondary,
  },
  sponsorHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  sponsorIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  sponsorInfo: {
    flex: 1,
  },
  sponsorName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  sponsorType: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textTransform: "capitalize",
    marginBottom: SPACING.xs,
  },
  sponsorEmail: {
    fontSize: 11,
    color: COLORS.textTertiary,
    fontStyle: "italic",
  },
  sponsorAmount: {
    backgroundColor: COLORS.success + "20",
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: LAYOUT.borderRadius.sm,
  },
  sponsorAmountText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.success,
  },
  sponsorDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  sponsorMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sponsorDates: {
    flex: 1,
  },
  sponsorDate: {
    fontSize: 11,
    color: COLORS.textTertiary,
    marginBottom: SPACING.xs,
  },
  sponsorStatus: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: LAYOUT.borderRadius.sm,
    backgroundColor: COLORS.backgroundSecondary,
  },
  sponsorStatusText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  sponsorActions: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.backgroundSecondary,
  },
  sponsorActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: LAYOUT.borderRadius.sm,
    flex: 1,
    minHeight: 40,
  },
  approveButton: {
    backgroundColor: COLORS.success,
  },
  rejectButton: {
    backgroundColor: COLORS.error,
  },
  sponsorActionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.white,
    marginLeft: SPACING.xs,
  },
});
