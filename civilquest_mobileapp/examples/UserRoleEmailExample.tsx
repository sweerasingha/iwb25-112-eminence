import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useAuth } from "../hooks";
import { useAppSelector } from "../store";
import {
  selectUserEmail,
  selectUserRole,
  selectTokenUser,
} from "../store/slices/authSlice";

// Example component showing different ways to access and use role and email
export const UserRoleEmailExample = () => {
  // Method 1: Using the useAuth hook (recommended for most cases)
  const { userEmail, userRole, tokenUser, isAuthenticated } = useAuth();

  // Method 2: Using selectors directly with useAppSelector
  const emailDirect = useAppSelector(selectUserEmail);
  const roleDirect = useAppSelector(selectUserRole);
  const tokenUserDirect = useAppSelector(selectTokenUser);

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Please log in to see user information</Text>
      </View>
    );
  }

  // Helper function to get role display name
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "PREMIUM_USER":
        return "Premium User";
      case "ADMIN":
        return "Administrator";
      case "USER":
        return "Standard User";
      default:
        return "Unknown Role";
    }
  };

  // Helper function to get role color
  const getRoleColor = (role: string) => {
    switch (role) {
      case "PREMIUM_USER":
        return "#DAA520";
      case "ADMIN":
        return "#DC143C";
      case "USER":
        return "#6c757d";
      default:
        return "#666";
    }
  };

  // Helper function to check permissions
  const hasPermission = (permission: string) => {
    switch (permission) {
      case "CREATE_EVENTS":
        return userRole === "PREMIUM_USER" || userRole === "ADMIN";
      case "MANAGE_USERS":
        return userRole === "ADMIN";
      case "VIEW_ANALYTICS":
        return userRole === "PREMIUM_USER" || userRole === "ADMIN";
      default:
        return false;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>User Role & Email Usage Examples</Text>

      {/* Basic User Information Display */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Basic User Information</Text>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{userEmail}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Role:</Text>
            <View
              style={[
                styles.roleBadge,
                { backgroundColor: getRoleColor(userRole || "") },
              ]}
            >
              <Text style={styles.roleBadgeText}>
                {getRoleDisplayName(userRole || "")}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Conditional Rendering Based on Role */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Role-Based Content</Text>
        <View style={styles.card}>
          {userRole === "PREMIUM_USER" && (
            <View style={styles.permissionItem}>
              <Text style={styles.permissionGranted}>
                ✅ Premium Features Unlocked
              </Text>
            </View>
          )}

          {userRole === "ADMIN" && (
            <View style={styles.permissionItem}>
              <Text style={styles.permissionGranted}>
                🔧 Admin Panel Access
              </Text>
            </View>
          )}

          {userRole === "USER" && (
            <View style={styles.permissionItem}>
              <Text style={styles.permissionDenied}>
                ⭐ Upgrade to Premium for more features
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Permission-Based Features */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. Permission-Based Features</Text>
        <View style={styles.card}>
          <View style={styles.permissionItem}>
            <Text style={styles.permissionLabel}>Create Events:</Text>
            <Text
              style={
                hasPermission("CREATE_EVENTS")
                  ? styles.permissionGranted
                  : styles.permissionDenied
              }
            >
              {hasPermission("CREATE_EVENTS") ? "✅ Allowed" : "❌ Denied"}
            </Text>
          </View>

          <View style={styles.permissionItem}>
            <Text style={styles.permissionLabel}>Manage Users:</Text>
            <Text
              style={
                hasPermission("MANAGE_USERS")
                  ? styles.permissionGranted
                  : styles.permissionDenied
              }
            >
              {hasPermission("MANAGE_USERS") ? "✅ Allowed" : "❌ Denied"}
            </Text>
          </View>

          <View style={styles.permissionItem}>
            <Text style={styles.permissionLabel}>View Analytics:</Text>
            <Text
              style={
                hasPermission("VIEW_ANALYTICS")
                  ? styles.permissionGranted
                  : styles.permissionDenied
              }
            >
              {hasPermission("VIEW_ANALYTICS") ? "✅ Allowed" : "❌ Denied"}
            </Text>
          </View>
        </View>
      </View>

      {/* Email-Based Features */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>4. Email-Based Features</Text>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email Domain:</Text>
            <Text style={styles.value}>
              {userEmail?.split("@")[1] || "Unknown"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Username:</Text>
            <Text style={styles.value}>
              {userEmail?.split("@")[0] || "Unknown"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Gravatar:</Text>
            <Text style={styles.value}>
              {userEmail ? `Available for ${userEmail}` : "Not available"}
            </Text>
          </View>
        </View>
      </View>

      {/* Token Information (Development) */}
      {__DEV__ && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            5. Token Information (Dev Mode)
          </Text>
          <View style={styles.debugCard}>
            <Text style={styles.debugTitle}>useAuth Hook Data:</Text>
            <Text style={styles.debugText}>
              Email: {userEmail}
              {"\n"}Role: {userRole}
              {"\n"}Token User: {JSON.stringify(tokenUser, null, 2)}
            </Text>

            <Text style={styles.debugTitle}>Direct Selectors:</Text>
            <Text style={styles.debugText}>
              Email (direct): {emailDirect}
              {"\n"}Role (direct): {roleDirect}
              {"\n"}Token User (direct):{" "}
              {JSON.stringify(tokenUserDirect, null, 2)}
            </Text>
          </View>
        </View>
      )}

      {/* Usage Examples in Code */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>6. Code Examples</Text>
        <View style={styles.codeCard}>
          <Text style={styles.codeTitle}>Method 1: Using useAuth Hook</Text>
          <Text style={styles.codeText}>
            {`const { userEmail, userRole } = useAuth();

// Conditional rendering
{userRole === 'PREMIUM_USER' && <PremiumFeature />}

// Email display
<Text>Welcome, {userEmail}!</Text>`}
          </Text>

          <Text style={styles.codeTitle}>Method 2: Using Selectors</Text>
          <Text style={styles.codeText}>
            {`const userEmail = useAppSelector(selectUserEmail);
const userRole = useAppSelector(selectUserRole);

// Permission checking
const canCreateEvents = userRole === 'PREMIUM_USER';`}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
    color: "#333",
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#444",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
    flex: 1,
  },
  value: {
    fontSize: 16,
    color: "#333",
    flex: 2,
    textAlign: "right",
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    flex: 2,
    alignItems: "flex-end",
  },
  roleBadgeText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  permissionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  permissionLabel: {
    fontSize: 16,
    color: "#666",
    flex: 1,
  },
  permissionGranted: {
    fontSize: 16,
    color: "#28a745",
    fontWeight: "bold",
  },
  permissionDenied: {
    fontSize: 16,
    color: "#dc3545",
    fontWeight: "bold",
  },
  debugCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007AFF",
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: "#666",
    fontFamily: "monospace",
    lineHeight: 16,
    marginBottom: 12,
  },
  codeCard: {
    backgroundColor: "#2d3748",
    borderRadius: 8,
    padding: 16,
  },
  codeTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#68d391",
    marginBottom: 8,
  },
  codeText: {
    fontSize: 12,
    color: "#e2e8f0",
    fontFamily: "monospace",
    lineHeight: 16,
    marginBottom: 16,
  },
});

export default UserRoleEmailExample;
