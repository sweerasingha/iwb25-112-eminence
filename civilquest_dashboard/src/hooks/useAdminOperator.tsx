import React, { useState } from "react";
import * as adminOperatorService from "@/services/admin-operator";
import { ApiResponse, AdminOperator } from "@/types";
import { toast } from "react-toastify";

const useAdminOperator = () => {
  const [adminOperators, setAdminOperators] = useState<AdminOperator[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminOperators = async (): Promise<ApiResponse> => {
    setLoading(true);
    try {
      const response = await adminOperatorService.getAllAdminOperators();
      const list: AdminOperator[] = Array.isArray(response)
        ? [...response]
        : [];
      list.sort((a: any, b: any) => {
        const aTime = new Date(a?.createdAt || a?.updatedAt || 0).getTime();
        const bTime = new Date(b?.createdAt || b?.updatedAt || 0).getTime();
        return bTime - aTime;
      });
      setAdminOperators(list);
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
    try {
      const response =
        await adminOperatorService.createAdminOperator(adminOperatorData);
      toast.success("Admin operator created successfully");
      await fetchAdminOperators();
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
      await fetchAdminOperators();
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
      await fetchAdminOperators();
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
