import React from "react";
import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen name="login" options={{ title: "Login" }} />
      <Stack.Screen name="signup" options={{ title: "Sign Up" }} />
      <Stack.Screen
        name="otp-verification"
        options={{
          title: "Verify Email",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{
          title: "Reset Password",
          headerBackTitle: "Back",
        }}
      />
    </Stack>
  );
}
