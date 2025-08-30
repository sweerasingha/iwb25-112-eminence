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
    const response = await api.get(`/events/${eventId}`);
    return response;
  }

  async createEvent(
    eventData: CreateEventRequest,
    imageFile?: any
  ): Promise<ApiResponse<Event>> {
    const sanitizeForApi = (value: string | undefined): string => {
      return value ? value.trim().replace(/[<>]/g, "") : "";
    };

    const data = new FormData();

    data.append("date", eventData.date);
    data.append("startTime", eventData.startTime);
    data.append("endTime", eventData.endTime);
    data.append("location", sanitizeForApi(eventData.location));
    data.append("province", eventData.province);
    data.append("city", eventData.city);
    data.append("eventTitle", sanitizeForApi(eventData.eventTitle));
    data.append("eventType", eventData.eventType);
    data.append("eventDescription", sanitizeForApi(eventData.eventDescription));
    data.append("reward", sanitizeForApi(eventData.reward));
    data.append("longitude", Number(eventData.longitude).toString());
    data.append("latitude", Number(eventData.latitude).toString());

    if (imageFile) {
      data.append("image", imageFile);
    }

    const response = await api.upload("/events", data);
    return response;
  }

  async updateEvent(
    eventId: ID,
    updateData: {
      eventTitle?: string;
      eventDescription?: string;
      reward?: string;
    }
  ): Promise<ApiResponse<Event>> {
    const response = await api.put(`/events/${eventId}`, updateData);
    return response;
  }

  async deleteEvent(eventId: ID): Promise<ApiResponse<null>> {
    const response = await api.delete(`/events/${eventId}`);
    return response;
  }

  async endEvent(eventId: ID): Promise<ApiResponse<null>> {
    const response = await api.post(`/events/${eventId}/end`, {});
    return response;
  }

  async getMyEvents(): Promise<ApiResponse<Event[]>> {
    console.log("getMyEvents: Starting to fetch events");
    const response = await api.get("/events");

    if (!response.success) {
      console.log("getMyEvents: API Error:", response.error);
      return response;
    }

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
      message: response.message || "Events fetched successfully",
    };
  }

  async applyToEvent(
    eventId: ID,
    participationData: ParticipationRequest
  ): Promise<ApiResponse<null>> {
    const response = await api.post(
      `/events/${eventId}/apply`,
      participationData
    );
    return response;
  }

  async removeParticipation(
    eventId: ID,
    participantId: ID
  ): Promise<ApiResponse<null>> {
    const response = await api.delete(
      `/events/${eventId}/participants/${participantId}`
    );
    return response;
  }

  async getEventParticipants(eventId: ID): Promise<ApiResponse<any[]>> {
    const response = await api.get(`/events/${eventId}/participants`);
    return response;
  }

  async getEventSponsors(eventId: ID): Promise<ApiResponse<any[]>> {
    const response = await api.get(`/events/${eventId}`);
    if (!response.success) {
      return response;
    }

    const event = response.data as Event;
    return {
      success: true,
      data: (event as any).sponsors || event.sponsor || [],
      message: response.message || "Sponsors fetched successfully",
    };
  }

  async approveSponsor(sponsorId: ID): Promise<ApiResponse<null>> {
    const response = await api.post(`/sponsors/${sponsorId}/approve`, {});
    return response;
  }

  async rejectSponsor(sponsorId: ID): Promise<ApiResponse<null>> {
    const response = await api.post(`/sponsors/${sponsorId}/reject`, {});
    return response;
  }

  async participateInEvent(data: {
    eventId: ID;
    latitude: number;
    longitude: number;
  }): Promise<ApiResponse<null>> {
    const response = await api.post(`/events/${data.eventId}/participate`, {
      latitude: data.latitude,
      longitude: data.longitude,
    });
    return response;
  }
}

export const eventService = new EventService();
