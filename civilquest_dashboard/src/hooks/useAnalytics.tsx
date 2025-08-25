import { useState } from "react";
import * as analyticsService from "@/services/analytics";
import { ApiResponse, AnalyticsDateRange } from "@/types";
import { toast } from "react-toastify";

const useAnalytics = () => {
  const [eventAnalytics, setEventAnalytics] = useState(null);
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [sponsorshipAnalytics, setSponsorshipAnalytics] = useState(null);
  const [participationAnalytics, setParticipationAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  const getEventAnalytics = async (
    params: AnalyticsDateRange
  ): Promise<ApiResponse> => {
    setLoading(true);
    try {
      const response = await analyticsService.getEventAnalytics(params);
      setEventAnalytics(response as any);
      return {
        status: true,
        data: response,
      };
    } catch (error) {
      console.error("Error fetching event analytics:", error);
      return {
        status: false,
      };
    } finally {
      setLoading(false);
    }
  };

  const getUserAnalytics = async (): Promise<ApiResponse> => {
    setLoading(true);
    try {
      const response = await analyticsService.getUserAnalytics();
      setUserAnalytics(response as any);
      return {
        status: true,
        data: response,
      };
    } catch (error) {
      console.error("Error fetching user analytics:", error);
      return {
        status: false,
      };
    } finally {
      setLoading(false);
    }
  };

  const getSponsorshipAnalytics = async (
    params: AnalyticsDateRange
  ): Promise<ApiResponse> => {
    setLoading(true);
    try {
      const response = await analyticsService.getSponsorshipAnalytics(params);
      setSponsorshipAnalytics(response as any);
      return {
        status: true,
        data: response,
      };
    } catch (error) {
      console.error("Error fetching sponsorship analytics:", error);
      return {
        status: false,
      };
    } finally {
      setLoading(false);
    }
  };

  const getParticipationAnalytics = async (
    params: AnalyticsDateRange
  ): Promise<ApiResponse> => {
    setLoading(true);
    try {
      const response = await analyticsService.getParticipationAnalytics(params);
      setParticipationAnalytics(response as any);
      return {
        status: true,
        data: response,
      };
    } catch (error) {
      console.error("Error fetching participation analytics:", error);
      return {
        status: false,
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    eventAnalytics,
    userAnalytics,
    sponsorshipAnalytics,
    participationAnalytics,
    loading,
    getEventAnalytics,
    getUserAnalytics,
    getSponsorshipAnalytics,
    getParticipationAnalytics,
  };
};

export default useAnalytics;
