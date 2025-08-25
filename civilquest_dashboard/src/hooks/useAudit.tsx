import { useState } from "react";
import * as auditService from "@/services/audit";
import { ApiResponse, AuditPagination } from "@/types";
import { toast } from "react-toastify";

const useAudit = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditCount, setAuditCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const getAuditLogs = async (
    params: AuditPagination
  ): Promise<ApiResponse> => {
    setLoading(true);
    try {
      const response = await auditService.getAuditLogs(params);
      setAuditLogs((response as any) ?? []);
      return {
        status: true,
        data: response,
      };
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      return {
        status: false,
      };
    } finally {
      setLoading(false);
    }
  };

  const getAuditCount = async (): Promise<ApiResponse> => {
    setLoading(true);
    try {
      const response = await auditService.getAuditCount();
      // Extract the count value from the response
      const count =
        typeof response === "object"
          ? ((response as any)?.count ?? (response as any)?.data?.count ?? 0)
          : (response ?? 0);
      setAuditCount(count);
      return {
        status: true,
        data: response,
      };
    } catch (error) {
      console.error("Error fetching audit count:", error);
      return {
        status: false,
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    auditLogs,
    auditCount,
    loading,
    getAuditLogs,
    getAuditCount,
  };
};

export default useAudit;
