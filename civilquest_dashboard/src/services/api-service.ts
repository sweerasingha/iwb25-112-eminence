import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { STORAGE_KEYS } from "@/config";
const computedBaseUrl = (() => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (envUrl && envUrl !== "undefined") {
    return envUrl.replace(/\/$/, "");
  }
  if (typeof window !== "undefined") {
    return "/api";
  }
  return "http://localhost:4444/api";
})();

const apiService = axios.create({
  baseURL: computedBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

const getErrorMessage = (err: any): string => {
  try {
    const statusText = err?.response?.statusText as string | undefined;
    const data = err?.response?.data;

    if (data) {
      if (typeof data === "string") return data;
      const fromErrorKey = ((): string | undefined => {
        const v = (data as any).error;
        if (!v) return undefined;
        if (typeof v === "string") return v;
        if (Array.isArray(v)) return v.filter(Boolean).join("\n");
        if (typeof v === "object") return Object.values(v).join("\n");
        return String(v);
      })();
      if (fromErrorKey) return fromErrorKey;
      const alt = (data.message ?? data.msg ?? data.detail) as unknown;
      if (typeof alt === "string" && alt) return alt;

      const errors = (data.errors ?? data.errorMessages ?? []) as unknown;
      if (Array.isArray(errors) && errors.length > 0) {
        const parts = errors.map((e) => {
          if (typeof e === "string") return e;
          if (e && typeof e === "object") return e.message ?? JSON.stringify(e);
          return String(e);
        });
        return parts.join("\n");
      }
    }

    if (err?.request) return "No response from server";
    if (typeof err?.message === "string" && err.message) return err.message;
    return statusText || "Request failed";
  } catch {
    return "Request failed";
  }
};


apiService.interceptors.request.use(async (config) => {
  try {
    const token = Cookies.get(STORAGE_KEYS.USER_TOKEN);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  } catch (error) {
    console.error("Error while setting Authorization header:", error);
    throw new Error("Failed to set Authorization header");
  }
});

apiService.interceptors.response.use(
  (response) => response.data,
  (error) => {
  const errorMessage = getErrorMessage(error);
    const isSilent = error?.config?.headers?.["x-silent-error"] === "1";

    if (error.response && error.response.status === 403) {
      if (!isSilent) toast.error("Your not Authorized for this action");
      return Promise.reject(error); 
    }

    if (error.response && error.response.status === 401) {
      console.log("Your session has expired. Please login again.");
      localStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
      window.location.href = "/";
    }
    // Suppress noisy network/CORS errors or when explicitly silenced
    const isNetworkError = !error.response && !!error.request;
    if (!isSilent && !isNetworkError) {
      toast.error(errorMessage || "Request failed");
    }

    return Promise.reject(error);
  }
);

export default apiService;
