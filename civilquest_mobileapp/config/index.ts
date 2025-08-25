export const CONFIG = {
  API_URL: process.env.EXPO_PUBLIC_API_URL || "http://192.168.8.192:4444/api",
  APP_ENV: process.env.EXPO_PUBLIC_APP_ENV || "development",
  API_TIMEOUT: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || "10000"),
  ENABLE_LOGS: process.env.EXPO_PUBLIC_ENABLE_LOGS === "true" || true,
} as const;

export const APP_INFO = {
  NAME: "EventHub",
  VERSION: "1.0.0",
  BUILD: "1",
} as const;

export const STORAGE_KEYS = {
 
  USER_TOKEN: "user_token",
  USER_DATA: "user_data",
  THEME: "theme",
  ONBOARDING_COMPLETED: "onboarding_completed",
} as const;
