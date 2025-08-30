import apiService from "./api-service";

type CreateSponsorshipPayload = {
  adminOperatorId: string;
  eventId: string;
  sponsorType: "AMOUNT" | "DONATION" | string;
  amount?: number;
  donationAmount?: number;
  donation?: string;
  description: string;
};

export const createSponsorship = async (data: CreateSponsorshipPayload) =>
  await apiService.post("sponsors/official", data);

export const createSponsership = createSponsorship;

export const getSponsor = async () => await apiService.get("sponsors");

export const approveSponsor = async (sponsorId: string) =>
  await apiService.put(`sponsors/${sponsorId}/approve`);

export const rejectSponsor = async (sponsorId: string) =>
  await apiService.put(`sponsors/${sponsorId}/reject`);
