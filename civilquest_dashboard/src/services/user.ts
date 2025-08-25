import apiService from "./api-service";
import { UserSearchParams } from "@/types";


export const searchUsers = async (params: UserSearchParams) => {
  const searchParams = new URLSearchParams();

  if (params.name) searchParams.append("name", params.name);
  if (params.role) searchParams.append("role", params.role);
  if (params.limit) searchParams.append("limit", params.limit.toString());
  if (params.skip) searchParams.append("skip", params.skip.toString());

  return await apiService.get(`users/search?${searchParams.toString()}`);
};

export const getUsersByRole = async (role: string) =>
  await apiService.get(`users/role/${role}`);
