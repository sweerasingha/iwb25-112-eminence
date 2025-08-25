import React, { useState } from "react";
import { View, Text, Button, TextInput, StyleSheet, Alert } from "react-native";

export default function ApplyPremiumScreen() {
  const [details, setDetails] = useState({ id_photo_url: "", reason: "" });

  const handleSubmit = () => {
    Alert.alert("Success", "Premium application submitted successfully!");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Apply for Premium</Text>
      <TextInput
        placeholder="ID Photo URL"
        value={details.id_photo_url}
        onChangeText={(v) => setDetails({ ...details, id_photo_url: v })}
        style={styles.input}
      />
      <TextInput
        placeholder="Reason for Premium Access"
        value={details.reason}
        onChangeText={(v) => setDetails({ ...details, reason: v })}
        style={styles.input}
        multiline
        numberOfLines={4}
      />
      <Button title="Submit Application" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 10,
    padding: 8,
    borderRadius: 4,
  },
});
