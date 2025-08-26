import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { z } from "zod";
import { Button, InputField } from "../";
import { COLORS, SPACING, LAYOUT } from "../../theme";
import { Event } from "../../types";
import { useForm } from "../../hooks";

const editEventSchema = z.object({
  eventTitle: z.string().min(1, "Event title is required"),
  eventDescription: z.string().min(1, "Event description is required"),
  reward: z
    .string()
    .min(1, "Reward is required")
    .refine((val) => !isNaN(Number(val)), {
      message: "Reward must be a valid number",
    }),
});

type EditEventFormData = z.infer<typeof editEventSchema>;

interface EditEventModalProps {
  visible: boolean;
  event: Event | null;
  updating: boolean;
  onClose: () => void;
  onUpdate: (formData: EditEventFormData) => void;
}

export default function EditEventModal({
  visible,
  event,
  updating,
  onClose,
  onUpdate,
}: EditEventModalProps) {
  const {
    formData,
    errors,
    touched,
    isValid,
    handleChange,
    handleBlur,
    validate,
    getFieldProps,
    reset,
    setFormData,
  } = useForm<EditEventFormData>(
    {
      eventTitle: "",
      eventDescription: "",
      reward: "",
    },
    editEventSchema
  );

  // Reset form when event changes
  useEffect(() => {
    if (event && visible) {
      setFormData({
        eventTitle: event.eventTitle || "",
        eventDescription: event.eventDescription || "",
        reward: event.reward?.toString() || "",
      });
    }
  }, [event?.id, visible, setFormData]); // Only depend on event ID and modal visibility

  const handleFormSubmit = () => {
    const isValidForm = validate();
    if (isValidForm) {
      onUpdate(formData);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
            <Ionicons name="close" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Edit Event</Text>
          <View style={styles.modalHeaderSpace} />
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <InputField
              label="Event Title"
              placeholder="Enter event title"
              {...getFieldProps("eventTitle")}
              error={touched.eventTitle ? errors.eventTitle : undefined}
              required
            />
          </View>

          <View style={styles.inputGroup}>
            <InputField
              label="Event Description"
              placeholder="Enter event description"
              {...getFieldProps("eventDescription")}
              error={
                touched.eventDescription ? errors.eventDescription : undefined
              }
              multiline
              numberOfLines={4}
              required
            />
          </View>

          <View style={styles.inputGroup}>
            <InputField
              label="Reward Points"
              placeholder="Enter reward points"
              {...getFieldProps("reward")}
              error={touched.reward ? errors.reward : undefined}
              keyboardType="numeric"
              required
            />
          </View>

          <Button
            title="Update Event"
            variant="primary"
            fullWidth
            onPress={handleFormSubmit}
            loading={updating}
            disabled={updating}
            style={styles.updateButton}
          />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.backgroundSecondary,
    backgroundColor: COLORS.surface,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  modalHeaderSpace: {
    width: 32,
  },
  modalContent: {
    flex: 1,
    padding: SPACING.lg,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  updateButton: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
  },
});
