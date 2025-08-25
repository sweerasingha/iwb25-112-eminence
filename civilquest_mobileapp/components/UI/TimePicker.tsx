import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import Modal from "react-native-modal";
import { Button } from "react-native-paper";
import { globalStyles, COLORS, SPACING } from "../../theme";
import { Ionicons } from "@expo/vector-icons";

export interface TimePickerProps {
  label?: string;
  value: string; 
  onChange: (time: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
}

const TIME_PRESETS = [
  { label: "6:00 AM", value: "06:00" },
  { label: "7:00 AM", value: "07:00" },
  { label: "8:00 AM", value: "08:00" },
  { label: "9:00 AM", value: "09:00" },
  { label: "10:00 AM", value: "10:00" },
  { label: "11:00 AM", value: "11:00" },
  { label: "12:00 PM", value: "12:00" },
  { label: "1:00 PM", value: "13:00" },
  { label: "2:00 PM", value: "14:00" },
  { label: "3:00 PM", value: "15:00" },
  { label: "4:00 PM", value: "16:00" },
  { label: "5:00 PM", value: "17:00" },
  { label: "6:00 PM", value: "18:00" },
  { label: "7:00 PM", value: "19:00" },
  { label: "8:00 PM", value: "20:00" },
  { label: "9:00 PM", value: "21:00" },
  { label: "10:00 PM", value: "22:00" },
];

export const TimePicker: React.FC<TimePickerProps> = ({
  label,
  value,
  onChange,
  placeholder,
  error,
  required,
}) => {
  const [show, setShow] = useState(false);
  const [customTime, setCustomTime] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const formatTime = (time: string): string => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour12 = parseInt(hours) % 12 || 12;
    const ampm = parseInt(hours) >= 12 ? "PM" : "AM";
    return `${hour12}:${minutes} ${ampm}`;
  };

  const handlePresetSelect = (timeValue: string) => {
    onChange(timeValue);
    setShow(false);
  };

  const handleCustomTimeSubmit = () => {
    if (customTime.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
      onChange(customTime);
      setShow(false);
      setShowCustomInput(false);
      setCustomTime("");
    }
  };

  const hasError = Boolean(error);

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[globalStyles.label, styles.label]}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      <TouchableOpacity
        style={[
          globalStyles.input,
          styles.input,
          hasError && globalStyles.inputError,
        ]}
        onPress={() => setShow(true)}
      >
        <Text
          style={[
            styles.inputText,
            !value && styles.placeholder,
          ]}
        >
          {value ? formatTime(value) : placeholder}
        </Text>
        <Ionicons
          name="time-outline"
          size={20}
          color={COLORS.primary}
          style={styles.icon}
        />
      </TouchableOpacity>

      {error && (
        <Text style={[globalStyles.errorText, styles.errorText]}>{error}</Text>
      )}

      <Modal
        isVisible={show}
        onBackdropPress={() => {
          setShow(false);
          setShowCustomInput(false);
          setCustomTime("");
        }}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Time</Text>
          </View>

          {!showCustomInput ? (
            <ScrollView style={styles.presetContainer} showsVerticalScrollIndicator={false}>
              <View style={styles.presetGrid}>
                {TIME_PRESETS.map((preset) => (
                  <TouchableOpacity
                    key={preset.value}
                    style={[
                      styles.presetButton,
                      value === preset.value && styles.selectedPreset,
                    ]}
                    onPress={() => handlePresetSelect(preset.value)}
                  >
                    <Text
                      style={[
                        styles.presetText,
                        value === preset.value && styles.selectedPresetText,
                      ]}
                    >
                      {preset.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.customButton}
                onPress={() => setShowCustomInput(true)}
              >
                <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
                <Text style={styles.customButtonText}>Custom Time</Text>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            <View style={styles.customInputContainer}>
              <Text style={styles.customInputLabel}>Enter time (24-hour format):</Text>
              <View style={styles.customInputRow}>
                <View style={styles.inputField}>
                  <Text style={styles.inputLabel}>Hours (00-23)</Text>
                  <TouchableOpacity
                    style={styles.timeInput}
                    onPress={() => {
                    }}
                  >
                    <Text style={styles.timeInputText}>
                      {customTime.split(":")[0] || "00"}
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.timeSeparator}>:</Text>
                <View style={styles.inputField}>
                  <Text style={styles.inputLabel}>Minutes (00-59)</Text>
                  <TouchableOpacity
                    style={styles.timeInput}
                    onPress={() => {
                    }}
                  >
                    <Text style={styles.timeInputText}>
                      {customTime.split(":")[1] || "00"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.quickMinutes}>
                <Text style={styles.quickMinutesLabel}>Quick select minutes:</Text>
                <View style={styles.minuteButtons}>
                  {["00", "15", "30", "45"].map((minute) => (
                    <TouchableOpacity
                      key={minute}
                      style={styles.minuteButton}
                      onPress={() => {
                        const hour = customTime.split(":")[0] || "00";
                        setCustomTime(`${hour}:${minute}`);
                      }}
                    >
                      <Text style={styles.minuteButtonText}>{minute}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}

          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => {
                setShow(false);
                setShowCustomInput(false);
                setCustomTime("");
              }}
              style={styles.button}
            >
              Cancel
            </Button>
            {showCustomInput && (
              <Button
                mode="contained"
                onPress={handleCustomTimeSubmit}
                style={styles.button}
                disabled={!customTime.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)}
              >
                Confirm
              </Button>
            )}
          </View>
        </View>
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
  input: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  placeholder: {
    color: COLORS.textTertiary,
  },
  icon: {
    marginLeft: SPACING.sm,
  },
  errorText: {
    marginTop: SPACING.xs,
  },
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    maxHeight: "80%",
  },
  modalHeader: {
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  presetContainer: {
    maxHeight: 400,
  },
  presetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingVertical: SPACING.md,
  },
  presetButton: {
    width: "48%",
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
    alignItems: "center",
  },
  selectedPreset: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  presetText: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  selectedPresetText: {
    color: COLORS.surface,
    fontWeight: "600",
  },
  customButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    borderStyle: "dashed",
    marginVertical: SPACING.md,
  },
  customButtonText: {
    marginLeft: SPACING.sm,
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: "500",
  },
  customInputContainer: {
    paddingVertical: SPACING.lg,
  },
  customInputLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  customInputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.lg,
  },
  inputField: {
    alignItems: "center",
  },
  inputLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  timeInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    minWidth: 80,
    alignItems: "center",
  },
  timeInputText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  timeSeparator: {
    fontSize: 24,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginHorizontal: SPACING.md,
  },
  quickMinutes: {
    alignItems: "center",
  },
  quickMinutesLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  minuteButtons: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  minuteButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  minuteButtonText: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: SPACING.lg,
    gap: SPACING.md,
  },
  button: {
    flex: 1,
  },
});
