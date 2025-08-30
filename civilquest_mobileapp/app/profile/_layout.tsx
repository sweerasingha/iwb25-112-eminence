import React from "react";
import { Stack } from "expo-router";
import { Redirect } from "expo-router";
import { useAuth } from "../../hooks";
import { ActivityIndicator, View } from "react-native";
import { COLORS } from "../../theme";

export default function ProfileLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: COLORS.background,
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Redirect href="/auth/login" />;
  }

  return (
    <Stack>
      <Stack.Screen name="apply-premium" options={{ title: "Apply Premium", headerShown: false }} />
      <Stack.Screen name="manage-events" options={{ title: "My Events", headerShown: false }} />
      <Stack.Screen
        name="sponsorship-approval"
        options={{ title: "Sponsorship Approval" }}
      />
    </Stack>
  );
}
