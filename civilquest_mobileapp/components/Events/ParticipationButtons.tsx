import React, { useMemo, useState } from "react";
import { Alert, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "../UI/Button";
import { SPACING } from "../../theme";
import { ID } from "../../types";
import { eventService } from "../../services/event";
import { useAuth } from "../../hooks/useAuth";

type ApplyMethod = "WILL_JOIN" | "INTERESTED";

interface Props {
  eventId: ID;
  initialMethod?: ApplyMethod | null;
}

export function ParticipationButtons({ eventId, initialMethod = null }: Props) {
  const router = useRouter();
  const { isAuthenticated, userEmail } = useAuth();

  const [current, setCurrent] = useState<ApplyMethod | null>(initialMethod);
  const [loading, setLoading] = useState<ApplyMethod | null>(null);

  const disabled = useMemo(() => Boolean(loading), [loading]);

  const ensureAuth = () => {
    if (!isAuthenticated) {
      Alert.alert("Login required", "Please login to apply for this event.", [
        { text: "Cancel", style: "cancel" },
        { text: "Login", onPress: () => router.push("/auth/login") },
      ]);
      return false;
    }
    return true;
  };

  const deriveNameFromEmail = (email?: string | null) => {
    if (!email) return "User";
    return email.split("@")[0].replace(/\W+/g, " ").trim() || email;
  };

  const apply = async (method: ApplyMethod) => {
    if (!ensureAuth()) return;
    try {
      setLoading(method);
      const payload = {
        userId: userEmail as string,
        name: deriveNameFromEmail(userEmail),
        method,
      };
      const res = await eventService.applyToEvent(eventId, payload);
      if (res.success) {
        setCurrent(method);
      } else {
        Alert.alert("Failed", res.error || "Could not update participation");
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Unexpected error");
    } finally {
      setLoading(null);
    }
  };

  return (
    <View style={styles.container}>
      <Button
        title={current === "INTERESTED" ? "Interested ✓" : "Interested"}
        variant={current === "INTERESTED" ? "primary" : "outline"}
        size="small"
        loading={loading === "INTERESTED"}
        disabled={disabled}
        onPress={() => apply("INTERESTED")}
        style={styles.button}
      />
      <Button
        title={current === "WILL_JOIN" ? "Will Join ✓" : "Will Join"}
        variant={current === "WILL_JOIN" ? "secondary" : "outline"}
        size="small"
        loading={loading === "WILL_JOIN"}
        disabled={disabled}
        onPress={() => apply("WILL_JOIN")}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginVertical: SPACING.md,
    gap: SPACING.md,
  },
  button: {
    flex: 1,
  },
});

export default ParticipationButtons;
