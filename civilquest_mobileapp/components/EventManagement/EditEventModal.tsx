import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../";
import { COLORS, SPACING, LAYOUT } from "../../theme";
import { Event } from "../../types";

interface EditEventModalProps {
  visible: boolean;
  event: Event | null;
  editForm: {
    eventTitle: string;
    eventDescription: string;
    reward: string;
  };
  updating: boolean;
  onClose: () => void;
  onUpdate: () => void;
  onFormChange: (field: string, value: string) => void;
}

export default function EditEventModal({
  visible,
  event,
  editForm,
  updating,
  onClose,
  onUpdate,
  onFormChange,
}: EditEventModalProps) {
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
            <Text style={styles.inputLabel}>Event Title</Text>
            <TextInput
              style={styles.input}
              value={editForm.eventTitle}
              onChangeText={(text) => onFormChange("eventTitle", text)}
              placeholder="Enter event title"
              placeholderTextColor={COLORS.textTertiary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Event Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={editForm.eventDescription}
              onChangeText={(text) => onFormChange("eventDescription", text)}
              placeholder="Enter event description"
              placeholderTextColor={COLORS.textTertiary}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Reward Points</Text>
            <TextInput
              style={styles.input}
              value={editForm.reward}
              onChangeText={(text) => onFormChange("reward", text)}
              placeholder="Enter reward points"
              placeholderTextColor={COLORS.textTertiary}
              keyboardType="numeric"
            />
          </View>

          <Button
            title="Update Event"
            variant="primary"
            fullWidth
            onPress={onUpdate}
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
  inputLabel: {
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
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  updateButton: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
  },
});
