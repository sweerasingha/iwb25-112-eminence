import { useAppSelector, useAppDispatch } from "../store";
import {
  fetchEvents,
  fetchEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  fetchMyEvents,
  fetchAppliedEvents,
  clearCurrentEvent,
  setFilters,
  clearFilters,
  clearEventsError,
} from "../store/slices/eventsSlice";
import { CreateEventForm, EventStatus, ID } from "../types";
import { useCallback } from "react";

export const useEvents = () => {
  const dispatch = useAppDispatch();
  const events = useAppSelector((state) => state.events);
  const userRole = useAppSelector((state) => state.auth.tokenUser?.role);

  const loadEvents = useCallback(
    async (params: { page?: number; limit?: number } = {}) => {
      const result = await dispatch(fetchEvents(params));
      return result.meta.requestStatus === "fulfilled";
    },
    [dispatch]
  );

  const loadEventById = useCallback(
    async (eventId: ID) => {
      const result = await dispatch(fetchEventById(eventId));
      return result.meta.requestStatus === "fulfilled";
    },
    [dispatch]
  );

  const createNewEvent = useCallback(
    async (eventData: CreateEventForm) => {
      const result = await dispatch(createEvent(eventData));
      return result.meta.requestStatus === "fulfilled";
    },
    [dispatch]
  );

  const updateExistingEvent = useCallback(
    async (eventId: ID, eventData: Partial<CreateEventForm>) => {
      const result = await dispatch(updateEvent({ eventId, eventData }));
      return result.meta.requestStatus === "fulfilled";
    },
    [dispatch]
  );

  const removeEvent = useCallback(
    async (eventId: ID) => {
      const result = await dispatch(deleteEvent(eventId));
      return result.meta.requestStatus === "fulfilled";
    },
    [dispatch]
  );

  const loadMyEvents = useCallback(async () => {
    const result = await dispatch(fetchMyEvents());
    return result.meta.requestStatus === "fulfilled";
  }, [dispatch]);

  const loadAppliedEvents = useCallback(async () => {
    const result = await dispatch(fetchAppliedEvents());
    return result.meta.requestStatus === "fulfilled";
  }, [dispatch]);

  const clearCurrentEventData = useCallback(() => {
    dispatch(clearCurrentEvent());
  }, [dispatch]);

  const updateFilters = useCallback(
    (filters: {
      status?: EventStatus | "all";
      search?: string;
      type?: string;
      city?: string;
    }) => {
      dispatch(setFilters(filters));
    },
    [dispatch]
  );

  const resetFilters = useCallback(() => {
    dispatch(clearFilters());
  }, [dispatch]);

  const clearErrors = useCallback(() => {
    dispatch(clearEventsError());
  }, [dispatch]);

  // Selectors with filters applied
  const getFilteredEvents = useCallback(() => {
    const eventsData = events.events.data || [];

    if (!Array.isArray(eventsData) || eventsData.length === 0) {
      return [];
    }

    let filtered = [...eventsData];

    if (events.filters.status && events.filters.status !== "all") {
      filtered = filtered.filter(
        (event) => event.status === events.filters.status
      );
    } else {
      if (userRole !== "ADMIN") {
        filtered = filtered.filter((event) => event.status === "APPROVED");
      }
    }

    // Apply search filter
    if (events.filters.search) {
      const searchTerm = events.filters.search.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.eventTitle.toLowerCase().includes(searchTerm) ||
          event.eventDescription.toLowerCase().includes(searchTerm) ||
          event.eventType.toLowerCase().includes(searchTerm) ||
          event.location.toLowerCase().includes(searchTerm) ||
          event.city.toLowerCase().includes(searchTerm)
      );
    }

    // Apply type filter
    if (events.filters.type) {
      filtered = filtered.filter(
        (event) => event.eventType === events.filters.type
      );
    }

    // Apply city filter
    if (events.filters.city) {
      filtered = filtered.filter((event) => event.city === events.filters.city);
    }

    return filtered;
  }, [events.events.data, events.filters]);

  const getEventTypes = useCallback(() => {
    const eventsData = events.events.data || [];

    if (!Array.isArray(eventsData) || eventsData.length === 0) {
      return [];
    }

    const source =
      events.filters.status && events.filters.status !== "all"
        ? eventsData.filter((e) => e.status === events.filters.status)
        : userRole === "ADMIN"
        ? eventsData
        : eventsData.filter((e) => e.status === "APPROVED");

    const types = new Set(source.map((event) => event.eventType));
    return Array.from(types);
  }, [events.events.data, events.filters.status, userRole]);

  const getCities = useCallback(() => {
    const eventsData = events.events.data || [];

    if (!Array.isArray(eventsData) || eventsData.length === 0) {
      return [];
    }

    const source =
      events.filters.status && events.filters.status !== "all"
        ? eventsData.filter((e) => e.status === events.filters.status)
        : userRole === "ADMIN"
        ? eventsData
        : eventsData.filter((e) => e.status === "APPROVED");
    const cities = new Set(source.map((event) => event.city));
    return Array.from(cities).sort();
  }, [events.events.data, events.filters.status, userRole]);

  return {
    // State
    events: events.events.data || [],
    filteredEvents: getFilteredEvents(),
    myEvents: events.myEvents.data || [],
    appliedEvents: events.appliedEvents.data || [],
    currentEvent: events.currentEvent.data,
    filters: events.filters,
    eventTypes: getEventTypes(),
    cities: getCities(),

    // Loading states
    isLoadingEvents: events.events.loading === "loading",
    isLoadingMyEvents: events.myEvents.loading === "loading",
    isLoadingAppliedEvents: events.appliedEvents.loading === "loading",
    isLoadingCurrentEvent: events.currentEvent.loading === "loading",

    // Error states
    eventsError: events.events.error,
    myEventsError: events.myEvents.error,
    appliedEventsError: events.appliedEvents.error,
    currentEventError: events.currentEvent.error,

    // Actions
    loadEvents,
    loadEventById,
    createEvent: createNewEvent,
    updateEvent: updateExistingEvent,
    deleteEvent: removeEvent,
    loadMyEvents,
    loadAppliedEvents,
    clearCurrentEvent: clearCurrentEventData,
    updateFilters,
    clearFilters: resetFilters,
    clearErrors,
  };
};
