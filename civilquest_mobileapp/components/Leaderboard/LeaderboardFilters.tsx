import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { InputField } from "../UI";
import { globalStyles, COLORS, SPACING, LAYOUT, FONTS } from "../../theme";
import { LeaderboardFilters as LeaderboardFiltersType } from "../../types";

interface LeaderboardFiltersProps {
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
  const [showCityModal, setShowCityModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const [localSearch, setLocalSearch] = useState(filters.search || "");

  // Debounce search input to prevent keyboard closing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.search) {
        onFiltersChange({ search: localSearch });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [localSearch]);

  const hasActiveFilters =
    filters.city !== "All Cities" ||
    filters.limit !== 20 ||
    Boolean(filters.search);

  const activeFiltersCount =
    (filters.city !== "All Cities" ? 1 : 0) +
    (filters.limit !== 20 ? 1 : 0) +
    (filters.search ? 1 : 0);

  const FilterModal = ({
    visible,
    onClose,
    title,
    data,
    selectedValue,
    onSelect,
    icon,
  }: {
    visible: boolean;
    onClose: () => void;
    title: string;
    data: string[];
    selectedValue: string;
    onSelect: (value: string) => void;
    icon: string;
  }) => (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <BlurView intensity={20} style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          onPress={onClose}
          activeOpacity={1}
        />
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleContainer}>
              <Ionicons name={icon as any} size={24} color={COLORS.primary} />
              <Text style={[globalStyles.h3, styles.modalTitle]}>{title}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={data}
            keyExtractor={(item, index) => `${item}-${index}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.modalItem,
                  selectedValue === item && styles.modalItemSelected,
                ]}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <View style={styles.modalItemContent}>
                  <Text
                    style={[
                      styles.modalItemText,
                      selectedValue === item && styles.modalItemTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                  {selectedValue === item && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={COLORS.primary}
                    />
                  )}
                </View>
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </BlurView>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <InputField
        placeholder="Search ..."
        variant="filled"
        leftIcon="search"
        value={localSearch}
        onChangeText={setLocalSearch}
        style={{
          width: "100%",
          borderColor: COLORS.primary,
          borderWidth: 2,
          backgroundColor: "#D0E8FF",
        }}
        size="medium"
      />

      {/* Filter Buttons */}
      <View style={styles.filterButtons}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filters.city !== "All Cities" && styles.filterButtonActive,
          ]}
          onPress={() => setShowCityModal(true)}
          activeOpacity={0.8}
        >
          <Ionicons
            name="location"
            size={16}
            color={
              filters.city !== "All Cities"
                ? COLORS.white
                : COLORS.textSecondary
            }
          />
          <Text
            style={[
              styles.filterButtonText,
              filters.city !== "All Cities" && styles.filterButtonTextActive,
            ]}
          >
            {filters.city !== "All Cities" ? filters.city : "City"}
          </Text>
          <Ionicons
            name="chevron-down"
            size={16}
            color={
              filters.city !== "All Cities"
                ? COLORS.white
                : COLORS.textSecondary
            }
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filters.limit !== 20 && styles.filterButtonActive,
          ]}
          onPress={() => setShowLimitModal(true)}
          activeOpacity={0.8}
        >
          <Ionicons
            name="list"
            size={16}
            color={filters.limit !== 20 ? COLORS.white : COLORS.textSecondary}
          />
          <Text
            style={[
              styles.filterButtonText,
              filters.limit !== 20 && styles.filterButtonTextActive,
            ]}
          >
            {filters.limit} Results
          </Text>
          <Ionicons
            name="chevron-down"
            size={16}
            color={filters.limit !== 20 ? COLORS.white : COLORS.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Clear Button */}
      {hasActiveFilters && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={onClearFilters}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          <Ionicons name="refresh" size={16} color={COLORS.white} />
          <Text style={styles.clearButtonText}>
            Clear Filters ({activeFiltersCount})
          </Text>
        </TouchableOpacity>
      )}

      {/* Modals */}
      <FilterModal
        visible={showCityModal}
        onClose={() => setShowCityModal(false)}
        title="Select City"
        data={[...new Set(["All Cities", ...availableCities])]}
        selectedValue={filters.city}
        onSelect={(value) => onFiltersChange({ city: value })}
        icon="location"
      />

      <FilterModal
        visible={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        title="Results per Page"
        data={limitOptions.map((l) => l.toString())}
        selectedValue={filters.limit.toString()}
        onSelect={(value) => onFiltersChange({ limit: parseInt(value, 10) })}
        icon="list"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: SPACING.sm,marginTop:SPACING.lg },
  filterButtons: { flexDirection: "row", gap: SPACING.md },
  filterButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderRadius: LAYOUT.borderRadius.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    gap: SPACING.sm,
    ...LAYOUT.shadows.xs,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  filterButtonTextActive: { color: COLORS.white },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderRadius: LAYOUT.borderRadius.lg,
    backgroundColor: COLORS.error,
    gap: SPACING.sm,
    ...LAYOUT.shadows.xs,
  },
  clearButtonText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.white,
  },
  modalOverlay: { flex: 1, justifyContent: "flex-end" },
  modalBackdrop: { flex: 1 },
  modalContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: LAYOUT.borderRadius.xxl,
    borderTopRightRadius: LAYOUT.borderRadius.xxl,
    maxHeight: "70%",
    paddingBottom: SPACING.xl,
    ...LAYOUT.shadows.xl,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  modalTitle: { color: COLORS.textPrimary, fontWeight: FONTS.weights.bold },
  modalCloseButton: {
    padding: SPACING.md,
    borderRadius: LAYOUT.borderRadius.lg,
    backgroundColor: COLORS.backgroundSecondary,
  },
  modalItem: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalItemSelected: { backgroundColor: COLORS.primaryAccent + "10" },
  modalItemContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalItemText: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.textPrimary,
    fontWeight: FONTS.weights.regular,
  },
  modalItemTextSelected: {
    color: COLORS.primary,
    fontWeight: FONTS.weights.semibold,
  },
});

export default LeaderboardFilters;
