import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, LAYOUT, FONTS } from "theme";
import { InputField } from "./InputField";

interface ComboBoxProps {
  label: string;
  value: string;
  error?: string;
  helperText?: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder?: string;
}

export const ComboBox: React.FC<ComboBoxProps> = ({
  label,
  value,
  options,
  onChange,
  error,
  helperText,
  placeholder = "Select option",
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState("");

  // Filter options if more than 5
  const filteredOptions = useMemo(() => {
    if (options.length > 5 && search.trim() !== "") {
      return options.filter((opt) =>
        opt.toLowerCase().includes(search.toLowerCase())
      );
    }
    return options;
  }, [options, search]);

  const handleSelect = (item: string) => {
    onChange(item);
    setModalVisible(false);
    setSearch("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <TouchableOpacity
        style={styles.input}
        onPress={() => setModalVisible(true)}
      >
        <Text
          style={{
            color: value ? COLORS.textPrimary : COLORS.textTertiary,
            fontSize: 16,
          }}
        >
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
      </TouchableOpacity>
      {/* Helper Text or Error */}
      {(error || helperText) && (
        <View style={styles.feedbackContainer}>
          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={16} color={COLORS.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : (
            <Text style={styles.helperText}>{helperText}</Text>
          )}
        </View>
      )}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {options.length > 5 && (
              <InputField
                style={styles.searchInput}
                placeholder="Search..."
                value={search}
                onChangeText={setSearch}
              />
            )}

            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={styles.optionText}>{item}</Text>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setModalVisible(false);
                setSearch("");
              }}
            >
              <Text style={styles.closeText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  input: {
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: LAYOUT.borderRadius.md,
    padding: SPACING.xl,
    fontSize: 16,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.surface,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderTopLeftRadius: LAYOUT.borderRadius.xl,
    borderTopRightRadius: LAYOUT.borderRadius.xl,
    maxHeight: "60%",
  },
  searchInput: {
    borderWidth: 2,
    borderColor: COLORS.backgroundSecondary,
    borderRadius: LAYOUT.borderRadius.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    color: COLORS.textPrimary,
  },
  option: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.backgroundSecondary,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  closeButton: {
    marginTop: SPACING.md,
    alignItems: "center",
  },
  closeText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
  },
  // Feedback
  feedbackContainer: {
    marginTop: SPACING.md,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  errorText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.error,
    fontWeight: FONTS.weights.medium,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  helperText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textTertiary,
    fontWeight: FONTS.weights.regular,
  },
});
