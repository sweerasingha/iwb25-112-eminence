import apiService from "./api-service";

export const createSponsership = async (data: {
  adminOperatorId: string;
  eventId: string;
  sponsorType: string;
  amount: number;
  description: string;
}) => await apiService.post("sponsors/official", data);

export const getSponsor = async () => await apiService.get("/sponsors");

export const approveSponsor = async (sponsorId: string) =>
  await apiService.put(`sponsors/${sponsorId}/approve`);

export const rejectSponsor = async (sponsorId: string) =>
  await apiService.put(`sponsors/${sponsorId}/reject`);
