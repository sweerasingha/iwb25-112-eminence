"use client";
import React, { useState, useEffect } from "react";
import useAudit from "@/hooks/useAudit";
import LoadingButton from "@/components/ui/button";
import Loading from "@/components/ui/loading";

export default function AuditPage() {
  const { auditLogs, auditCount, loading, getAuditLogs, getAuditCount } =
    useAudit();
  const [pagination, setPagination] = useState({
    limit: 100,
    skip: 0,
  });

  useEffect(() => {
    handleGetAuditCount();
  }, []);

  useEffect(() => {
    handleGetAuditLogs();
  }, [pagination.limit, pagination.skip]);

  const handleGetAuditLogs = async () => {
    await getAuditLogs(pagination);
  };

  const handleGetAuditCount = async () => {
    await getAuditCount();
  };

  const handleNextPage = async () => {
    setPagination((prev) => ({
      ...prev,
      skip: prev.skip + prev.limit,
    }));
  };

  const handlePrevPage = async () => {
    setPagination((prev) => ({
      ...prev,
      skip: Math.max(0, prev.skip - prev.limit),
    }));
  };

  if (loading) {
    return <Loading />;
  }

  const currentPage = Math.floor(pagination.skip / pagination.limit) + 1;
  const totalPages = Math.ceil((auditCount || 0) / pagination.limit);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Audit & Monitoring</h1>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Audit Log Controls</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Limit per page
            </label>
            <input
              type="number"
              value={pagination.limit}
              onChange={(e) =>
                setPagination((prev) => ({
                  ...prev,
                  limit: parseInt(e.target.value) || 100,
                }))
              }
              className="border border-gray-300 rounded-md px-3 py-2 w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Skip records
            </label>
            <input
              type="number"
              value={pagination.skip}
              onChange={(e) =>
                setPagination((prev) => ({
                  ...prev,
                  skip: parseInt(e.target.value) || 0,
                }))
              }
              className="border border-gray-300 rounded-md px-3 py-2 w-full"
            />
          </div>
          <div className="flex items-end">
            <LoadingButton onClick={handleGetAuditLogs}>
              Get Audit Logs
            </LoadingButton>
          </div>
        </div>

        {auditCount !== null && (
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-600">
              Total records: {auditCount} | Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <LoadingButton
                onClick={handlePrevPage}
                className={
                  pagination.skip === 0 ? "opacity-50 cursor-not-allowed" : ""
                }
              >
                Previous
              </LoadingButton>
              <LoadingButton
                onClick={handleNextPage}
                className={
                  pagination.skip + pagination.limit >= (auditCount || 0)
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }
              >
                Next
              </LoadingButton>
            </div>
          </div>
        )}

        <LoadingButton onClick={handleGetAuditCount}>
          Refresh Count
        </LoadingButton>
      </div>

      {auditCount !== null && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Audit Statistics</h2>
          <div className="text-3xl font-bold text-blue-600">
            {auditCount} Total Audit Records
          </div>
        </div>
      )}

      {Array.isArray(auditLogs) && auditLogs.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Audit Logs</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
        <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Timestamp
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Action
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
          Actor
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
          Target
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
          Details & Changes
                  </th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">
                      <div className="text-sm">
                        {log.timestamp
                          ? new Date(log.timestamp).toLocaleString()
                          : "Unknown"}
                      </div>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          log.action?.includes("CREATE")
                            ? "bg-green-100 text-green-800"
                            : log.action?.includes("UPDATE")
                              ? "bg-blue-100 text-blue-800"
                              : log.action?.includes("DELETE")
                                ? "bg-red-100 text-red-800"
                                : log.action?.includes("LOGIN")
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {log.action || "Unknown"}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mr-2">
                          <span className="text-gray-600 text-xs font-semibold">
                            {log.userId?.charAt(0)?.toUpperCase() || "U"}
                          </span>
                        </div>
                        <div className="text-sm">
                          <div className="font-medium">
                            {log.userId || "System"}
                          </div>
                          <div className="text-gray-500">{log.userRole || ""}</div>
                        </div>
                      </div>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className="text-sm font-medium">
                        {log.resourceType || "N/A"}
                      </span>
                      {log.resourceId && (
                        <div className="text-xs text-gray-500">ID: {log.resourceId}</div>
                      )}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <details className="cursor-pointer">
                        <summary className="text-blue-600 hover:text-blue-800 text-sm">
                          View Details
                        </summary>
                        <div className="mt-2 p-3 bg-gray-50 rounded text-xs">
                          <div className="space-y-1">
                            {log.ipAddress && (
                              <div>
                                <strong>IP:</strong> {log.ipAddress}
                              </div>
                            )}
                            {log.userAgent && (
                              <div>
                                <strong>User Agent:</strong> {log.userAgent}
                              </div>
                            )}
                            {log.description && (
                              <div>
                                <strong>Description:</strong> {log.description}
                              </div>
                            )}
                            {(log.oldData || log.newData) && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {log.oldData && (
                                  <div>
                                    <strong>Old Data:</strong>
                                    <pre className="mt-1 text-xs whitespace-pre-wrap break-words">
                                      {JSON.stringify(log.oldData, null, 2)}
                                    </pre>
                                  </div>
                                )}
                                {log.newData && (
                                  <div>
                                    <strong>New Data:</strong>
                                    <pre className="mt-1 text-xs whitespace-pre-wrap break-words">
                                      {JSON.stringify(log.newData, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(!auditLogs || auditLogs.length === 0) && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold mb-2">No Audit Logs</h2>
            <p className="text-gray-500">
              Click "Get Audit Logs" to fetch audit records from the server.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
