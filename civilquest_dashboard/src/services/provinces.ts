import apiService from "./api-service";

export type ProvinceCityMap = Record<string, string[]>;

export const getProvinces = async (): Promise<ProvinceCityMap> =>
  await apiService.get("provinces");
