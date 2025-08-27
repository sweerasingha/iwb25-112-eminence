import { ApiResponse, LeaderboardResponse, LeaderboardFilters } from "../types";
import { api } from "./api";

export class LeaderboardService {
  // Get leaderboard data with optional filters

  static async getLeaderboard(
    filters?: Partial<LeaderboardFilters>
  ): Promise<ApiResponse<LeaderboardResponse>> {
    const params = new URLSearchParams();

    if (filters?.city && filters.city !== "All Cities") {
      params.append("city", filters.city);
    }

    if (filters?.limit) {
      params.append("limit", Math.min(filters.limit, 100).toString());
    }

    const queryString = params.toString();
    const endpoint = `/points/leaderboard${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await api.get<LeaderboardResponse>(endpoint);

    if (response.success && response.data?.results) {
      response.data.results.sort((a, b) => a.rank - b.rank);
    }

    return response;
  }

  //Get available cities for leaderboard filtering

  static async getAvailableCities(): Promise<ApiResponse<string[]>> {
    return {
      success: true,
      data: [
        "All Cities",
        "Colombo",
        "Kandy",
        "Galle",
        "Jaffna",
        "Negombo",
        "Anuradhapura",
        "Polonnaruwa",
        "Batticaloa",
        "Trincomalee",
        "Kurunegala",
        "Ratnapura",
        "Badulla",
        "Matara",
        "Kalutara",
        "Gampaha",
      ],
      message: "Cities loaded successfully",
    };
  }
}
