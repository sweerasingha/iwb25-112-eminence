import { useState } from "react";
import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Location from "expo-location";

export const useLocation = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const getCurrentLocation = async () => {
    setIsLoading(true);

    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setErrorMsg("Permission to access location was denied");
      setIsLoading(false);
      return {
        location: null,
        errorMsg: "Permission to access location was denied",
      };
    }

    let currentLocation = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    setLocation(currentLocation);
    setIsLoading(false);
    return { location: currentLocation, errorMsg: null };
  };

  return { location, errorMsg, isLoading, getCurrentLocation };
};
