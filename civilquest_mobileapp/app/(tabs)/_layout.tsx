import React from "react";
import { Tabs } from "expo-router";
import { Redirect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../hooks";
import { Loading } from "../../components";
import { COLORS, LAYOUT } from "../../theme";

export default function TabLayout() {
  const { isAuthenticated, isLoading, userRole } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <Loading
        visible={true}
        message="Checking authentication..."
        variant="overlay"
        fullScreen
      />
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Redirect href="/auth/login" />;
  }

  // User is authenticated, show the tabs
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textTertiary,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopWidth: 1,
          borderTopColor: COLORS.borderLight,
          height: LAYOUT.tabBarHeight,
          paddingBottom: 8,
          paddingTop: 8,
          ...LAYOUT.shadows.sm,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginBottom: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: "Leaderboard",
          tabBarLabel: "Leaderboard",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "trophy" : "trophy-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      (
      <Tabs.Screen
        name="my-events"
        options={{
          title: "My Events",
          tabBarLabel: "My Events",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "calendar" : "calendar-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      )
    </Tabs>
  );
}
