import apiService from "./api-service";
import { PointsConfig, PointsAdjustment } from "@/types";


export const getPointsConfig = async () =>
  await apiService.get("admin/points/config");

export const updatePointsConfig = async (config: PointsConfig) =>
  await apiService.put("admin/points/config", config);

export const adjustUserPoints = async (data: PointsAdjustment) =>
  await apiService.post("admin/points/adjust", data);
