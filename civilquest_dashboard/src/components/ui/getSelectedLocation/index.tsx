"use client";

import React, { useState, useEffect } from "react";
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
            "User-Agent": "next-location-app/1.0 (email@example.com)",
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
    setQuery(location.display_name);
    setResults([]);
  };

  return (
    <div className="w-full mt-6 relative">
      <InputField
        name="location"
        label={selectedLocation ? "Change Location" : "Select Location"}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        error={validationError || error}
      />

      {/* Dropdown results */}
      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {results.map(
            (item) =>
              item.display_name !== query && (
                <button
                  key={item.place_id}
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-gray-100"
                  onClick={() => handleSelect(item)}
                >
                  {item.display_name}
                </button>
              )
          )}
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
