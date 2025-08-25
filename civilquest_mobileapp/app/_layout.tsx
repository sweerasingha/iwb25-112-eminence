import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import Toast from "react-native-toast-message";

import { store } from "../store";
import { useAuth } from "../hooks";
import { COLORS } from "../theme";

// Toast configuration
const toastConfig = {
};

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { loadStoredAuth } = useAuth();

  useEffect(() => {
    loadStoredAuth();
  }, []);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar style="auto" backgroundColor={COLORS.background} />
        <AuthInitializer>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="auth"
              options={{
                headerShown: false,
                presentation: "modal",
              }}
            />
            <Stack.Screen name="events" options={{ headerShown: false }} />
            <Stack.Screen name="profile" options={{ headerShown: false }} />
          </Stack>
        </AuthInitializer>
        <Toast config={toastConfig} />
      </SafeAreaProvider>
    </Provider>
  );
}
