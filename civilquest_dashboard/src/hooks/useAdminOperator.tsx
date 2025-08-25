import React, { useState } from "react";
import * as adminOperatorService from "@/services/admin-operator";
import { ApiResponse, AdminOperator } from "@/types";
import { toast } from "react-toastify";

const useAdminOperator = () => {
  const [adminOperators, setAdminOperators] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminOperators = async (): Promise<ApiResponse> => {
    setLoading(true);
    try {
      const response = await adminOperatorService.getAllAdminOperators();
      setAdminOperators((response as any) ?? []);
      return {
        status: true,
      };
    } catch (error) {
      console.error("Error fetching admin operators:", error);
      return {
        status: false,
      };
    } finally {
      setLoading(false);
    }
  };

  const createAdminOperator = async (
    adminOperatorData: AdminOperator
  ): Promise<ApiResponse> => {
    console.log("Admin operator created:", adminOperatorData);
    try {
      const response =
        await adminOperatorService.createAdminOperator(adminOperatorData);
      toast.success("Admin operator created successfully");
      return {
        status: true,
      };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.errors[0] ||
        error.message ||
        error.response?.data ||
        "Error creating admin operator";
      return {
        status: false,
      };
    }
  };

  const deleteAdminOperator = async (
    adminOperatorId: string
  ): Promise<ApiResponse> => {
    try {
      await adminOperatorService.deleteAdminOperator(adminOperatorId);
      toast.success("Admin operator deleted successfully");
      return {
        status: true,
      };
    } catch (error) {
      console.error("Error deleting admin operator:", error);
      return {
        status: false,
      };
    }
  };

  //update admin operator
  const updateAdminOperator = async (
    adminOperatorData: AdminOperator
  ): Promise<ApiResponse> => {
    try {
      await adminOperatorService.updateAdminOperator(adminOperatorData);
      toast.success("Admin operator updated successfully");
      return {
        status: true,
      };
    } catch (error) {
      console.error("Error updating admin operator:", error);
      return {
        status: false,
      };
    }
  };

  return {
    adminOperators,
    loading,
    fetchAdminOperators,
    createAdminOperator,
    deleteAdminOperator,
    updateAdminOperator,
  };
};

export default useAdminOperator;
