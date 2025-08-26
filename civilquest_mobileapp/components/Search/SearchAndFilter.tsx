import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { globalStyles, COLORS, SPACING, LAYOUT, FONTS } from "../../theme";

interface SearchAndFilterProps {
  searchValue: string;
  selectedCity: string;
  selectedType: string;
  cities: string[];
  eventTypes: string[];
  onSearchChange: (text: string) => void;
  onCityChange: (city: string) => void;
  onTypeChange: (type: string) => void;
  onClearFilters: () => void;
}

export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchValue,
  selectedCity,
  selectedType,
  cities,
  eventTypes,
  onSearchChange,
  onCityChange,
  onTypeChange,
  onClearFilters,
}) => {
  const [showCityModal, setShowCityModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const hasActiveFilters = selectedCity || selectedType;
  const activeFiltersCount = (selectedCity ? 1 : 0) + (selectedType ? 1 : 0);

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
            data={[
              { value: "", label: `All ${title}`, isAll: true },
              ...data.map((item) => ({
                value: item,
                label: item,
                isAll: false,
              })),
            ]}
            keyExtractor={(item) => item.value || "all"}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.modalItem,
                  selectedValue === item.value && styles.modalItemSelected,
                ]}
                onPress={() => {
                  onSelect(item.value);
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <View style={styles.modalItemContent}>
                  <Text
                    style={[
                      styles.modalItemText,
                      selectedValue === item.value &&
                        styles.modalItemTextSelected,
                      item.isAll && styles.modalItemTextAll,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {selectedValue === item.value && (
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
      <View
        style={[
          styles.searchContainer,
          isFocused && styles.searchContainerFocused,
        ]}
      >
        <Ionicons name="search" size={20} color={COLORS.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search events, locations..."
          placeholderTextColor={COLORS.textTertiary}
          value={searchValue}
          onChangeText={onSearchChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {searchValue.length > 0 && (
          <TouchableOpacity
            onPress={() => onSearchChange("")}
            style={styles.clearSearchButton}
          >
            <Ionicons
              name="close-circle"
              size={20}
              color={COLORS.textTertiary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Buttons */}
      <View style={styles.filtersContainer}>
        <View style={styles.filterButtons}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedCity && styles.filterButtonActive,
            ]}
            onPress={() => setShowCityModal(true)}
            activeOpacity={0.8}
          >
            <Ionicons
              name="location"
              size={16}
              color={selectedCity ? COLORS.white : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.filterButtonText,
                selectedCity && styles.filterButtonTextActive,
              ]}
            >
              {selectedCity || "City"}
            </Text>
            <Ionicons
              name="chevron-down"
              size={16}
              color={selectedCity ? COLORS.white : COLORS.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedType && styles.filterButtonActive,
            ]}
            onPress={() => setShowTypeModal(true)}
            activeOpacity={0.8}
          >
            <Ionicons
              name="pricetag"
              size={16}
              color={selectedType ? COLORS.white : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.filterButtonText,
                selectedType && styles.filterButtonTextActive,
              ]}
            >
              {selectedType || "Type"}
            </Text>
            <Ionicons
              name="chevron-down"
              size={16}
              color={selectedType ? COLORS.white : COLORS.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {hasActiveFilters && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={onClearFilters}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh" size={16} color={COLORS.white} />
            <Text style={styles.clearButtonText}>
              Clear ({activeFiltersCount})
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Modals */}
      <FilterModal
        visible={showCityModal}
        onClose={() => setShowCityModal(false)}
        title="Cities"
        data={cities}
        selectedValue={selectedCity}
        onSelect={onCityChange}
        icon="location"
      />

      <FilterModal
        visible={showTypeModal}
        onClose={() => setShowTypeModal(false)}
        title="Event Types"
        data={eventTypes}
        selectedValue={selectedType}
        onSelect={onTypeChange}
        icon="pricetag"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: SPACING.lg,
  },

  // Search Styles
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.borderRadius.xl,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    gap: SPACING.md,
    ...LAYOUT.shadows.xs,
  },
  searchContainerFocused: {
    borderColor: COLORS.primary,
    ...LAYOUT.shadows.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FONTS.sizes.lg,
    color: COLORS.textPrimary,
    fontWeight: FONTS.weights.regular,
  },
  clearSearchButton: {
    padding: SPACING.sm,
  },

  // Filter Styles
  filtersContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACING.md,
  },
  filterButtons: {
    flexDirection: "row",
    gap: SPACING.md,
    flex: 1,
  },
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
  filterButtonTextActive: {
    color: COLORS.white,
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
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

  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    flex: 1,
  },
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
  modalTitle: {
    color: COLORS.textPrimary,
    fontWeight: FONTS.weights.bold,
  },
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
  modalItemSelected: {
    backgroundColor: COLORS.primaryAccent + "10",
  },
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
  modalItemTextAll: {
    fontWeight: FONTS.weights.semibold,
  },
});

export default SearchAndFilter;
