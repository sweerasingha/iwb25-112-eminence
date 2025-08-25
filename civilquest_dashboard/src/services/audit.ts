import apiService from "./api-service";
import { AuditPagination } from "@/types";


export const getAuditLogs = async (params: AuditPagination) => {
  const searchParams = new URLSearchParams();

  if (params.limit) searchParams.append("limit", params.limit.toString());
  if (params.skip) searchParams.append("skip", params.skip.toString());

  return await apiService.get(`admin/audit/logs?${searchParams.toString()}`);
};

export const getAuditCount = async () =>
  await apiService.get("admin/audit/logs/count");
