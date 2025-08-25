import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { globalStyles, COLORS, SPACING } from "../../theme";

export interface SponsorshipDropdownProps {
  label?: string;
  error?: string;
  required?: boolean;
  value: string;
  onSelect: (value: string) => void;
  options: string[];
  placeholder?: string;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
}

export const SponsorshipDropdown: React.FC<SponsorshipDropdownProps> = ({
  label,
  error,
  required,
  value,
  onSelect,
  options,
  placeholder = "Select an option",
  containerStyle,
  labelStyle,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasError = Boolean(error);

  const handleSelect = (option: string) => {
    onSelect(option);
    setIsOpen(false);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[globalStyles.label, styles.label, labelStyle]}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      <TouchableOpacity
        style={[
          globalStyles.input,
          styles.dropdown,
          hasError && globalStyles.inputError,
        ]}
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text style={[styles.dropdownText, !value && styles.placeholder]}>
          {value || placeholder}
        </Text>
        <Text style={styles.dropdownArrow}>{isOpen ? "▲" : "▼"}</Text>
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.dropdownOptions}>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={styles.dropdownOption}
              onPress={() => handleSelect(option)}
            >
              <Text style={styles.dropdownOptionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {error && (
        <Text style={[globalStyles.errorText, styles.errorText]}>{error}</Text>
      )}
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
  placeholder: {
    color: COLORS.textTertiary,
  },
  dropdownArrow: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  dropdownOptions: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    maxHeight: 200,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  dropdownOption: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dropdownOptionText: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  errorText: {
    marginTop: SPACING.xs,
  },
});
