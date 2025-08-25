import React, { useState } from "react";
import * as eventService from "@/services/event";
import { ApiResponse } from "@/types";
import { toast } from "react-toastify";
import { data } from "framer-motion/client";

const useEvent = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async (): Promise<ApiResponse> => {
    setLoading(true);
    try {
      const response = await eventService.getAdminEvents();
      setEvents((response as any) ?? []);
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
      return {
        status: true,
      };
    } catch (error: any) {
      console.error("Error creating Event:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);

      const errorMessage =
        error.response?.data?.errors[0] ||
        error.message ||
        "Error creating Event";

      return {
        status: false,
      };
    } finally {
      setLoading(false);
    }
  };

  const updateEvent = async (data: {
    eventId: string;
    eventTitle: string;
    reward: string;
    eventDescription: string;
  }): Promise<ApiResponse> => {
    setLoading(true);
    try {
      await eventService.updateEvent(data);
      toast.success("Event updated successfully");
      return {
        status: true,
      };
    } catch (error: any) {
      console.error("Error updating Event:", error);
      const errorMessage =
        error.response?.data?.errors[0] ||
        error.message ||
        "Error creating Event";
      return {
        status: false,
      };
    } finally {
      setLoading(false);
    }
  };

  const approveEvent = async (eventId: string): Promise<ApiResponse> => {
    setLoading(true);
    try {
      await eventService.approveEvent(eventId);
      toast.success("Event approved successfully");
      return {
        status: true,
      };
    } catch (error: any) {
      console.error("Error creating Event:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      const errorMessage =
        error.response?.data?.errors[0] ||
        error.message ||
        "Error creating Event";
      return {
        status: false,
      };
    } finally {
      setLoading(false);
    }
  };

  const rejectEvent = async (eventId: string): Promise<ApiResponse> => {
    setLoading(true);
    try {
      await eventService.rejectEvent(eventId);
      toast.success("Event rejected successfully");
      return {
        status: true,
      };
    } catch (error: any) {
      console.error("Error rejecting Event:", error);
      const errorMessage =
        error.response?.data?.errors[0] ||
        error.message ||
        "Error creating Event";
      return {
        status: false,
      };
    } finally {
      setLoading(false);
    }
  };

  const endEvent = async (eventId: string): Promise<ApiResponse> => {
    setLoading(true);
    try {
      await eventService.endEvent(eventId);
      toast.success("Event ended successfully");
      return {
        status: true,
      };
    } catch (error: any) {
      console.error("Error ending Event:", error);
      const errorMessage =
        error.response?.data?.errors[0] ||
        error.message ||
        "Error creating Event";
      return {
        status: false,
      };
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (eventId: string): Promise<ApiResponse> => {
    setLoading(true);
    try {
      await eventService.deleteEvent(eventId);
      toast.success("Event deleted successfully");
      return {
        status: true,
      };
    } catch (error) {
      console.error("Error deleting Event:", error);
      return {
        status: false,
      };
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
