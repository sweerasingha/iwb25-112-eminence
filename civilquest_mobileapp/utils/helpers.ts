import { DecodedToken, TokenUser } from "../types";

export const decodeJWTToken = (token: string): DecodedToken | null => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.error("Invalid JWT token format");
      return null;
    }

    const payload = parts[1];

    const paddedPayload = payload + "=".repeat((4 - (payload.length % 4)) % 4);

    const decodedPayload = atob(paddedPayload);

    const tokenData: DecodedToken = JSON.parse(decodedPayload);

    return tokenData;
  } catch (error) {
    console.error("Error decoding JWT token:", error);
    return null;
  }
};

export const getUserFromToken = (token: string): TokenUser | null => {
  const decodedToken = decodeJWTToken(token);

  if (!decodedToken) {
    return null;
  }

  return {
    email: decodedToken.sub,
    role: decodedToken.role,
  };
};

export const isTokenExpired = (token: string): boolean => {
  const decodedToken = decodeJWTToken(token);

  if (!decodedToken) {
    return true;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  return decodedToken.exp < currentTime;
};
