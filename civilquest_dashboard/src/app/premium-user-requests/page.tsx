"use client";
import Loading from "@/components/ui/loading";
import StaticButton from "@/components/ui/staticButton";
import usePremiumUserRequest from "@/hooks/usePremiumUserRequest";
import { useDialog } from "@/hooks/useDialog";
import { PremiumUserRequest } from "@/types";
import { useEffect, useState } from "react";
import AlertDialog from "@/components/ui/alertDailog";
import { DataTable } from "@/components/ui/table";
import { ColumnDef } from "@tanstack/react-table";

export default function PremiumUserRequestPage() {
  const usePremiumUserRequestHook = usePremiumUserRequest();
  const approveDialog = useDialog();
  const rejectDialog = useDialog();
  const [selectedRequest, setSelectedRequest] =
    useState<PremiumUserRequest | null>(null);

  useEffect(() => {
    usePremiumUserRequestHook.fetchPremiumUserRequests();
  }, []);

  const columns: ColumnDef<PremiumUserRequest>[] = [
    {
      id: "index",
      header: "Index",
      cell: ({ row }) => row.index + 1,
      size: 70,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: (info) => info.getValue(),
      size: 150,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: (info) => info.getValue(),
      size: 200,
    },
    {
      accessorKey: "phoneNumber",
      header: "Phone Number",
      cell: (info) => info.getValue() || "N/A",
      size: 150,
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: (info) => info.getValue(),
      size: 120,
    },
    {
      accessorKey: "verified",
      header: "Verified",
      cell: (info) => (info.getValue() ? "Yes" : "No"),
      size: 100,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <StaticButton
            onClick={function (): void {
              setSelectedRequest(row.original);
              approveDialog.open();
            }}
            children={"Approve"}
            disabled={row.original.role !== "PREMIUM_PENDING"}
          />
          <StaticButton
            onClick={function (): void {
              setSelectedRequest(row.original);
              rejectDialog.open();
            }}
            children={"Reject"}
            disabled={row.original.role !== "PREMIUM_PENDING"}
            className="flex cursor-pointer items-center justify-center gap-2 my-2 px-4 py-2 rounded-md text-white font-medium transition
        bg-red-500 hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>
      ),
    },
  ];

  return (
    <div className=" p-4 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {usePremiumUserRequestHook.loading && <Loading />}
      <AlertDialog
        isOpen={approveDialog.isOpen}
        onClose={approveDialog.close}
        confirmText="Approve Request"
        onConfirm={async () => {
          if (selectedRequest) {
            console.log("Approving premium user request:", selectedRequest);
            await usePremiumUserRequestHook.approvePremiumUserRequest(
              selectedRequest._id.$oid
            );
            await usePremiumUserRequestHook.fetchPremiumUserRequests();
            approveDialog.close();
          }
        }}
      />
      <AlertDialog
        isOpen={rejectDialog.isOpen}
        onClose={rejectDialog.close}
        confirmText="Reject Request"
        onConfirm={async () => {
          if (selectedRequest) {
            await usePremiumUserRequestHook.rejectPremiumUserRequest(
              selectedRequest._id.$oid
            );
            await usePremiumUserRequestHook.fetchPremiumUserRequests();
            rejectDialog.close();
          }
        }}
      />

      <div className="text-center mb-12 mt-8">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-800 mb-4">
          Premium User Request Management
        </h1>
        <p className="text-lg text-gray-600">
          Manage premium user upgrade requests - approve or reject pending
          requests
        </p>
      </div>

      <div className="m-12 p-6 bg-white rounded-lg shadow-md border border-gray-200">
        <DataTable
          columns={columns}
          data={usePremiumUserRequestHook.premiumUserRequests || []}
        />
      </div>
    </div>
  );
}
