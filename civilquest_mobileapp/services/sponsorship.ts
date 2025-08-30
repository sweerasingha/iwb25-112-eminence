import { api } from "./api";
import { ApiResponse, SponsorshipRequest, Sponsorship, ID } from "../types";

class SponsorshipService {
  // Create a new sponsorship

  async createSponsorship(
    sponsorshipData: SponsorshipRequest
  ): Promise<ApiResponse<Sponsorship>> {
    const payload: any = {
      userId: sponsorshipData.userId,
      eventId: sponsorshipData.eventId,
      sponsorType: sponsorshipData.sponsorType,
      description: sponsorshipData.description,
    };

    if (sponsorshipData.sponsorType === "AMOUNT") {
      if (typeof sponsorshipData.amount === "number") {
        payload.amount = sponsorshipData.amount;
      }
    } else if (sponsorshipData.sponsorType === "DONATION") {
      if (typeof sponsorshipData.donationAmount === "number") {
        payload.donationAmount = sponsorshipData.donationAmount;
      }
      if (typeof sponsorshipData.donation === "string" && sponsorshipData.donation.trim().length > 0) {
        payload.donation = sponsorshipData.donation.trim();
      }
    }

    const response = await api.post<Sponsorship>("/sponsors", payload);
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
