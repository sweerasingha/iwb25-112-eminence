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
import { COLORS, SPACING, LAYOUT } from "theme";

interface ComboBoxProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder?: string;
}

export const ComboBox: React.FC<ComboBoxProps> = ({
  label,
  value,
  options,
  onChange,
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
          style={{ color: value ? COLORS.textPrimary : COLORS.textTertiary }}
        >
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {options.length > 5 && (
              <TextInput
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
    borderWidth: 1,
    borderColor: COLORS.backgroundSecondary,
    borderRadius: LAYOUT.borderRadius.md,
    padding: SPACING.md,
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
});
