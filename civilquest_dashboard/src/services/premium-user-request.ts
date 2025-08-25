import apiService from "./api-service";

export const getPremiumUserRequests = async () =>
  await apiService.get("users/premium/pending");

export const approvePremiumUserRequest = async (userId: string) =>
  await apiService.put(`users/${userId}/premium/approve`);

export const rejectPremiumUserRequest = async (userId: string) =>
  await apiService.put(`users/${userId}/premium/reject`);
