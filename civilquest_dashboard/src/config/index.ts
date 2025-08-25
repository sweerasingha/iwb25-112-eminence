export const CONFIG = {
  API_URL: process.env.EXPO_PUBLIC_API_URL,
  APP_ENV: process.env.EXPO_PUBLIC_APP_ENV || "development",
} as const;

export const APP_INFO = {
  NAME: "Civil-Quest-Dashborad",
  VERSION: "1.0.0",
  BUILD: "1",
} as const;

export const STORAGE_KEYS = {
  USER_TOKEN: "user_token",
  USER_DATA: "user_data",
  THEME: "theme",
} as const;
