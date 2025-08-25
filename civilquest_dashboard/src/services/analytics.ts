import apiService from "./api-service";
import { AnalyticsDateRange } from "@/types";


export const getEventAnalytics = async (params: AnalyticsDateRange) => {
  const searchParams = new URLSearchParams();

  if (params.startDate) searchParams.append("startDate", params.startDate);
  if (params.endDate) searchParams.append("endDate", params.endDate);

  return await apiService.get(
    `admin/analytics/events?${searchParams.toString()}`
  );
};

export const getUserAnalytics = async () =>
  await apiService.get("admin/analytics/users");

export const getSponsorshipAnalytics = async (params: AnalyticsDateRange) => {
  const searchParams = new URLSearchParams();

  if (params.startDate) searchParams.append("startDate", params.startDate);
  if (params.endDate) searchParams.append("endDate", params.endDate);

  return await apiService.get(
    `admin/analytics/sponsorships?${searchParams.toString()}`
  );
};

export const getParticipationAnalytics = async (params: AnalyticsDateRange) => {
  const searchParams = new URLSearchParams();

  if (params.startDate) searchParams.append("startDate", params.startDate);
  if (params.endDate) searchParams.append("endDate", params.endDate);

  return await apiService.get(
    `admin/analytics/participation?${searchParams.toString()}`
  );
};
