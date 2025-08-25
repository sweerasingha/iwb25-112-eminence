import { useState } from "react";
import { userService, UserProfile } from "../services/user";
import { User } from "../types";

export const useUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const getProfile = async (): Promise<User | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await userService.getProfile();
      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.error || "Failed to fetch profile");
        return null;
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData: UserProfile): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await userService.updateProfile(profileData);
      if (response.success) {
        return true;
      } else {
        setError(response.error || "Failed to update profile");
        return false;
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const applyForPremium = async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await userService.applyForPremium();
      if (response.success) {
        return true;
      } else {
        setError(response.error || "Failed to apply for premium");
        return false;
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    clearError,
    getProfile,
    updateProfile,
    applyForPremium,
  };
};
