import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import { COLORS, FONTS, SPACING } from "theme";
import { EventLocation } from "types";

interface LocationResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}
interface GetSelectedLocationProps {
  validationError?: string;
  setLocation: (location: EventLocation) => void;
}

export default function GetSelectedLocation({
  validationError,
  setLocation,
}: GetSelectedLocationProps) {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<LocationResult[]>([]);
  const [selectedLocation, setSelectedLocation] =
    useState<LocationResult | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
      return;
    }

    const delayDebounce = setTimeout(() => {
      fetchSuggestions(query);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const fetchSuggestions = async (text: string) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          text
        )}&format=json&addressdetails=1&limit=5`,
        {
          headers: {
            "User-Agent": "expo-location-app/1.0 (email@example.com)",
          },
        }
      );
      const data: LocationResult[] = await response.json();
      setResults(data);
      setError(data.length === 0 ? "No results found" : "");
    } catch (err) {
      console.error(err);
      setError("Error fetching location");
      setResults([]);
    }
  };

  const handleSelect = (location: LocationResult) => {
    setSelectedLocation(location);
    setLocation({
      displayName: location.display_name,
      latitude: Number(location.lat),
      longitude: Number(location.lon),
    });
    setResults([]);
    setQuery(location.display_name);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.labelText}>
        {selectedLocation ? "Change Location" : "Select Location"}
      </Text>
      <TextInput
        style={[
          styles.input,
          { borderColor: validationError ? COLORS.error : "#ccc" },
        ]}
        placeholder="Search location..."
        value={query}
        onChangeText={setQuery}
      />
      {validationError && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={16} color={COLORS.error} />
          <Text style={styles.errorText}>{validationError}</Text>
        </View>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* Dropdown overlay */}
      {results.length > 0 && (
        <View style={styles.dropdown}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
          >
            {results.map((item) => (
              <TouchableOpacity
                key={item.place_id.toString()}
                style={styles.resultItem}
                onPress={() => handleSelect(item)}
              >
                <Text>{item.display_name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {selectedLocation && (
        <View style={styles.selectedContainer}>
          <Text style={styles.selectedText}>Selected Location:</Text>
          <Text>{selectedLocation.display_name}</Text>
          <Text>Latitude: {selectedLocation.lat}</Text>
          <Text>Longitude: {selectedLocation.lon}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 1, marginTop: 50 },
  input: {
    borderWidth: 2,
    paddingLeft: 12,
    borderRadius: 8,
    height: 55,
  },
  labelText: {
    fontWeight: FONTS.weights.semibold,
    marginBottom: 5,
    fontSize: 15,
  },

  dropdown: {
    position: "absolute",
    top: 60,
    left: 5,
    right: 5,
    maxHeight: 200,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 5,
  },
  resultItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  selectedContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f1f1f1",
    borderRadius: 8,
  },
  selectedText: { fontWeight: "bold", marginBottom: 5 },
  error: { color: "red", marginVertical: 5 },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  errorText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.error,
    fontWeight: FONTS.weights.medium,
    marginLeft: SPACING.sm,
    flex: 1,
  },
});
