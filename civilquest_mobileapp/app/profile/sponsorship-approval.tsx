import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { Button } from "../../components";
import { globalStyles, COLORS, SPACING, LAYOUT } from "../../theme";
import { sponsorshipService } from "../../services/sponsorship";
import { Sponsorship } from "../../types";

export default function SponsorshipApprovalScreen() {
  const { eventId } = useLocalSearchParams();
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadSponsorships();
  }, [eventId]);

  const loadSponsorships = async () => {
    try {
      setLoading(true);
      const response = await sponsorshipService.getEventSponsorships(
        eventId as string
      );
      if (response.success && response.data) {
        setSponsorships(response.data);
      } else {
        Alert.alert("Error", response.error || "Failed to load sponsorships");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load sponsorships");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSponsorships();
    setRefreshing(false);
  };

  const handleApprove = async (sponsorshipId: string) => {
    Alert.alert(
      "Approve Sponsor",
      "Are you sure you want to approve this sponsorship?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Approve",
          style: "default",
          onPress: async () => {
            try {
              setProcessingId(sponsorshipId);
              const response = await sponsorshipService.approveSponsor(
                sponsorshipId
              );

              if (response.success) {
                Alert.alert("Success", "Sponsorship approved successfully!");
                await loadSponsorships(); 
              } else {
                Alert.alert(
                  "Error",
                  response.error || "Failed to approve sponsorship"
                );
              }
            } catch (error) {
              Alert.alert("Error", "Failed to approve sponsorship");
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const handleReject = async (sponsorshipId: string) => {
    Alert.alert(
      "Reject Sponsor",
      "Are you sure you want to reject this sponsorship?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: async () => {
            try {
              setProcessingId(sponsorshipId);
              const response = await sponsorshipService.rejectSponsor(
                sponsorshipId
              );

              if (response.success) {
                Alert.alert("Success", "Sponsorship rejected successfully!");
                await loadSponsorships(); 
              } else {
                Alert.alert(
                  "Error",
                  response.error || "Failed to reject sponsorship"
                );
              }
            } catch (error) {
              Alert.alert("Error", "Failed to reject sponsorship");
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return COLORS.success;
      case "rejected":
        return COLORS.error;
      case "pending":
      default:
        return COLORS.warning;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "checkmark-circle";
      case "rejected":
        return "close-circle";
      case "pending":
      default:
        return "time";
    }
  };

  const renderSponsorCard = ({ item }: { item: Sponsorship }) => (
    <View style={styles.sponsorCard}>
      <LinearGradient
        colors={[COLORS.surface, COLORS.backgroundSecondary]}
        style={styles.cardGradient}
      >
        {/* Status Badge */}
        <View style={styles.cardHeader}>
          <View style={styles.sponsorInfo}>
            <Ionicons name="business" size={24} color={COLORS.primary} />
            <Text style={styles.sponsorType}>{item.sponsorType}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            <Ionicons
              name={getStatusIcon(item.status)}
              size={12}
              color={COLORS.white}
            />
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        {/* Sponsor Details */}
        <View style={styles.cardContent}>
          <View style={styles.amountContainer}>
            <Ionicons name="cash" size={20} color={COLORS.success} />
            <Text style={styles.amount}>₨{item.amount_donation}</Text>
          </View>

          <Text style={styles.description}>{item.description}</Text>
        </View>

        {/* Action Buttons , Only show for pending sponsorships */}
        {item.status?.toLowerCase() === "pending" && (
          <View style={styles.actionButtons}>
            <Button
              title="Approve"
              variant="primary"
              size="small"
              onPress={() => handleApprove(item.id)}
              loading={processingId === item.id}
              disabled={processingId !== null}
              style={styles.approveButton}
            />
            <Button
              title="Reject"
              variant="danger"
              size="small"
              onPress={() => handleReject(item.id)}
              loading={processingId === item.id}
              disabled={processingId !== null}
              style={styles.rejectButton}
            />
          </View>
        )}
      </LinearGradient>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientEnd]}
        style={styles.headerGradient}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Sponsor Requests</Text>
          <Text style={styles.headerSubtitle}>
            {sponsorships.length} request{sponsorships.length !== 1 ? "s" : ""}
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <Ionicons name="gift" size={24} color={COLORS.white} />
        </View>
      </LinearGradient>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="gift-outline" size={64} color={COLORS.textTertiary} />
      <Text style={styles.emptyTitle}>No Sponsor Requests</Text>
      <Text style={styles.emptyMessage}>
        No sponsorship requests have been submitted for this event yet.
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[globalStyles.container, globalStyles.centerContainer]}>
        <Text style={styles.loadingText}>Loading sponsorships...</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      {renderHeader()}

      {sponsorships.length === 0 ? (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        >
          {renderEmptyState()}
        </ScrollView>
      ) : (
        <FlatList
          data={sponsorships}
          keyExtractor={(item) => item.id}
          renderItem={renderSponsorCard}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  header: {
    backgroundColor: COLORS.backgroundSecondary,
    paddingTop: 50,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: SPACING.lg,
    shadowColor: COLORS.border,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: SPACING.lg,
    zIndex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    padding: SPACING.sm,
  },
  headerContent: {
    alignItems: "center",
  },
  headerIcon: {
    marginBottom: SPACING.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptyMessage: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  emptyText: {
    fontSize: 18,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  listContainer: {
    paddingBottom: SPACING.lg,
  },
  sponsorCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 16,
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
    shadowColor: COLORS.border,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  cardGradient: {
    borderRadius: 16,
    marginBottom: SPACING.lg,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  cardContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  sponsorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.md,
  },
  sponsorInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  sponsorName: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  sponsorEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  sponsorType: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textInverse,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
    textTransform: "uppercase",
  },
  eventName: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.primary,
  },
  sponsorshipDetails: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
    marginVertical: SPACING.md,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  amountLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginRight: SPACING.sm,
  },
  amount: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.success,
  },
  typeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  typeLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginRight: SPACING.sm,
  },
  type: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.textPrimary,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginTop: SPACING.sm,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  pendingBadge: {
    backgroundColor: COLORS.warningBg,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  pendingText: {
    color: COLORS.warning,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: SPACING.lg,
    gap: SPACING.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  approveButton: {
    backgroundColor: COLORS.success,
  },
  rejectButton: {
    backgroundColor: COLORS.error,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textInverse,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});
