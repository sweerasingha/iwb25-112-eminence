import { useUserContext } from "@/context/userContext";
import { LoginDTO } from "@/services/auth-service";
import * as authService from "@/services/auth-service";
import { ApiResponse } from "@/types";
import React, { useState } from "react";
import { toast } from "react-toastify";

const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const userContext = useUserContext();

  const login = async (data: LoginDTO): Promise<ApiResponse> => {
    setLoading(true);
    try {
      const response: any = await authService.login(data);
      userContext.updateAccessToken(response.token);
      toast.success(response.message || "Login successful");
      return {
        status: true,
      };
    } catch (error: any) {
      return {
        status: false,
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    userContext.logout();
    toast.success("Logged out successfully");
  };

  return { login, loading, logout };
};

export default useAuth;
