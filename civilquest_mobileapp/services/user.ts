import { api } from "./api";
import { User, ApiResponse, ID, AppliedEvent } from "../types";

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
    try {
      const response = await api.get<User>("/users/profile");
      return {
        success: true,
        data: response.data,
        message: "Profile fetched successfully",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch profile",
      };
    }
  }

  // Update user profile
  async updateProfile(profileData: UserProfile): Promise<ApiResponse<User>> {
    try {
      const response = await api.put<User>("/users/profile", profileData);
      return {
        success: true,
        data: response.data,
        message: "Profile updated successfully",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to update profile",
      };
    }
  }

  // Apply for premium
  async applyForPremium(): Promise<ApiResponse<null>> {
    try {
      const response = await api.post("/users/premium/apply", {});
      return {
        success: true,
        message: "Premium application submitted successfully",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to apply for premium",
      };
    }
  }

  // Get user's applied events
  async getAppliedEvents(): Promise<ApiResponse<AppliedEvent[]>> {
    try {
      const response = await api.get<AppliedEvent[]>(
        "/users/me/events/applied"
      );
      return {
        success: true,
        data: response.data || [],
        message: "Applied events fetched successfully",
      };
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.message || "Failed to fetch applied events",
        data: [],
      };
    }
  }
}

export const userService = new UserService();
