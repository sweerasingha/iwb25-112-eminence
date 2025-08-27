import { api } from "./api";
import { ApiResponse, SponsorshipRequest, Sponsorship, ID } from "../types";

class SponsorshipService {
  // Create a new sponsorship

  async createSponsorship(
    sponsorshipData: SponsorshipRequest
  ): Promise<ApiResponse<Sponsorship>> {
    const response = await api.post<Sponsorship>("/sponsors", {
      userId: sponsorshipData.userId,
      eventId: sponsorshipData.eventId,
      sponsorType: sponsorshipData.sponsorType,
      amount: sponsorshipData.donationAmount,
      donation: sponsorshipData.donation,
      description: sponsorshipData.description,
    });
    console.log("Create sponsorship response:", response);
    console.log("Create sponsorship response.data:", response.data);
    return response;
  }

  // Get sponsorships for an event

  async getEventSponsorships(
    eventId: string
  ): Promise<ApiResponse<Sponsorship[]>> {
    const response = await api.get<Sponsorship[]>(
      `/sponsorships/event/${eventId}`
    );
    return response;
  }

  // Get user's sponsorships

  async getUserSponsorships(): Promise<ApiResponse<Sponsorship[]>> {
    const response = await api.get<Sponsorship[]>("/sponsorships/my");
    return response;
  }

  // Update sponsorship status
  async updateSponsorshipStatus(
    sponsorshipId: string,
    status: string
  ): Promise<ApiResponse<Sponsorship>> {
    const response = await api.patch<Sponsorship>(
      `/sponsorships/${sponsorshipId}/status`,
      { status }
    );
    return response;
  }

  // Approve sponsorship

  async approveSponsor(sponsorId: ID): Promise<ApiResponse<null>> {
    const response = await api.post(`/sponsors/${sponsorId}/approve`, {});
    return response;
  }

  // Reject sponsorship

  async rejectSponsor(sponsorId: ID): Promise<ApiResponse<null>> {
    const response = await api.post(`/sponsors/${sponsorId}/reject`, {});
    return response;
  }
}

export const sponsorshipService = new SponsorshipService();
