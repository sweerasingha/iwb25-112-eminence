import { api } from "./api";
import { User, ApiResponse, ID, AppliedEvent, MySponsorItem } from "../types";

export interface UserProfile {
  username?: string;
  address?: string;
  hometown?: string;
  livingCity?: string;
  gender?: string;
  nationalid?: string;
}

class UserService {
  // Get user profile

  async getProfile(): Promise<ApiResponse<User>> {
    const response = await api.get<User>("/users/profile");
    return response;
  }

  // Update user profile
  async updateProfile(profileData: UserProfile): Promise<ApiResponse<User>> {
    const response = await api.put<User>("/users/profile", profileData);
    return response;
  }

  // Apply for premium
  async applyForPremium(): Promise<ApiResponse<null>> {
    const response = await api.post("/users/premium/apply", {});
    return response;
  }

  // Get user's applied events
  async getAppliedEvents(): Promise<ApiResponse<AppliedEvent[]>> {
    const response = await api.get<AppliedEvent[]>("/users/me/events/applied");
    return response;
  }

  // Get sponsors created by the currently logged-in user
  async getMySponsors(params?: { eventId?: string; approvedStatus?: string }): Promise<ApiResponse<MySponsorItem[]>> {
    const response = await api.get<MySponsorItem[]>("/users/me/sponsors", params);
    return response;
  }
}

export const userService = new UserService();