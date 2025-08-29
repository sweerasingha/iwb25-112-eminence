import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

import { Button, Loading } from "../../components";
import { useAuth } from "../../hooks";
import { globalStyles, COLORS, SPACING, LAYOUT } from "../../theme";
import { userService } from "../../services/user";
import { User } from "../../types";

export default function ProfileScreen() {
  const router = useRouter();
  const { logout, user, isLoading, userRole, userEmail, tokenUser } = useAuth();

  const [profile, setProfile] = useState<User | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    username: "",
    address: "",
    hometown: "",
    livingCity: "",
    gender: "",
    nationalid: "",
  });

  // Check if user is premium
  const isPremiumUser = userRole === "PREMIUM_USER";

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setProfileLoading(true);
      const response = await userService.getProfile();
      if (response.success && response.data) {
        setProfile(response.data);
        // Initialize edit form with current data
        setEditForm({
          username: response.data.username || "",
          address: response.data.address || "",
          hometown: response.data.hometown || "",
          livingCity: response.data.livingCity || "",
          gender: response.data.gender || "",
          nationalid: response.data.nationalid || "",
        });
      } else {
        Alert.alert("Error", response.error || "Failed to load profile");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  };

  const handleEditProfile = () => {
    setEditModalVisible(true);
  };

  const handleUpdateProfile = async () => {
    try {
      setUpdating(true);
      const response = await userService.updateProfile(editForm);
      if (response.success) {
        Alert.alert("Success", "Profile updated successfully");
        setEditModalVisible(false);
        await loadProfile(); 
      } else {
        Alert.alert("Error", response.error || "Failed to update profile");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const handleApplyPremium = async () => {
    Alert.alert(
      "Apply for Premium",
      "Are you sure you want to apply for premium status? Your application will be reviewed by our team.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Apply",
          style: "default",
          onPress: async () => {
            try {
              setUpdating(true);
              const response = await userService.applyForPremium();
              if (response.success) {
                Alert.alert(
                  "Success",
                  "Your premium application has been submitted successfully! You will be notified once it's reviewed.",
                  [{ text: "OK" }]
                );
              } else {
                Alert.alert(
                  "Error",
                  response.error || "Failed to apply for premium"
                );
              }
            } catch (error) {
              Alert.alert("Error", "Failed to apply for premium");
            } finally {
              setUpdating(false);
            }
          },
        },
      ]
    );
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.gradientStart, COLORS.gradientEnd]}
      style={styles.headerGradient}
    >
      <View style={styles.headerContent}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color={COLORS.white} />
          </View>
          {isPremiumUser && (
            <View style={styles.premiumBadge}>
              <Ionicons name="star" size={16} color={COLORS.white} />
            </View>
          )}
        </View>

        <View style={styles.headerTextContainer}>
          <Text style={styles.userName}>{profile?.name || "Unknown User"}</Text>
          <Text style={styles.userEmail}>{profile?.email}</Text>
          <View style={styles.roleContainer}>
            <Text style={styles.roleText}>
              {userRole === "PREMIUM_USER"
                ? " Premium User"
                : userRole === "ADMIN"
                ? " Admin"
                : " Standard User"}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Ionicons name="create-outline" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{profile?.points || 0}</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{profile?.verified ? "✓" : "✗"}</Text>
          <Text style={styles.statLabel}>Verified</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {profile?.otpVerified ? "✓" : "✗"}
          </Text>
          <Text style={styles.statLabel}>OTP Verified</Text>
        </View>
      </View>
    </LinearGradient>
  );

  const renderProfileDetails = () => (
    <View style={styles.detailsContainer}>
      <Text style={styles.sectionTitle}>Profile Details</Text>

      <View style={styles.detailsCard}>
        <DetailRow
          icon="person-outline"
          label="Username"
          value={profile?.username || "Not set"}
        />
        <DetailRow
          icon="call-outline"
          label="Phone Number"
          value={profile?.phoneNumber || "Not set"}
        />
        <DetailRow
          icon="location-outline"
          label="Address"
          value={profile?.address || "Not set"}
        />
        <DetailRow
          icon="home-outline"
          label="Hometown"
          value={profile?.hometown || "Not set"}
        />
        <DetailRow
          icon="business-outline"
          label="Living City"
          value={profile?.livingCity || "Not set"}
        />
        <DetailRow
          icon="male-female-outline"
          label="Gender"
          value={profile?.gender || "Not set"}
        />
        <DetailRow
          icon="card-outline"
          label="National ID"
          value={profile?.nationalid || "Not set"}
        />
      </View>
    </View>
  );

  const DetailRow = ({
    icon,
    label,
    value,
  }: {
    icon: string;
    label: string;
    value: string;
  }) => (
    <View style={styles.detailRow}>
      <View style={styles.detailRowLeft}>
        <Ionicons name={icon as any} size={20} color={COLORS.textSecondary} />
        <Text style={styles.detailLabel}>{label}</Text>
      </View>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );

  const renderActions = () => (
    <View style={styles.actionsContainer}>
      <Text style={styles.sectionTitle}>Actions</Text>

      {!isPremiumUser && (
        <Button
          title="Apply for Premium"
          variant="primary"
          fullWidth
          onPress={handleApplyPremium}
          loading={updating}
          disabled={updating}
          style={styles.actionButton}
        />
      )}

      {isPremiumUser && (
        <Button
          title="Manage My Events"
          variant="secondary"
          fullWidth
          onPress={() => router.push("/profile/manage-events")}
          style={styles.actionButton}
        />
      )}

      <Button
        title="Logout"
        variant="danger"
        fullWidth
        onPress={handleLogout}
        loading={isLoading}
        disabled={isLoading}
        style={styles.actionButton}
      />
    </View>
  );

  const renderEditModal = () => (
    <Modal
      visible={editModalVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setEditModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            onPress={() => setEditModalVisible(false)}
            style={styles.modalCloseButton}
          >
            <Ionicons name="close" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Edit Profile</Text>
          <View style={styles.modalHeaderSpace} />
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Username</Text>
            <TextInput
              style={styles.input}
              value={editForm.username}
              onChangeText={(text) =>
                setEditForm((prev) => ({ ...prev, username: text }))
              }
              placeholder="Enter username"
              placeholderTextColor={COLORS.textTertiary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Address</Text>
            <TextInput
              style={styles.input}
              value={editForm.address}
              onChangeText={(text) =>
                setEditForm((prev) => ({ ...prev, address: text }))
              }
              placeholder="Enter address"
              placeholderTextColor={COLORS.textTertiary}
              multiline
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Hometown</Text>
            <TextInput
              style={styles.input}
              value={editForm.hometown}
              onChangeText={(text) =>
                setEditForm((prev) => ({ ...prev, hometown: text }))
              }
              placeholder="Enter hometown"
              placeholderTextColor={COLORS.textTertiary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Living City</Text>
            <TextInput
              style={styles.input}
              value={editForm.livingCity}
              onChangeText={(text) =>
                setEditForm((prev) => ({ ...prev, livingCity: text }))
              }
              placeholder="Enter living city"
              placeholderTextColor={COLORS.textTertiary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Gender</Text>
            <TextInput
              style={styles.input}
              value={editForm.gender}
              onChangeText={(text) =>
                setEditForm((prev) => ({ ...prev, gender: text }))
              }
              placeholder="Enter gender (e.g., Male, Female, Other)"
              placeholderTextColor={COLORS.textTertiary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>National ID</Text>
            <TextInput
              style={styles.input}
              value={editForm.nationalid}
              onChangeText={(text) =>
                setEditForm((prev) => ({ ...prev, nationalid: text }))
              }
              placeholder="Enter national ID"
              placeholderTextColor={COLORS.textTertiary}
            />
          </View>

          <Button
            title="Update Profile"
            variant="primary"
            fullWidth
            onPress={handleUpdateProfile}
            loading={updating}
            disabled={updating}
            style={styles.updateButton}
          />
        </ScrollView>
      </View>
    </Modal>
  );

  if (profileLoading) {
    return (
      <View style={globalStyles.centerContainer}>
        <Loading
          visible={true}
          message="Loading profile..."
          variant="overlay"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {renderHeader()}
        {renderProfileDetails()}
        {renderActions()}
      </ScrollView>
      {renderEditModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },

  // Header Styles
  headerGradient: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    borderRadius: LAYOUT.borderRadius.xl,
    padding: SPACING.xl,
    ...LAYOUT.shadows.lg,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  premiumBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#DAA520",
    borderRadius: 12,
    padding: 4,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: SPACING.lg,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  userEmail: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: SPACING.sm,
  },
  roleContainer: {
    alignSelf: "flex-start",
  },
  roleText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.white,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: LAYOUT.borderRadius.sm,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Stats Styles
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },

  // Details Styles
  detailsContainer: {
    margin: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  detailsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.borderRadius.lg,
    padding: SPACING.lg,
    ...LAYOUT.shadows.sm,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.backgroundSecondary,
  },
  detailRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  detailLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: "400",
    textAlign: "right",
    flex: 1,
  },

  // Actions Styles
  actionsContainer: {
    margin: SPACING.lg,
    marginTop: 0,
  },
  actionButton: {
    marginBottom: SPACING.sm,
  },

  // Modal Styles
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
  updateButton: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
  },
});
