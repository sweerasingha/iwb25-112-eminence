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
        donationAmount: parseFloat(formData.donationAmount),
        donation: formData.donation,
        description: formData.description,
      };

      const response = await sponsorshipService.createSponsorship(
        sponsorshipData
      );

      console.log("Hook received response:", response);
      console.log("Response success:", response.success);
      console.log("Response success type:", typeof response.success);

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

 
  const validateSponsorshipForm = (
    form: SponsorshipForm
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!form.sponsorType.trim()) {
      errors.push("Sponsor type is required");
    }

    if (!form.donationAmount.trim()) {
      errors.push("Donation amount is required");
    } else {
      const amount = parseFloat(form.donationAmount);
      if (isNaN(amount) || amount <= 0) {
        errors.push("Donation amount must be a valid positive number");
      }
    }

    if (!form.donation.trim()) {
      errors.push("Donation description is required");
    }

    if (!form.description.trim()) {
      errors.push("Description is required");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };


    // Get predefined sponsor types
  const getSponsorTypes = () => [
    "DONATION",
    "EQUIPMENT",
    "FOOD",
    "BEVERAGE",
    "TRANSPORTATION",
    "VENUE",
    "MARKETING",
    "TECHNOLOGY",
    "OTHER",
  ];

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
