import React, { useState } from "react";
import * as eventService from "@/services/event";
import { ApiResponse, Event } from "@/types";
import { toast } from "react-toastify";
import { data } from "framer-motion/client";

const useEvent = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async (): Promise<ApiResponse> => {
    setLoading(true);
    try {
      const response = await eventService.getAdminEvents();
      const list: Event[] = Array.isArray(response) ? [...response] : [];
      list.sort((a: any, b: any) => {
        const aTime = new Date(a?.createdAt || a?.updatedAt || 0).getTime();
        const bTime = new Date(b?.createdAt || b?.updatedAt || 0).getTime();
        return bTime - aTime;
      });
      setEvents(list);
      return {
        status: true,
      };
    } catch (error) {
      console.error("Error fetching Events:", error);
      return {
        status: false,
      };
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (data: any): Promise<ApiResponse> => {
    setLoading(true);
    try {
      console.log("Creating event with data:", data);
      const response = await eventService.createEvent(data);
      console.log("Create event response:", response);
      toast.success("Event created successfully");
      await fetchEvents();
      return {
        status: true,
      };
    } catch (error: any) {
      console.error("Error creating Event:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);

      const errorMessage =
        error.response?.data?.errors?.[0] ||
        error.response?.data?.error ||
        error.message ||
        "Error creating Event";
      toast.error(String(errorMessage));
      return { status: false };
    } finally {
      setLoading(false);
    }
  };

  const updateEvent = async (data: {
    eventId: string;
    eventTitle: string;
    reward: string;
    eventDescription: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    location?: string;
    city?: string;
    eventType?: string;
  }): Promise<ApiResponse> => {
    setLoading(true);
    try {
      await eventService.updateEvent(data);
      toast.success("Event updated successfully");
      fetchEvents();
      return {
        status: true,
      };
    } catch (error: any) {
      console.error("Error updating Event:", error);
      const errorMessage =
        error.response?.data?.errors?.[0] ||
        error.response?.data?.error ||
        error.message ||
        "Error updating Event";
      toast.error(String(errorMessage));
      return { status: false };
    } finally {
      setLoading(false);
    }
  };

  const approveEvent = async (eventId: string): Promise<ApiResponse> => {
    setLoading(true);
    try {
      setEvents((prev) =>
        prev.map((e) => {
          const eid = (e as any)._id || (e as any).id;
          return eid === eventId ? { ...e, status: "APPROVED", updatedAt: new Date().toISOString() } : e;
        })
      );
      await eventService.approveEvent(eventId);
      toast.success("Event approved successfully");
      fetchEvents();
      return {
        status: true,
      };
    } catch (error: any) {
      console.error("Error approving Event:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      const errorMessage =
        error.response?.data?.errors?.[0] ||
        error.response?.data?.error ||
        error.message ||
        "Error approving Event";
      toast.error(String(errorMessage));
      fetchEvents();
      return { status: false };
    } finally {
      setLoading(false);
    }
  };

  const rejectEvent = async (eventId: string): Promise<ApiResponse> => {
    setLoading(true);
    try {
      // Optimistic UI update
      setEvents((prev) =>
        prev.map((e) => {
          const eid = (e as any)._id || (e as any).id;
          return eid === eventId ? { ...e, status: "REJECTED", updatedAt: new Date().toISOString() } : e;
        })
      );
      await eventService.rejectEvent(eventId);
      toast.success("Event rejected successfully");
      fetchEvents();
      return {
        status: true,
      };
    } catch (error: any) {
      console.error("Error rejecting Event:", error);
      const errorMessage =
        error.response?.data?.errors?.[0] ||
        error.response?.data?.error ||
        error.message ||
        "Error rejecting Event";
      toast.error(String(errorMessage));
      fetchEvents();
      return { status: false };
    } finally {
      setLoading(false);
    }
  };

  const endEvent = async (eventId: string): Promise<ApiResponse> => {
    setLoading(true);
    try {
      setEvents((prev) =>
        prev.map((e) => {
          const eid = (e as any)._id || (e as any).id;
          return eid === eventId ? { ...e, status: "ENDED", updatedAt: new Date().toISOString() } : e;
        })
      );
      await eventService.endEvent(eventId);
      toast.success("Event ended successfully");
      fetchEvents();
      return {
        status: true,
      };
    } catch (error: any) {
      console.error("Error ending Event:", error);
      const errorMessage =
        error.response?.data?.errors?.[0] ||
        error.response?.data?.error ||
        error.message ||
        "Error ending Event";
      toast.error(String(errorMessage));
      fetchEvents();
      return { status: false };
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (eventId: string): Promise<ApiResponse> => {
    setLoading(true);
    try {
      setEvents((prev) => prev.filter((e) => ((e as any)._id || (e as any).id) !== eventId));
      await eventService.deleteEvent(eventId);
      toast.success("Event deleted successfully");
      fetchEvents();
      return {
        status: true,
      };
    } catch (error: any) {
        console.error("Error deleting Event:", error);
        const errorMessage =
          error.response?.data?.errors?.[0] ||
          error.response?.data?.error ||
          error.message ||
          "Error deleting Event";
        toast.error(String(errorMessage));
        fetchEvents();
      return { status: false };
    } finally {
      setLoading(false);
    }
  };

  return {
    events,
    loading,
    fetchEvents,
    createEvent,
    updateEvent,
    endEvent,
    deleteEvent,
    rejectEvent,
    approveEvent,
  };
};

export default useEvent;
