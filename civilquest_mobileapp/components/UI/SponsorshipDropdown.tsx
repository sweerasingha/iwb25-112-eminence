import React, { useState } from "react";
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
import { globalStyles, COLORS, SPACING, LAYOUT, FONTS } from "../../theme";

export interface SponsorshipDropdownProps {
  label?: string;
  error?: string;
  required?: boolean;
  value: string;
  onSelect: (value: string) => void;
  options: string[];
  placeholder?: string;
}

export const SponsorshipDropdown: React.FC<SponsorshipDropdownProps> = ({
  label,
  error,
  required,
  value,
  onSelect,
  options,
  placeholder = "Select an option",
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleSelect = (option: string) => {
    onSelect(option);
    setIsModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[globalStyles.label, styles.label]}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      {/* Dropdown Trigger */}
      <TouchableOpacity
        style={[
          globalStyles.input,
          styles.dropdown,
          error && globalStyles.inputError,
        ]}
        onPress={() => setIsModalVisible(true)}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.dropdownText,
            !value && { color: COLORS.textTertiary },
          ]}
        >
          {value || placeholder}
        </Text>
        <Ionicons
          name="chevron-down"
          size={18}
          color={COLORS.textSecondary}
          style={{ marginLeft: SPACING.sm }}
        />
      </TouchableOpacity>

      {/* Error Text */}
      {error && (
        <Text style={[globalStyles.errorText, styles.errorText]}>{error}</Text>
      )}

      {/* Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
      >
        <BlurView intensity={20} style={styles.modalOverlay}>
          {/* Close on background press */}
          <TouchableOpacity
            style={styles.modalBackdrop}
            onPress={() => setIsModalVisible(false)}
            activeOpacity={1}
          />

          {/* Modal Content */}
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={[globalStyles.h3, styles.modalTitle]}>
                {label || "Select"}
              </Text>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    value === item && styles.modalItemSelected,
                  ]}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.modalItemContent}>
                    <Text
                      style={[
                        styles.modalItemText,
                        value === item && styles.modalItemTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
                    {value === item && (
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    marginBottom: SPACING.xs,
  },
  required: {
    color: COLORS.error,
  },
  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    flex: 1,
  },
  errorText: {
    marginTop: SPACING.xs,
  },

  // Modal
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
    ...LAYOUT.shadows.lg,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalTitle: {
    color: COLORS.textPrimary,
    fontWeight: FONTS.weights.bold,
  },
  modalCloseButton: {
    padding: SPACING.sm,
    borderRadius: LAYOUT.borderRadius.md,
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
    fontSize: FONTS.sizes.md,
    color: COLORS.textPrimary,
  },
  modalItemTextSelected: {
    color: COLORS.primary,
    fontWeight: FONTS.weights.semibold,
  },
});
