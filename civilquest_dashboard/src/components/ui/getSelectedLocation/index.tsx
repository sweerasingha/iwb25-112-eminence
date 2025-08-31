"use client";

import React, { useState, useEffect, useCallback } from "react";
import { InputField } from "@/components/ui/input";
import { EventLocation } from "@/types";

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
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchSuggestions = useCallback(async (text: string) => {
    if (!text.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          text
        )}&format=json&addressdetails=1&limit=5`,
        {
          headers: {
            "User-Agent": "civlquest/1.0 (civilquest@email.com)",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: LocationResult[] = await response.json();
      setResults(data);
      setError(data.length === 0 ? "No results found" : "");
    } catch (err) {
      console.error("Error fetching location:", err);
      setError("Error fetching location suggestions");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchSuggestions(query);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [query, fetchSuggestions]);

  const handleSelect = (location: LocationResult) => {
    setSelectedLocation(location);
    setLocation({
      displayName: location.display_name,
      latitude: Number(location.lat),
      longitude: Number(location.lon),
    });
    setQuery(location.display_name);
    setResults([]);
    setError("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (selectedLocation && value !== selectedLocation.display_name) {
      setSelectedLocation(null);
    }
  };

  return (
    <div className="w-full mt-6 relative">
      <InputField
        name="location"
        label={selectedLocation ? "Change Location" : "Select Location"}
        value={query}
        onChange={handleInputChange}
        error={validationError || error}
      />

      {isLoading && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-3">
          <p className="text-gray-500">Loading...</p>
        </div>
      )}

      {/* Dropdown results */}
      {results.length > 0 && !selectedLocation && !isLoading && (
        <div className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {results.map((item) => (
            <button
              key={item.place_id}
              type="button"
              className="w-full text-left px-3 py-2 hover:bg-gray-100"
              onClick={() => handleSelect(item)}
            >
              {item.display_name}
            </button>
          ))}
        </div>
      )}

      {/* Selected location preview */}
      {selectedLocation && (
        <div className="mt-4 p-3 bg-gray-100 rounded-md text-sm">
          <p className="font-medium text-gray-700">Selected Location:</p>
          <p>{selectedLocation.display_name}</p>
          <p>Latitude: {selectedLocation.lat}</p>
          <p>Longitude: {selectedLocation.lon}</p>
        </div>
      )}
    </div>
  );
}
