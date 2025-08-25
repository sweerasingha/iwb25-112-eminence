import { useState } from "react";
import * as sponsorervice from "../services/sponsors";
import { toast } from "react-toastify";
import { Sponsor } from "@/types";
import { data } from "framer-motion/client";

const useSponsors = () => {
  const [loading, setLoading] = useState(false);
  const [sponsors, setSponsor] = useState<Sponsor[]>([]);

  const fetchSponsors = async () => {
    setLoading(true);
    try {
      const response = await sponsorervice.getSponsor();
      setSponsor((response as any) || []);
      return { data: response.data, error: null };
    } catch (error) {
      console.error("Error fetching sponsor :", error);
      setSponsor([]);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const createSponsorship = async (data: {
    adminOperatorId: string;
    eventId: string;
    sponsorType: string;
    amount: number;
    description: string;
  }) => {
    setLoading(true);
    try {
      const result = await sponsorervice.createSponsership(data);
      const { id, message } = result as any;
      toast.success(message);
      return { success: true, error: null };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.errors[0] ||
        error.message ||
        "Error creating sponsorship";
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const approveSponsor = async (sponsorId: string) => {
    setLoading(true);
    try {
      await sponsorervice.approveSponsor(sponsorId);
      toast.success("Sponsor  approved successfully");
      await fetchSponsors();
      return { success: true, error: null };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.errors[0] ||
        error.message ||
        "Error approving sponsor ";
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const rejectSponsor = async (sponsorId: string) => {
    setLoading(true);
    try {
      await sponsorervice.rejectSponsor(sponsorId);
      toast.success("Sponsor  rejected successfully");
      await fetchSponsors();
      return { success: true, error: null };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.errors[0] ||
        error.message ||
        "Error rejecting sponsor ";
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    sponsors,
    fetchSponsors,
    createSponsorship,
    approveSponsor,
    rejectSponsor,
  };
};

export default useSponsors;
