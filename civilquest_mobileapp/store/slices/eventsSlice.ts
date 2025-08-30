import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  Event,
  EventStatus,
  AsyncState,
  AsyncArrayState,
  ID,
  CreateEventForm,
  AppliedEvent,
} from "../../types";
import { eventService } from "../../services/event";
import { userService } from "../../services/user";

interface EventsState {
  events: AsyncArrayState<Event>;
  myEvents: AsyncArrayState<Event>;
  appliedEvents: AsyncArrayState<AppliedEvent>;
  currentEvent: AsyncState<Event>;
  filters: {
    status: EventStatus | "all";
    search: string;
    type: string;
    city: string;
  };
}

const initialState: EventsState = {
  events: {
    data: [],
    loading: "idle",
    error: null,
  },
  myEvents: {
    data: [],
    loading: "idle",
    error: null,
  },
  appliedEvents: {
    data: [],
    loading: "idle",
    error: null,
  },
  currentEvent: {
    data: null,
    loading: "idle",
    error: null,
  },
  filters: {
    status: "all",
    search: "",
    type: "",
    city: "",
  },
};

export const fetchEvents = createAsyncThunk(
  "events/fetchEvents",
  async (
    params: { page?: number; limit?: number } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await eventService.getEvents(params);

      if (response.success) {
        return response.data;
      }

      return rejectWithValue(response.message || "Failed to fetch events");
    } catch (error: any) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

export const fetchEventById = createAsyncThunk(
  "events/fetchEventById",
  async (eventId: ID, { rejectWithValue }) => {
    try {
      const response = await eventService.getEventById(eventId);

      if (response.success) {
        return response.data;
      }

      return rejectWithValue(response.message || "Event not found");
    } catch (error: any) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

export const createEvent = createAsyncThunk(
  "events/createEvent",
  async (eventData: any, { rejectWithValue }) => {
    try {
      const response = await eventService.createEvent(eventData as any);

      if (response.success) {
        return response.data;
      }

      return rejectWithValue(response.message || "Failed to create event");
    } catch (error: any) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

export const updateEvent = createAsyncThunk(
  "events/updateEvent",
  async (
    {
      eventId,
      eventData,
    }: { eventId: ID; eventData: Partial<CreateEventForm> },
    { rejectWithValue }
  ) => {
    try {
      const response = await eventService.updateEvent(eventId, eventData);

      if (response.success) {
        return response.data;
      }

      return rejectWithValue(response.message || "Failed to update event");
    } catch (error: any) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

export const deleteEvent = createAsyncThunk(
  "events/deleteEvent",
  async (eventId: ID, { rejectWithValue }) => {
    try {
      const response = await eventService.deleteEvent(eventId);

      if (response.success) {
        return eventId;
      }

      return rejectWithValue(response.message || "Failed to delete event");
    } catch (error: any) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

export const fetchMyEvents = createAsyncThunk(
  "events/fetchMyEvents",
  async (_, { rejectWithValue }) => {
    try {
      const response = await eventService.getMyEvents();

      if (response.success) {
        return response.data;
      }

      return rejectWithValue(response.message || "Failed to fetch your events");
    } catch (error: any) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

export const fetchAppliedEvents = createAsyncThunk(
  "events/fetchAppliedEvents",
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getAppliedEvents();

      if (response.success) {
        return response.data;
      }

      return rejectWithValue(
        response.message || "Failed to fetch applied events"
      );
    } catch (error: any) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

const eventsSlice = createSlice({
  name: "events",
  initialState,
  reducers: {
    clearCurrentEvent: (state) => {
      state.currentEvent = {
        data: null,
        loading: "idle",
        error: null,
      };
    },
    setFilters: (
      state,
      action: PayloadAction<Partial<EventsState["filters"]>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        status: "all",
        search: "",
        type: "",
        city: "",
      };
    },
    clearEventsError: (state) => {
      state.events.error = null;
      state.myEvents.error = null;
      state.currentEvent.error = null;
    },
    addEvent: (state, action: PayloadAction<Event>) => {
      const raw = action.payload as any;
      const eid: string = raw.id || raw._id;
      const normalized: Event = { ...raw, id: eid, _id: raw._id || eid };

      const upsertFront = (arr: Event[]) => {
        const existingIdx = arr.findIndex((e) => (e.id || (e as any)._id) === eid);
        if (existingIdx !== -1) {
          arr.splice(existingIdx, 1);
        }
        arr.unshift(normalized);
      };

      upsertFront(state.events.data);
      upsertFront(state.myEvents.data);
    },
  },
  extraReducers: (builder) => {
    // Fetch events
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.events.loading = "loading";
        state.events.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.events.loading = "succeeded";
        const incoming: any[] = action.payload || [];
        const existing = state.events.data || [];
        const idOf = (e: any) => e.id || e._id;
        const indexById: Record<string, number> = {};
        existing.forEach((e, i) => {
          indexById[idOf(e)] = i;
        });
        const updated = [...existing];
        for (const e of incoming) {
          const id = idOf(e);
          if (id in indexById) {
            updated[indexById[id]] = { ...e, id: id, _id: e._id || id } as any;
          } else {
            updated.push({ ...e, id: id, _id: e._id || id } as any);
          }
        }
        state.events.data = updated as any;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.events.loading = "failed";
        state.events.error = action.payload as string;
      });

    // Fetch event by ID
    builder
      .addCase(fetchEventById.pending, (state) => {
        state.currentEvent.loading = "loading";
        state.currentEvent.error = null;
      })
      .addCase(fetchEventById.fulfilled, (state, action) => {
        state.currentEvent.loading = "succeeded";
        state.currentEvent.data = action.payload || null;
      })
      .addCase(fetchEventById.rejected, (state, action) => {
        state.currentEvent.loading = "failed";
        state.currentEvent.error = action.payload as string;
      });

    // Create event
    builder
      .addCase(createEvent.pending, (state) => {
        state.currentEvent.loading = "loading";
        state.currentEvent.error = null;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.currentEvent.loading = "succeeded";
        state.currentEvent.data = action.payload || null;

        if (action.payload) {
          state.events.data.unshift(action.payload);
          state.myEvents.data.unshift(action.payload);
        }
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.currentEvent.loading = "failed";
        state.currentEvent.error = action.payload as string;
      });

    // Update event
    builder.addCase(updateEvent.fulfilled, (state, action) => {
      const updatedEvent = action.payload;

      if (updatedEvent) {
        // Update in events list
        const eventsIndex = state.events.data.findIndex(
          (event) => event.id === updatedEvent.id
        );
        if (eventsIndex !== -1) {
          state.events.data[eventsIndex] = updatedEvent;
        }

        // Update in my events list
        const myEventsIndex = state.myEvents.data.findIndex(
          (event) => event.id === updatedEvent.id
        );
        if (myEventsIndex !== -1) {
          state.myEvents.data[myEventsIndex] = updatedEvent;
        }

        // Update current event
        if (state.currentEvent.data?.id === updatedEvent.id) {
          state.currentEvent.data = updatedEvent;
        }
      }
    });

    // Delete event
    builder.addCase(deleteEvent.fulfilled, (state, action) => {
      const deletedEventId = action.payload;

      // Remove from events list
      state.events.data = state.events.data.filter(
        (event) => event.id !== deletedEventId
      );

      // Remove from my events list
      state.myEvents.data = state.myEvents.data.filter(
        (event) => event.id !== deletedEventId
      );

      // Clear current event if it's the deleted one
      if (state.currentEvent.data?.id === deletedEventId) {
        state.currentEvent.data = null;
      }
    });

    // Fetch my events
    builder
      .addCase(fetchMyEvents.pending, (state) => {
        state.myEvents.loading = "loading";
        state.myEvents.error = null;
      })
      .addCase(fetchMyEvents.fulfilled, (state, action) => {
        state.myEvents.loading = "succeeded";
        const incoming: any[] = action.payload || [];
        const existing = state.myEvents.data || [];
        const idOf = (e: any) => e.id || e._id;
        const indexById: Record<string, number> = {};
        existing.forEach((e, i) => {
          indexById[idOf(e)] = i;
        });
        const updated = [...existing];
        for (const e of incoming) {
          const id = idOf(e);
          if (id in indexById) {
            updated[indexById[id]] = { ...e, id: id, _id: e._id || id } as any;
          } else {
            updated.push({ ...e, id: id, _id: e._id || id } as any);
          }
        }
        state.myEvents.data = updated as any;
      })
      .addCase(fetchMyEvents.rejected, (state, action) => {
        state.myEvents.loading = "failed";
        state.myEvents.error = action.payload as string;
      })

      // Fetch applied events
      .addCase(fetchAppliedEvents.pending, (state) => {
        state.appliedEvents.loading = "loading";
        state.appliedEvents.error = null;
      })
      .addCase(fetchAppliedEvents.fulfilled, (state, action) => {
        state.appliedEvents.loading = "succeeded";
        state.appliedEvents.data = action.payload || [];
      })
      .addCase(fetchAppliedEvents.rejected, (state, action) => {
        state.appliedEvents.loading = "failed";
        state.appliedEvents.error = action.payload as string;
      });
  },
});

export const { clearCurrentEvent, setFilters, clearFilters, clearEventsError, addEvent } =
  eventsSlice.actions;
export default eventsSlice.reducer;
