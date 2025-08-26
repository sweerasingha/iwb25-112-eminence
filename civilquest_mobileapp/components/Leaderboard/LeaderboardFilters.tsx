import React from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { SponsorshipDropdown } from "../UI";
import { Button } from "../UI";
import { globalStyles, COLORS, SPACING, LAYOUT } from "../../theme";
import { LeaderboardFilters as LeaderboardFiltersType } from "../../types";

export interface LeaderboardFiltersProps {
  filters: LeaderboardFiltersType;
  availableCities: string[];
  limitOptions: number[];
  onFiltersChange: (filters: Partial<LeaderboardFiltersType>) => void;
  onClearFilters: () => void;
  isLoading?: boolean;
}

export const LeaderboardFilters: React.FC<LeaderboardFiltersProps> = ({
  filters,
  availableCities,
  limitOptions,
  onFiltersChange,
  onClearFilters,
  isLoading = false,
}) => {
  const handleCityChange = (city: string) => {
    onFiltersChange({ city });
  };

  const handleLimitChange = (limit: string) => {
    onFiltersChange({ limit: parseInt(limit, 10) });
  };

  const handleSearchChange = (search: string) => {
    onFiltersChange({ search });
  };

  const hasActiveFilters =
    filters.city !== "All Cities" ||
    filters.limit !== 20 ||
    Boolean(filters.search);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="filter" size={20} color={COLORS.primary} />
          <Text style={[globalStyles.h4, styles.headerTitle]}>Filters</Text>
        </View>
        {hasActiveFilters && (
          <Button
            title="Clear"
            variant="ghost"
            size="small"
            onPress={onClearFilters}
            disabled={isLoading}
            leftIcon="refresh-outline"
          />
        )}
      </View>

      {/* Filter Controls */}
      <View style={styles.filterControls}>
        {/* Search Filter */}
        <View style={styles.filterGroup}>
          <Text style={[globalStyles.label, styles.searchLabel]}>
            Search Players
          </Text>
          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={20}
              color={COLORS.textTertiary}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or email..."
              placeholderTextColor={COLORS.textTertiary}
              value={filters.search || ""}
              onChangeText={handleSearchChange}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
          </View>
        </View>

        {/* City Filter */}
        <View style={styles.filterGroup}>
          <SponsorshipDropdown
            label="City"
            value={filters.city}
            onSelect={handleCityChange}
            options={availableCities}
            placeholder="Select city"
            containerStyle={styles.dropdown}
          />
        </View>

        {/* Limit Filter */}
        <View style={styles.filterGroup}>
          <SponsorshipDropdown
            label="Results per page"
            value={filters.limit.toString()}
            onSelect={handleLimitChange}
            options={limitOptions.map((limit) => limit.toString())}
            placeholder="Select limit"
            containerStyle={styles.dropdown}
          />
        </View>
      </View>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <View style={styles.activeFilters}>
          <Text style={[globalStyles.caption, styles.activeFiltersLabel]}>
            Active filters:
          </Text>
          <View style={styles.activeFiltersTags}>
            {filters.search && (
              <View style={styles.filterTag}>
                <Ionicons name="search" size={12} color={COLORS.primary} />
                <Text style={styles.filterTagText}>"{filters.search}"</Text>
              </View>
            )}
            {filters.city !== "All Cities" && (
              <View style={styles.filterTag}>
                <Ionicons name="location" size={12} color={COLORS.primary} />
                <Text style={styles.filterTagText}>{filters.city}</Text>
              </View>
            )}
            {filters.limit !== 20 && (
              <View style={styles.filterTag}>
                <Ionicons name="list" size={12} color={COLORS.primary} />
                <Text style={styles.filterTagText}>
                  {filters.limit} results
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.borderRadius.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...LAYOUT.shadows.sm,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    marginLeft: SPACING.sm,
    color: COLORS.textPrimary,
  },
  filterControls: {
    gap: SPACING.md,
  },
  filterGroup: {
    flex: 1,
  },
  dropdown: {
    marginBottom: 0,
  },
  searchLabel: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: LAYOUT.borderRadius.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  activeFilters: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  activeFiltersLabel: {
    color: COLORS.textTertiary,
    marginBottom: SPACING.sm,
  },
  activeFiltersTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  filterTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primaryAccent + "10",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: LAYOUT.borderRadius.md,
    borderWidth: 1,
    borderColor: COLORS.primaryAccent + "20",
  },
  filterTagText: {
    marginLeft: SPACING.xs,
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "500",
  },
});
