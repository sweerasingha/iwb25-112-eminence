import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, LAYOUT } from "../../theme";
import { Event } from "../../types";

interface Sponsor {
  id: string;
  userId: string;
  amount: string;
  description?: string;
  sponsorType?: string;
  approvedStatus: string;
  createdAt?: string;
  updatedAt?: string;
}

interface SponsorsModalProps {
  visible: boolean;
  event: Event | null;
  sponsors: Sponsor[];
  sponsorActions: { [key: string]: boolean };
  onClose: () => void;
  onApproveSponsor: (sponsorId: string) => void;
  onRejectSponsor: (sponsorId: string) => void;
}

export default function SponsorsModal({
  visible,
  event,
  sponsors,
  sponsorActions,
  onClose,
  onApproveSponsor,
  onRejectSponsor,
}: SponsorsModalProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return COLORS.success;
      case "PENDING":
        return COLORS.warning;
      case "REJECTED":
        return COLORS.error;
      default:
        return COLORS.textSecondary;
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
          <Text style={styles.modalTitle}>{event?.eventTitle} - Sponsors</Text>
          <View style={styles.modalHeaderSpace} />
        </View>

        <ScrollView style={styles.modalContent}>
          {sponsors.length === 0 ? (
            <View style={styles.emptySponsorsContainer}>
              <Ionicons
                name="gift-outline"
                size={64}
                color={COLORS.textTertiary}
              />
              <Text style={styles.emptySponsorsTitle}>No Sponsors Yet</Text>
              <Text style={styles.emptySponsorsMessage}>
                This event doesn't have any sponsors at the moment.
              </Text>
            </View>
          ) : (
            sponsors.map((sponsor, index) => (
              <View key={index} style={styles.sponsorCard}>
                <View style={styles.sponsorHeader}>
                  <View style={styles.sponsorIcon}>
                    <Ionicons
                      name="business"
                      size={24}
                      color={COLORS.primary}
                    />
                  </View>
                  <View style={styles.sponsorInfo}>
                    <Text style={styles.sponsorName}>
                      {sponsor.userId
                        ?.split("@")[0]
                        ?.replace(/\./g, " ")
                        .replace(/\b\w/g, (l: string) => l.toUpperCase()) ||
                        `Sponsor ${index + 1}`}
                    </Text>
                    <Text style={styles.sponsorType}>
                      {sponsor.sponsorType || "General Sponsor"} Sponsor
                    </Text>
                    <Text style={styles.sponsorEmail}>{sponsor.userId}</Text>
                  </View>
                  <View style={styles.sponsorAmount}>
                    <Text style={styles.sponsorAmountText}>
                      ₨{sponsor.amount || "0"}
                    </Text>
                  </View>
                </View>
                {sponsor.description && (
                  <Text style={styles.sponsorDescription}>
                    {sponsor.description}
                  </Text>
                )}
                <View style={styles.sponsorMeta}>
                  <View style={styles.sponsorDates}>
                    {sponsor.createdAt && (
                      <Text style={styles.sponsorDate}>
                        Applied:{" "}
                        {new Date(sponsor.createdAt).toLocaleDateString()}
                      </Text>
                    )}
                    {sponsor.updatedAt &&
                      sponsor.approvedStatus === "APPROVED" && (
                        <Text style={styles.sponsorDate}>
                          Approved:{" "}
                          {new Date(sponsor.updatedAt).toLocaleDateString()}
                        </Text>
                      )}
                  </View>
                  <View style={styles.sponsorStatus}>
                    <Text
                      style={[
                        styles.sponsorStatusText,
                        {
                          color: getStatusColor(
                            sponsor.approvedStatus || "PENDING"
                          ),
                        },
                      ]}
                    >
                      {sponsor.approvedStatus || "PENDING"}
                    </Text>
                  </View>
                </View>

                {/* Action buttons for pending sponsors */}
                {sponsor.approvedStatus === "PENDING" && (
                  <View style={styles.sponsorActions}>
                    <TouchableOpacity
                      style={[styles.sponsorActionButton, styles.approveButton]}
                      onPress={() => onApproveSponsor(sponsor.id)}
                      disabled={sponsorActions[sponsor.id]}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={COLORS.white}
                      />
                      <Text style={styles.sponsorActionButtonText}>
                        {sponsorActions[sponsor.id]
                          ? "Approving..."
                          : "Approve"}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.sponsorActionButton, styles.rejectButton]}
                      onPress={() => onRejectSponsor(sponsor.id)}
                      disabled={sponsorActions[sponsor.id]}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="close" size={16} color={COLORS.white} />
                      <Text style={styles.sponsorActionButtonText}>
                        {sponsorActions[sponsor.id] ? "Rejecting..." : "Reject"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )}
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
  emptySponsorsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: SPACING.xxl,
  },
  emptySponsorsTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptySponsorsMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    maxWidth: 250,
  },
  sponsorCard: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.borderRadius.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.backgroundSecondary,
  },
  sponsorHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  sponsorIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  sponsorInfo: {
    flex: 1,
  },
  sponsorName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  sponsorType: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textTransform: "capitalize",
    marginBottom: SPACING.xs,
  },
  sponsorEmail: {
    fontSize: 11,
    color: COLORS.textTertiary,
    fontStyle: "italic",
  },
  sponsorAmount: {
    backgroundColor: COLORS.success + "20",
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: LAYOUT.borderRadius.sm,
  },
  sponsorAmountText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.success,
  },
  sponsorDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  sponsorMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sponsorDates: {
    flex: 1,
  },
  sponsorDate: {
    fontSize: 11,
    color: COLORS.textTertiary,
    marginBottom: SPACING.xs,
  },
  sponsorStatus: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: LAYOUT.borderRadius.sm,
    backgroundColor: COLORS.backgroundSecondary,
  },
  sponsorStatusText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  sponsorActions: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.backgroundSecondary,
  },
  sponsorActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: LAYOUT.borderRadius.sm,
    flex: 1,
    minHeight: 40,
  },
  approveButton: {
    backgroundColor: COLORS.success,
  },
  rejectButton: {
    backgroundColor: COLORS.error,
  },
  sponsorActionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.white,
    marginLeft: SPACING.xs,
  },
});
