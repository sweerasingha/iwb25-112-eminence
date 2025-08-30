import { useState } from "react";
import * as sponsorervice from "../services/sponsors";
import { toast } from "react-toastify";
import { Sponsor } from "@/types";

const useSponsors = () => {
  const [loading, setLoading] = useState(false);
  const [sponsors, setSponsor] = useState<Sponsor[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchSponsors = async () => {
    setLoading(true);
    try {
      const response = await sponsorervice.getSponsor();
      const list: Sponsor[] = Array.isArray(response) ? [...response] : Array.isArray((response as any)?.data) ? [...(response as any).data] : [];
      list.sort((a: any, b: any) => {
        const aTime = new Date(a?.createdAt || a?.updatedAt || 0).getTime();
        const bTime = new Date(b?.createdAt || b?.updatedAt || 0).getTime();
        return bTime - aTime;
      });
      setSponsor(list);
      setError(null);
      return { data: list, error: null };
    } catch (err: any) {
      console.error("Error fetching sponsor :", err);
      setSponsor([]);
      const msg = err?.message || "Failed to load sponsors";
      setError(msg);
      return { data: null, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const createSponsorship = async (data: {
    adminOperatorId: string;
    eventId: string;
    sponsorType: "AMOUNT" | "DONATION" | string;
    amount?: number;
    donationAmount?: number;
    donation?: string;
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
        error.response?.data?.errors?.[0] ||
        error.response?.data?.error ||
        error.message ||
        "Error creating sponsorship";
      return { success: false, error: errorMessage };
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
        error.response?.data?.errors?.[0] ||
        error.response?.data?.error ||
        error.message ||
        "Error approving sponsor";
      return { success: false, error: errorMessage };
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
        error.response?.data?.errors?.[0] ||
        error.response?.data?.error ||
        error.message ||
        "Error rejecting sponsor";
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    sponsors,
    error,
    fetchSponsors,
    createSponsorship,
    approveSponsor,
    rejectSponsor,
  };
};

export default useSponsors;
