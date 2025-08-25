import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Modal from "react-native-modal";
import { Button } from "react-native-paper";
import { globalStyles, COLORS, SPACING } from "../../theme";
import { Ionicons } from "@expo/vector-icons";

export interface DateTimePickerProps {
  label?: string;
  value: Date;
  mode: "date" | "time";
  onChange: (date: Date) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
}

export const CustomDateTimePicker: React.FC<DateTimePickerProps> = ({
  label,
  value,
  mode,
  onChange,
  placeholder,
  error,
  required,
  minimumDate,
  maximumDate,
}) => {
  const [show, setShow] = useState(false);
  const [tempDate, setTempDate] = useState(value);

  const formatDate = (date: Date): string => {
    if (mode === "date") {
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } else {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShow(false);
    }
    
    if (selectedDate) {
      setTempDate(selectedDate);
      if (Platform.OS === "android") {
        onChange(selectedDate);
      }
    }
  };

  const handleConfirm = () => {
    onChange(tempDate);
    setShow(false);
  };

  const handleCancel = () => {
    setTempDate(value);
    setShow(false);
  };

  const showPicker = () => {
    setTempDate(value);
    setShow(true);
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
        onPress={showPicker}
      >
        <Text
          style={[
            styles.inputText,
            !value && styles.placeholder,
          ]}
        >
          {value ? formatDate(value) : placeholder}
        </Text>
        <Ionicons
          name={mode === "date" ? "calendar-outline" : "time-outline"}
          size={20}
          color={COLORS.primary}
          style={styles.icon}
        />
      </TouchableOpacity>

      {error && (
        <Text style={[globalStyles.errorText, styles.errorText]}>{error}</Text>
      )}

      {Platform.OS === "ios" ? (
        <Modal
          isVisible={show}
          onBackdropPress={handleCancel}
          style={styles.modal}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Select {mode === "date" ? "Date" : "Time"}
              </Text>
            </View>
            
            <DateTimePicker
              value={tempDate}
              mode={mode}
              display="spinner"
              onChange={handleDateChange}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              style={styles.picker}
            />
            
            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={handleCancel}
                style={styles.button}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleConfirm}
                style={styles.button}
              >
                Confirm
              </Button>
            </View>
          </View>
        </Modal>
      ) : (
        show && (
          <DateTimePicker
            value={tempDate}
            mode={mode}
            display="default"
            onChange={handleDateChange}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
          />
        )
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
  picker: {
    backgroundColor: COLORS.surface,
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
