import { useState } from "react";
import * as userService from "@/services/user";
import { ApiResponse, UserSearchParams } from "@/types";
import { toast } from "react-toastify";

const useUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchUsers = async (
    params: UserSearchParams
  ): Promise<ApiResponse> => {
    setLoading(true);
    try {
      const response = await userService.searchUsers(params);
      setUsers((response as any) ?? []);
      return {
        status: true,
        data: response,
      };
    } catch (error) {
      console.error("Error searching users:", error);
      return {
        status: false,
      };
    } finally {
      setLoading(false);
    }
  };

  const getUsersByRole = async (role: string): Promise<ApiResponse> => {
    setLoading(true);
    try {
      const response = await userService.getUsersByRole(role);
      setUsers((response as any) ?? []);
      return {
        status: true,
        data: response,
      };
    } catch (error) {
      console.error("Error fetching users by role:", error);
      return {
        status: false,
      };
    } finally {
      setLoading(false);
    }
  };

  return { users, loading, searchUsers, getUsersByRole };
};

export default useUser;
