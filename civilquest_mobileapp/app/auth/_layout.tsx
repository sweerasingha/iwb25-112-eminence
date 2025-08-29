import React from "react";
import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="login"
        options={{ title: "Login", headerShown: false }}
      />
      <Stack.Screen
        name="signup"
        options={{ title: "Sign Up", headerShown: false }}
      />
      <Stack.Screen
        name="otp-verification"
        options={{
          title: "Verify Email",
          headerBackTitle: "Back",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{
          title: "Forgot Password",
          headerBackTitle: "Back",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="reset-password"
        options={{
          title: "Reset Password",
          headerBackTitle: "Back",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
