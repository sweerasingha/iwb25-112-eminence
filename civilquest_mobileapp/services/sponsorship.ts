import { api } from "./api";
import { ApiResponse, SponsorshipRequest, Sponsorship, ID } from "../types";

class SponsorshipService {
  // Create a new sponsorship

  async createSponsorship(
    sponsorshipData: SponsorshipRequest
  ): Promise<ApiResponse<Sponsorship>> {
    try {
      const response = await api.post<Sponsorship>(
        "/sponsors",
        sponsorshipData
      );
      console.log("Create sponsorship response:", response);
      console.log("Create sponsorship response.data:", response.data);
      return {
        success: true,
        data: response.data,
        message: "Sponsorship created successfully",
      };
    } catch (error: any) {
      console.error("Create sponsorship error:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to create sponsorship",
      };
    }
  }

  // Get sponsorships for an event

  async getEventSponsorships(
    eventId: string
  ): Promise<ApiResponse<Sponsorship[]>> {
    try {
      const response = await api.get<ApiResponse<Sponsorship[]>>(
        `/sponsorships/event/${eventId}`
      );
      return (
        response.data || {
          success: false,
          message: "No data received",
          data: [],
        }
      );
    } catch (error: any) {
      console.error("Get event sponsorships error:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to get sponsorships",
        data: [],
      };
    }
  }

  // Get user's sponsorships

  async getUserSponsorships(): Promise<ApiResponse<Sponsorship[]>> {
    try {
      const response = await api.get<ApiResponse<Sponsorship[]>>(
        "/sponsorships/my"
      );
      return (
        response.data || {
          success: false,
          message: "No data received",
          data: [],
        }
      );
    } catch (error: any) {
      console.error("Get user sponsorships error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message || "Failed to get user sponsorships",
        data: [],
      };
    }
  }

  // Update sponsorship status
  async updateSponsorshipStatus(
    sponsorshipId: string,
    status: string
  ): Promise<ApiResponse<Sponsorship>> {
    try {
      const response = await api.patch<ApiResponse<Sponsorship>>(
        `/sponsorships/${sponsorshipId}/status`,
        { status }
      );
      return (
        response.data || {
          success: false,
          message: "No data received",
        }
      );
    } catch (error: any) {
      console.error("Update sponsorship status error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Failed to update sponsorship status",
      };
    }
  }

  // Approve sponsorship

  async approveSponsor(sponsorId: ID): Promise<ApiResponse<null>> {
    try {
      const response = await api.post(`/sponsors/${sponsorId}/approve`, {});
      return {
        success: true,
        message: "Sponsor approved successfully",
      };
    } catch (error: any) {
      console.error("Approve sponsor error:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to approve sponsor",
      };
    }
  }

  // Reject sponsorship

  async rejectSponsor(sponsorId: ID): Promise<ApiResponse<null>> {
    try {
      const response = await api.post(`/sponsors/${sponsorId}/reject`, {});
      return {
        success: true,
        message: "Sponsor rejected successfully",
      };
    } catch (error: any) {
      console.error("Reject sponsor error:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to reject sponsor",
      };
    }
  }
}

export const sponsorshipService = new SponsorshipService();
