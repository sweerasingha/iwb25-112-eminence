import React from "react";
import { Stack } from "expo-router";

export default function EventsLayout() {
  return (
    <Stack>
      <Stack.Screen name="details" options={{ title: "Event Details" }} />
      <Stack.Screen name="create" options={{ title: "Create Event" }} />
      <Stack.Screen name="sponsor" options={{ title: "Sponsor Event" }} />
    </Stack>
  );
}
