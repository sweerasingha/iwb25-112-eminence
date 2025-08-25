import React, { useState } from "react";
import * as premiumUserRequestService from "@/services/premium-user-request";
import { ApiResponse, PremiumUserRequest } from "@/types";
import { toast } from "react-toastify";

const usePremiumUserRequest = () => {
  const [premiumUserRequests, setPremiumUserRequests] = useState<
    PremiumUserRequest[]
  >([]);
  const [loading, setLoading] = useState(true);

  const fetchPremiumUserRequests = async (): Promise<ApiResponse> => {
    setLoading(true);
    try {
      const response = await premiumUserRequestService.getPremiumUserRequests();
      setPremiumUserRequests((response as any) ?? []);
      return {
        status: true,
      };
    } catch (error) {
      console.error("Error fetching Premium User Requests:", error);
      return {
        status: false,
      };
    } finally {
      setLoading(false);
    }
  };

  const approvePremiumUserRequest = async (
    userId: string
  ): Promise<ApiResponse> => {
    setLoading(true);
    try {
      await premiumUserRequestService.approvePremiumUserRequest(userId);
      toast.success("Premium user request approved successfully");
      return {
        status: true,
      };
    } catch (error: any) {
      console.error("Error approving Premium User Request:", error);
      const errorMessage =
        error.response?.data?.errors[0] ||
        error.message ||
        "Error approving Premium User Request";
      return {
        status: false,
      };
    } finally {
      setLoading(false);
    }
  };

  const rejectPremiumUserRequest = async (
    userId: string
  ): Promise<ApiResponse> => {
    setLoading(true);
    try {
      await premiumUserRequestService.rejectPremiumUserRequest(userId);
      toast.success("Premium user request rejected successfully");
      return {
        status: true,
      };
    } catch (error: any) {
      console.error("Error rejecting Premium User Request:", error);
      const errorMessage =
        error.response?.data?.errors[0] ||
        error.message ||
        "Error rejecting Premium User Request";
      return {
        status: false,
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    premiumUserRequests,
    loading,
    fetchPremiumUserRequests,
    approvePremiumUserRequest,
    rejectPremiumUserRequest,
  };
};

export default usePremiumUserRequest;
