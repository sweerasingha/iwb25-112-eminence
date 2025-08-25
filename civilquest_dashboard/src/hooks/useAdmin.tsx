import React, { useState } from "react";
import * as adminService from "@/services/admin";
import { ApiResponse, ProvincialAdmin } from "@/types";
import { toast } from "react-toastify";

const useAdmin = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdmins = async (): Promise<ApiResponse> => {
    setLoading(true);
    try {
      const response = await adminService.getAllAdmin();
      setAdmins((response as any) ?? []);
      return {
        status: true,
      };
    } catch (error) {
      console.error("Error fetching admins:", error);
      return {
        status: false,
      };
    } finally {
      setLoading(false);
    }
  };

  const createAdmin = async (
    adminData: ProvincialAdmin
  ): Promise<ApiResponse> => {
    console.log("Admin created:", adminData);
    try {
      const response = await adminService.createAdmin(adminData);
      toast.success("Admin created successfully");
      return {
        status: true,
      };
    } catch (error) {
      console.error("Error creating admin:", error);
      return {
        status: false,
      };
    }
  };

  const deleteAdmin = async (adminId: string): Promise<ApiResponse> => {
    try {
      await adminService.deleteAdmin(adminId);
      toast.success("Admin deleted successfully");
      return {
        status: true,
      };
    } catch (error) {
      console.error("Error deleting admin:", error);
      return {
        status: false,
      };
    }
  };

  const updateAdmin = async (
    adminData: ProvincialAdmin
  ): Promise<ApiResponse> => {
    try {
      await adminService.updateAdmin(adminData);
      toast.success("Admin updated successfully");
      return {
        status: true,
      };
    } catch (error) {
      console.error("Error updating admin:", error);
      return {
        status: false,
      };
    }
  };

  return {
    admins,
    loading,
    fetchAdmins,
    createAdmin,
    deleteAdmin,
    updateAdmin,
  };
};

export default useAdmin;
