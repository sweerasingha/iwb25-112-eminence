import React from "react";
import { View, Text } from "react-native";

export default function UserRoleBadge({ role }: { role: string }) {
  return (
    <View
      style={{
        backgroundColor: role === "Premium" ? "gold" : "gray",
        padding: 4,
        borderRadius: 4,
      }}
    >
      <Text style={{ color: "#fff" }}>{role}</Text>
    </View>
  );
}
