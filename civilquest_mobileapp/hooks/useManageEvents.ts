import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store";
import { fetchMyEvents } from "../store/slices/eventsSlice";
import { eventService } from "../services/event";
import { Event } from "../types";

export const useManageEvents = () => {
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

  const handleParticipateInEvent = async (eventId: string) => {
    try {
      setParticipationActions((prev) => ({ ...prev, [eventId]: true }));
      const response = await eventService.participateInEvent(eventId);

      if (response.success) {
        Alert.alert("Success", "Successfully participated in event");
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

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setEditForm({
      eventTitle: event.eventTitle || "",
      eventDescription: event.eventDescription || "",
      reward: event.reward || "",
    });
    setEditModalVisible(true);
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
    Alert.alert(
      "End Event",
      "Are you sure you want to end this event? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "End Event",
          style: "destructive",
          onPress: async () => {
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
          },
        },
      ]
    );
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
        handleEditEvent(event);
        break;
      case "end":
        handleEndEvent(event.id);
        break;
      case "participate":
        handleParticipateInEvent(event.id);
        break;
      default:
        break;
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

  const handleFormChange = (field: string, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  return {
    // State
    myEvents,
    isPremium,
    refreshing,
    editModalVisible,
    sponsorsModalVisible,
    selectedEvent,
    sponsors,
    loadingSponsors,
    sponsorActions,
    participationActions,
    updating,
    editForm,

    // Actions
    handleRefresh,
    handleCreateEvent,
    handleEventAction,
    handleUpdateEvent,
    handleApproveSponsor,
    handleRejectSponsor,
    handleFormChange,
    setEditModalVisible,
    setSponsorsModalVisible,
  };
};
