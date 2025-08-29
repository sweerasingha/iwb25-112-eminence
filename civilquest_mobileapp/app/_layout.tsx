import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import Toast from "react-native-toast-message";

import { store } from "../store";
import { useAuth } from "../hooks";
import { COLORS } from "../theme";
import SplashScreen from "components/Splash/SplashScreen";

// Toast configuration
const toastConfig = {};

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { loadStoredAuth } = useAuth();

  useEffect(() => {
    loadStoredAuth();
  }, []);

  return <>{children}</>;
}

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Show splash for 3 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1 }} edges={["top", "right", "left"]}>
          <View style={{ flex: 1 }}>
            <StatusBar style="auto" backgroundColor={COLORS.background} />
            <AuthInitializer>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="auth"
                  options={{ headerShown: false, presentation: "modal" }}
                />
                <Stack.Screen name="events" options={{ headerShown: false }} />
                <Stack.Screen name="profile" options={{ headerShown: false }} />
              </Stack>
            </AuthInitializer>
            <Toast config={toastConfig} />
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    </Provider>
  );
}
