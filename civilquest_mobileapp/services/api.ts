import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CONFIG, STORAGE_KEYS } from "../config";
import { ApiResponse } from "../types";
import { Alert } from "react-native";

// Extend the InternalAxiosRequestConfig type to include metadata
declare module "axios" {
  export interface InternalAxiosRequestConfig {
    metadata?: {
      startTime: number;
    };
  }
}

export interface ApiConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
}

class ApiService {
  private axiosInstance: AxiosInstance;
  private authToken: string | null = null;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: CONFIG.API_URL,
      timeout: CONFIG.API_TIMEOUT,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    this.setupInterceptors();
    this.loadStoredToken();
  }

  // Load stored authentication token on app start

  private async loadStoredToken(): Promise<void> {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
      if (token) {
        this.setAuthToken(token);
      }
    } catch (error) {
      console.error("Failed to load stored token:", error);
    }
  }

  // Set authentication token
  setAuthToken(token: string | null): void {
    this.authToken = token;

    if (token) {
      console.log("Setting auth token:", token);
      this.axiosInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${token}`;
    } else {
      delete this.axiosInstance.defaults.headers.common["Authorization"];
    }
  }

  // Setup Axios interceptors for request/response handling
  private setupInterceptors(): void {
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Log request in development
        if (CONFIG.APP_ENV === "development" && CONFIG.ENABLE_LOGS) {
          console.log("API Request:", {
            method: config.method?.toUpperCase(),
            url: config.url,
            baseURL: config.baseURL,
            headers: config.headers,
            data: config.data,
          });
        }

        // Add timestamp to requests
        config.metadata = { startTime: Date.now() };

        return config;
      },
      (error: AxiosError) => {
        console.error(" Request Error:", error);
        return Promise.reject(this.handleError<any>(error));
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log response in development
        if (CONFIG.APP_ENV === "development" && CONFIG.ENABLE_LOGS) {
          const duration =
            Date.now() - (response.config.metadata?.startTime || 0);
          console.log("API Response:", {
            method: response.config.method?.toUpperCase(),
            url: response.config.url,
            status: response.status,
            duration: `${duration}ms`,
            data: response.data,
          });
        }

        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        // Handle 401 errors  -  logout user
        if (error.response?.status === 401 && !originalRequest._retry) {
          this.handleAuthFailure();
          return Promise.reject(this.handleError<any>(error));
        }

        // Log error in development
        if (CONFIG.APP_ENV === "development" && CONFIG.ENABLE_LOGS) {
          console.error(" API Error:", {
            method: error.config?.method?.toUpperCase(),
            url: error.config?.url,
            status: error.response?.status,
            message: error.message,
            data: error.response?.data,
          });
        }
        console.error(
          (error.response?.data as any)?.errors[0] || "An error occurred"
        );
        //show errors
        Alert.alert((error.response?.data as any) || "An error occurred");

        return Promise.reject(this.handleError<any>(error));
      }
    );
  }

  // Handle authentication failure

  private async handleAuthFailure(): Promise<void> {
    // Clear stored token
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_TOKEN);

    // Clear auth token from service
    this.setAuthToken(null);
  }

  // Transform Axios error to ApiResponse format
  private handleError<T = any>(error: AxiosError): ApiResponse<T> {
    if (error.response) {
      // Server responded with error status
      const errorMessage =
        (error.response.data as any)?.message ||
        `HTTP ${error.response.status}: ${error.response.statusText}`;
      return {
        success: false,
        error: errorMessage,
        statusCode: error.response.status,
      } as ApiResponse<T>;
    } else if (error.request) {
      return {
        success: false,
        error: "Network error: Please check your internet connection",
      } as ApiResponse<T>;
    } else {
      return {
        success: false,
        error: error.message || "An unexpected error occurred",
      } as ApiResponse<T>;
    }
  }

  // Generic request method using Axios

  private async request<T = any>(
    config: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.request<T>(config);

      return {
        success: true,
        data: response.data,
        statusCode: response.status,
        message: "Request successful",
      };
    } catch (error) {
      return this.handleError<T>(error as AxiosError);
    }
  }

  // HTTP GET method
  async get<T = any>(
    endpoint: string,
    params?: Record<string, any>,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: "GET",
      url: endpoint,
      params,
      ...config,
    });
  }

  // HTTP POST method
  async post<T = any>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: "POST",
      url: endpoint,
      data,
      ...config,
    });
  }

  // HTTP PUT method
  async put<T = any>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: "PUT",
      url: endpoint,
      data,
      ...config,
    });
  }

  // HTTP PATCH method
  async patch<T = any>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: "PATCH",
      url: endpoint,
      data,
      ...config,
    });
  }

  // HTTP DELETE method
  async delete<T = any>(
    endpoint: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: "DELETE",
      url: endpoint,
      ...config,
    });
  }

  // Upload file with form data
  async upload<T = any>(
    endpoint: string,
    formData: FormData,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: "POST",
      url: endpoint,
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      ...config,
    });
  }

  // Get current user email from JWT token
  getCurrentUserEmail(): string | null {
    try {
      if (!this.authToken) {
        return null;
      }

      const payload = JSON.parse(atob(this.authToken.split(".")[1]));
      return payload.sub || null; // 'sub' contains the email
    } catch (error) {
      console.error("Failed to decode auth token:", error);
      return null;
    }
  }
}

// Create and export singleton instance
export const api = new ApiService();

// Export the class for testing purposes
export { ApiService };
