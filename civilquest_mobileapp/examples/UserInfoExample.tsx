import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useAuth } from "../hooks/useAuth";
import { useAppSelector } from "../store";
import {
  selectUserEmail,
  selectUserRole,
  selectTokenUser,
} from "../store/slices/authSlice";

// Example component showing different ways to access user email and role globally
export const UserInfoExample = () => {
  // Method 1: Using the useAuth hook (recommended)
  const { userEmail, userRole, tokenUser, isAuthenticated } = useAuth();

  // Method 2: Using selectors directly with useAppSelector
  const emailDirect = useAppSelector(selectUserEmail);
  const roleDirect = useAppSelector(selectUserRole);
  const tokenUserDirect = useAppSelector(selectTokenUser);

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>User not authenticated</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Information (Global Access)</Text>

      {/* Method 1: Using useAuth hook */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Using useAuth hook:</Text>
        <Text style={styles.info}>Email: {userEmail}</Text>
        <Text style={styles.info}>Role: {userRole}</Text>
        <Text style={styles.info}>
          Token User: {JSON.stringify(tokenUser, null, 2)}
        </Text>
      </View>

      {/* Method 2: Using selectors directly */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Using selectors directly:</Text>
        <Text style={styles.info}>Email: {emailDirect}</Text>
        <Text style={styles.info}>Role: {roleDirect}</Text>
        <Text style={styles.info}>
          Token User: {JSON.stringify(tokenUserDirect, null, 2)}
        </Text>
      </View>

      {/* Role-based rendering example */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Role-based rendering:</Text>
        {userRole === "PREMIUM_USER" && (
          <Text style={[styles.info, styles.premium]}>
            ✨ Premium User Features Available
          </Text>
        )}
        {userRole === "USER" && (
          <Text style={styles.info}>👤 Standard User</Text>
        )}
        {userRole === "ADMIN" && (
          <Text style={[styles.info, styles.admin]}>
            🔧 Admin Access Granted
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  section: {
    backgroundColor: "white",
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },
  info: {
    fontSize: 14,
    marginBottom: 5,
    color: "#666",
  },
  premium: {
    color: "#DAA520",
    fontWeight: "bold",
  },
  admin: {
    color: "#DC143C",
    fontWeight: "bold",
  },
});

export default UserInfoExample;
