import { useState, useCallback, useEffect, useMemo } from "react";
import { LeaderboardService } from "../services/leaderboard";
import {
  LeaderboardResponse,
  LeaderboardEntry,
  LeaderboardFilters,
} from "../types";

export interface UseLeaderboardReturn {
  leaderboardData: LeaderboardResponse | null;
  leaderboard: LeaderboardEntry[];
  isLoading: boolean;
  error: string | null;
  filters: LeaderboardFilters;
  availableCities: string[];
  limitOptions: number[];
  loadLeaderboard: () => Promise<void>;
  updateFilters: (newFilters: Partial<LeaderboardFilters>) => void;
  resetFilters: () => void;
  refresh: () => Promise<void>;
}

const DEFAULT_FILTERS: LeaderboardFilters = {
  city: "All Cities",
  limit: 20,
  search: "",
};

const LIMIT_OPTIONS = [10, 20, 50, 100];

export const useLeaderboard = (): UseLeaderboardReturn => {
  const [leaderboardData, setLeaderboardData] =
    useState<LeaderboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<LeaderboardFilters>(DEFAULT_FILTERS);
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  // Filter leaderboard data based on search
  const filteredLeaderboard = useMemo(() => {
    if (!leaderboardData?.results) return [];

    let results = leaderboardData.results;

    // Apply search filter
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase().trim();
      results = results.filter(
        (entry) =>
          entry.name.toLowerCase().includes(searchTerm) ||
          entry.email.toLowerCase().includes(searchTerm)
      );
    }

    return results;
  }, [leaderboardData?.results, filters.search]);

  // Load available cities
  const loadAvailableCities = useCallback(async () => {
    try {
      const response = await LeaderboardService.getAvailableCities();
      if (response.success && response.data) {
        setAvailableCities(response.data);
      }
    } catch (err) {
      console.error("Failed to load cities:", err);
    }
  }, []);

  // Load leaderboard data
  const loadLeaderboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Prepare filters for API call
      const apiFilters: Partial<LeaderboardFilters> = {};

      if (filters.city && filters.city !== "All Cities") {
        apiFilters.city = filters.city;
      }

      apiFilters.limit = filters.limit;

      const response = await LeaderboardService.getLeaderboard(apiFilters);

      if (response.success && response.data) {
        setLeaderboardData(response.data);
      } else {
        throw new Error(response.message || "Failed to load leaderboard");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load leaderboard";
      setError(errorMessage);
      console.error("Leaderboard loading error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Update filters
  const updateFilters = useCallback(
    (newFilters: Partial<LeaderboardFilters>) => {
      setFilters((prev) => ({ ...prev, ...newFilters }));
    },
    []
  );

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  // Refresh data
  const refresh = useCallback(async () => {
    await loadLeaderboard();
  }, [loadLeaderboard]);

  // Load cities on mount
  useEffect(() => {
    loadAvailableCities();
  }, [loadAvailableCities]);

  // Load leaderboard when filters change
  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  return {
    leaderboardData,
    leaderboard: filteredLeaderboard,
    isLoading,
    error,
    filters,
    availableCities,
    limitOptions: LIMIT_OPTIONS,
    loadLeaderboard,
    updateFilters,
    resetFilters,
    refresh,
  };
};
