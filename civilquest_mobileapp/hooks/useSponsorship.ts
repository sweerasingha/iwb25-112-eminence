import { useState } from "react";
import { sponsorshipService } from "../services/sponsorship";
import {
  SponsorshipRequest,
  SponsorshipForm,
  ApiResponse,
  Sponsorship,
} from "../types";

export const useSponsorship = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  
   // Create a new sponsorship
   
  const createSponsorship = async (
    userId: string,
    eventId: string,
    formData: SponsorshipForm
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Convert form data to API request format
      const sponsorshipData: SponsorshipRequest = {
        userId,
        eventId,
        sponsorType: formData.sponsorType,
        description: formData.description,
      };

      if (formData.sponsorType === "AMOUNT") {
        sponsorshipData.amount = formData.amount
          ? parseFloat(formData.amount)
          : undefined;
      } else if (formData.sponsorType === "DONATION") {
        sponsorshipData.donationAmount = formData.donationAmount
          ? parseFloat(formData.donationAmount)
          : undefined;
        sponsorshipData.donation = formData.donation;
      }

      const response = await sponsorshipService.createSponsorship(
        sponsorshipData
      );



      if (response.success) {
        return true;
      } else {
        setError(response.message || "Failed to create sponsorship");
        return false;
      }
    } catch (error: any) {
      setError(error.message || "Network error");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Get sponsorships for an event
  const getEventSponsorships = async (
    eventId: string
  ): Promise<Sponsorship[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await sponsorshipService.getEventSponsorships(eventId);

      if (response.success) {
        return response.data || [];
      } else {
        setError(response.message || "Failed to get sponsorships");
        return [];
      }
    } catch (error: any) {
      setError(error.message || "Network error");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Get user's sponsorships
  const getUserSponsorships = async (): Promise<Sponsorship[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await sponsorshipService.getUserSponsorships();

      if (response.success) {
        return response.data || [];
      } else {
        setError(response.message || "Failed to get user sponsorships");
        return [];
      }
    } catch (error: any) {
      setError(error.message || "Network error");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Update sponsorship status
  const updateSponsorshipStatus = async (
    sponsorshipId: string,
    status: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await sponsorshipService.updateSponsorshipStatus(
        sponsorshipId,
        status
      );

      if (response.success) {
        return true;
      } else {
        setError(response.message || "Failed to update sponsorship status");
        return false;
      }
    } catch (error: any) {
      setError(error.message || "Network error");
      return false;
    } finally {
      setIsLoading(false);
    }
  };


  // Clear any errors

  const clearError = () => {
    setError(null);
  };

 
  const validateSponsorshipForm = (form: SponsorshipForm): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    if (!form.sponsorType) errors.push("Sponsor type is required");
    if (!form.description?.trim()) errors.push("Description is required");
    return { isValid: errors.length === 0, errors };
  };


    // Get predefined sponsor types
  const getSponsorTypes = () => ["AMOUNT", "DONATION"] as const;

  return {
    // State
    isLoading,
    error,

    // Actions
    createSponsorship,
    getEventSponsorships,
    getUserSponsorships,
    updateSponsorshipStatus,
    clearError,

    // Utilities
    validateSponsorshipForm,
    getSponsorTypes,
  };
};
