import { useState } from "react";
import * as pointsService from "@/services/points";
import { ApiResponse, PointsConfig, PointsAdjustment } from "@/types";
import { toast } from "react-toastify";

const usePoints = () => {
  const [pointsConfig, setPointsConfig] = useState(null);
  const [loading, setLoading] = useState(false);

  const getPointsConfig = async (): Promise<ApiResponse> => {
    setLoading(true);
    try {
      const response = await pointsService.getPointsConfig();
      setPointsConfig(response as any);
      return {
        status: true,
        data: response,
      };
    } catch (error) {
      console.error("Error fetching points config:", error);
      return {
        status: false,
      };
    } finally {
      setLoading(false);
    }
  };

  const updatePointsConfig = async (
    config: PointsConfig
  ): Promise<ApiResponse> => {
    setLoading(true);
    try {
      await pointsService.updatePointsConfig(config);
      toast.success("Points config updated successfully");
      return {
        status: true,
      };
    } catch (error) {
      console.error("Error updating points config:", error);
      return {
        status: false,
      };
    } finally {
      setLoading(false);
    }
  };

  const adjustUserPoints = async (
    data: PointsAdjustment
  ): Promise<ApiResponse> => {
    setLoading(true);
    try {
      await pointsService.adjustUserPoints(data);
      toast.success("User points adjusted successfully");
      return {
        status: true,
      };
    } catch (error) {
      console.error("Error adjusting user points:", error);
      return {
        status: false,
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    pointsConfig,
    loading,
    getPointsConfig,
    updatePointsConfig,
    adjustUserPoints,
  };
};

export default usePoints;
