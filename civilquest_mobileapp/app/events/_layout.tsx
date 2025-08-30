import React from "react";
import { Stack } from "expo-router";

export default function EventsLayout() {
  return (
    <Stack>
      <Stack.Screen name="details" options={{ title: "Event Details" ,headerShown: false}} />
      <Stack.Screen name="create" options={{ title: "Create Event" ,headerShown: false}} />
      <Stack.Screen name="sponsor" options={{ title: "Sponsor Event" ,headerShown: false}} />
    </Stack>
  );
}
