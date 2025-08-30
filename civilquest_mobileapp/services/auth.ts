import { api } from "./api";
import {
  LoginCredentials,
  SignupCredentials,
  AuthTokens,
  ApiResponse,
  OTPVerificationData,
  PasswordResetRequest,
  PasswordResetVerification,
} from "../types";

export interface AuthResponse {
  tokens: AuthTokens;
}

class AuthService {
  // Login user with credentials
  async login(
    credentials: LoginCredentials
  ): Promise<ApiResponse<AuthResponse>> {
    try {
      console.log("Attempting login with:", credentials.email);
      console.log(
        "API URL:",
        process.env.EXPO_PUBLIC_API_URL || "http://192.168.8.192:4444/api"
      );

      const result = await api.post("/auth/login", credentials);
      console.log("Login response:", result);

      if (!result.success) {
        return result;
      }

      const payload: any = result.data || {};
      const token: string | undefined =
        payload.token ||
        payload.accessToken ||
        payload.data?.token ||
        payload.data?.accessToken;
      const message: string | undefined =
        result.message || payload.message || payload.data?.message;

      if (!token) {
        return {
          success: false,
          error: "No authentication token received from server",
        };
      }

      return {
        success: true,
        data: { tokens: { accessToken: token } },
        message: message || "Logged in successfully!",
      };
    } catch (error: any) {
      console.error("Login error:", error);
      return {
        success: false,
        error:
          error.message ||
          error.error ||
          "Network error - please check your connection",
      };
    }
  }

  //registration

  async signup(
    credentials: SignupCredentials
  ): Promise<ApiResponse<AuthResponse>> {
    try {
      const result = await api.post("/auth/register/init", credentials);

      if (!result.success) {
        return result;
      }

      const payload: any = result.data || {};
      const token: string | undefined =
        payload.token ||
        payload.accessToken ||
        payload.data?.token ||
        payload.data?.accessToken;
      const message: string | undefined =
        result.message || payload.message || payload.data?.message;

      if (!token) {
        return {
          success: true,
          data: { tokens: { accessToken: "" as unknown as string } },
          message: message || "Signup initiated successfully",
        };
      }

      return {
        success: true,
        data: { tokens: { accessToken: token } },
        message: message || "Signup successful",
      };
    } catch (error: any) {
      console.error("Signup error:", error);
      return { success: false, error: error.data || "Signup failed" };
    }
  }

  //Complete user registration with OTP verification

  async completeRegistration(
    otpData: OTPVerificationData
  ): Promise<ApiResponse<AuthResponse>> {
    try {
      const result = await api.post("/auth/register/complete", otpData);

      const payload: any = result.data || {};
      const token: string | undefined =
        payload.token ||
        payload.accessToken ||
        payload.data?.token ||
        payload.data?.accessToken;
      const message: string | undefined =
        payload.message || payload.data?.message;

      if (!token) {
        return {
          success: true,
          data: { tokens: { accessToken: "" as unknown as string } },
          message: message || "Registration completed successfully!",
        };
      }

      return {
        success: true,
        data: { tokens: { accessToken: token } },
        message: message || "Registration completed successfully!",
      };
    } catch (error: any) {
      console.error("Complete registration error:", error);
      return { success: false, error: error.data || "OTP verification failed" };
    }
  }

  // Request password reset

  async requestPasswordReset(
    data: PasswordResetRequest
  ): Promise<ApiResponse<null>> {
    try {
      const result = await api.post("/auth/password/reset/request", data);
      return {
        success: true,
        message:
          result.data?.message || "Password reset OTP sent to your email",
      };
    } catch (error: any) {
      console.error("Password reset request error:", error);
      return {
        success: false,
        error: error.data || "Password reset request failed",
      };
    }
  }

  // Verify password reset with OTP and set new password
  async verifyPasswordReset(
    data: PasswordResetVerification
  ): Promise<ApiResponse<null>> {
    try {
      const result = await api.post("/auth/password/reset/verify", data);
      return {
        success: true,
        message: result.data?.message || "Password reset successful",
      };
    } catch (error: any) {
      console.error("Password reset verification error:", error);
      return {
        success: false,
        error: error.data || "Password reset verification failed",
      };
    }
  }

  //  Logout user and clear tokens

  async logout(): Promise<ApiResponse<null>> {
    try {
      // Clear the auth token from API service
      api.setAuthToken(null);
      return { success: true, message: "Logout successful" };
    } catch (error: any) {
      api.setAuthToken(null);
      return { success: false, error: error.message || "Logout failed" };
    }
  }
}

export const authService = new AuthService();
