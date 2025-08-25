import { api } from "./api";
import {
  Event,
  CreateEventRequest,
  ApiResponse,
  PaginatedResponse,
  ID,
  EventStatus,
} from "../types";

export interface ParticipationRequest {
  userId: string;
  name: string;
  method: "WILL_JOIN" | "INTERESTED";
}

class EventService {
  async getEvents(
    params: {
      page?: number;
      limit?: number;
      search?: string;
      type?: string;
      status?: EventStatus;
    } = {}
  ): Promise<PaginatedResponse<Event>> {
    const response = await api.get<Event[] | { data?: Event[] }>(
      "/events",
      params
    );

    if (!response.success) {
      return {
        success: false,
        error: response.error || "Failed to fetch events",
        data: [],
        pagination: {
          page: params.page || 1,
          limit: params.limit || 10,
          total: 0,
          totalPages: 0,
        },
      };
    }

    const events = Array.isArray(response.data)
      ? response.data
      : (response.data as any)?.data || [];

    return {
      success: true,
      data: events,
      pagination: {
        page: params.page || 1,
        limit: params.limit || 10,
        total: events.length,
        totalPages: 1,
      },
    };
  }

  async getEventById(eventId: ID): Promise<ApiResponse<Event>> {
    try {
      const response = await api.get(`/events/${eventId}`);
      return {
        success: true,
        data: response.data,
        message: "Event fetched successfully",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to fetch event",
      };
    }
  }

  async createEvent(
    eventData: CreateEventRequest,
    imageFile?: any
  ): Promise<ApiResponse<Event>> {
    try {
      const sanitizeForApi = (value: string | undefined): string => {
        return value ? value.trim().replace(/[<>]/g, "") : "";
      };

      const data = new FormData();

      data.append("date", eventData.date);
      data.append("startTime", eventData.startTime);
      data.append("endTime", eventData.endTime);
      data.append("location", sanitizeForApi(eventData.location));
      data.append("city", eventData.city);
      data.append("eventTitle", sanitizeForApi(eventData.eventTitle));
      data.append("eventType", eventData.eventType);
      data.append(
        "eventDescription",
        sanitizeForApi(eventData.eventDescription)
      );
      data.append("reward", sanitizeForApi(eventData.reward));

      if (imageFile) {
        data.append("image", imageFile);
      }

      const response = await api.upload("/events", data);
      return {
        success: true,
        data: response.data,
        message: "Event created successfully",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to create event",
      };
    }
  }

  async updateEvent(
    eventId: ID,
    updateData: {
      eventTitle?: string;
      eventDescription?: string;
      reward?: string;
    }
  ): Promise<ApiResponse<Event>> {
    try {
      const response = await api.put(`/events/${eventId}`, updateData);
      return {
        success: true,
        data: response.data,
        message: "Event updated successfully",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to update event",
      };
    }
  }

  async deleteEvent(eventId: ID): Promise<ApiResponse<null>> {
    try {
      const response = await api.delete(`/events/${eventId}`);
      return {
        success: true,
        message: "Event deleted successfully",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to delete event",
      };
    }
  }

  async endEvent(eventId: ID): Promise<ApiResponse<null>> {
    try {
      const response = await api.post(`/events/${eventId}/end`, {});
      return {
        success: true,
        message: "Event ended successfully",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to end event",
      };
    }
  }

  async getMyEvents(): Promise<ApiResponse<Event[]>> {
    try {
      console.log("getMyEvents: Starting to fetch events");
      const response = await api.get("/events");
      console.log(
        "getMyEvents: API response received:",
        response.data?.length,
        "events"
      );

      if (!response.data) {
        console.log("getMyEvents: No data in response");
        return {
          success: true,
          data: [],
          message: "No events found",
        };
      }

      // Get current user email from token
      const currentUserEmail = api.getCurrentUserEmail();
      console.log("getMyEvents: Current user email:", currentUserEmail);

      if (!currentUserEmail) {
        console.log("getMyEvents: No current user email found");
        return {
          success: false,
          error: "Authentication required",
        };
      }

      // Filter events created by current user
      const myEvents = response.data.filter(
        (event: Event) => event.createdBy === currentUserEmail
      );

      console.log("getMyEvents: Filtered events for user:", {
        totalEvents: response.data.length,
        myEventsCount: myEvents.length,
        myEvents: myEvents,
        currentUserEmail: currentUserEmail,
      });

      return {
        success: true,
        data: myEvents,
        message: "Events fetched successfully",
      };
    } catch (error: any) {
      console.log("getMyEvents: Error:", error);
      return {
        success: false,
        error: error.message || "Failed to fetch your events",
      };
    }
  }

  async applyToEvent(
    eventId: ID,
    participationData: ParticipationRequest
  ): Promise<ApiResponse<null>> {
    try {
      const response = await api.post(
        `/events/${eventId}/apply`,
        participationData
      );
      return {
        success: true,
        message: "Successfully applied to event",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to apply to event",
      };
    }
  }

  async removeParticipation(
    eventId: ID,
    participantId: ID
  ): Promise<ApiResponse<null>> {
    try {
      const response = await api.delete(
        `/events/${eventId}/participants/${participantId}`
      );
      return {
        success: true,
        message: "Successfully removed participation",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to remove participation",
      };
    }
  }

  async getEventParticipants(eventId: ID): Promise<ApiResponse<any[]>> {
    try {
      const response = await api.get(`/events/${eventId}/participants`);
      return {
        success: true,
        data: response.data,
        message: "Participants fetched successfully",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to fetch participants",
      };
    }
  }

  async getEventSponsors(eventId: ID): Promise<ApiResponse<any[]>> {
    try {
      const response = await api.get(`/events/${eventId}`);
      if (!response.success) {
        return {
          success: false,
          error: response.error || "Failed to fetch event",
        };
      }

      const event = response.data as Event;
      return {
        success: true,
        data: event.sponsor || [],
        message: "Sponsors fetched successfully",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to fetch sponsors",
      };
    }
  }

  async approveSponsor(sponsorId: ID): Promise<ApiResponse<null>> {
    try {
      const response = await api.put(`/sponsors/${sponsorId}/approve`, {});
      return {
        success: true,
        message: "Sponsor approved successfully",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to approve sponsor",
      };
    }
  }

  async rejectSponsor(sponsorId: ID): Promise<ApiResponse<null>> {
    try {
      const response = await api.put(`/sponsors/${sponsorId}/reject`, {});
      return {
        success: true,
        message: "Sponsor rejected successfully",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to reject sponsor",
      };
    }
  }

  async participateInEvent(eventId: ID): Promise<ApiResponse<null>> {
    try {
      const response = await api.post(`/events/${eventId}/participate`, {});
      return {
        success: true,
        message: "Successfully participated in event",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to participate in event",
      };
    }
  }
}

export const eventService = new EventService();
