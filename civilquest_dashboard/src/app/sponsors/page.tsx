"use client";
import Loading from "@/components/ui/loading";
import StaticButton from "@/components/ui/staticButton";
import useSponsor from "@/hooks/useSponsors";
import { useDialog } from "@/hooks/useDialog";
import { Sponsor } from "@/types";
import { useEffect, useState } from "react";
import AlertDialog from "@/components/ui/alertDailog";
import { DataTable } from "@/components/ui/table";
import { ColumnDef } from "@tanstack/react-table";
import { useUserContext } from "@/context/userContext";
import { Roles } from "@/types";

export default function ManageSponsors() {
  const useSponsorHook = useSponsor();
  const approveDialog = useDialog();
  const rejectDialog = useDialog();
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);
  const { user } = useUserContext();
  const role = user?.role;
  const canModerate = role === Roles.ADMIN_OPERATOR || role === Roles.PREMIUM_USER || role === Roles.ADMIN;

  useEffect(() => {
    useSponsorHook.fetchSponsors();
  }, []);

  const columns: ColumnDef<Sponsor>[] = [
    {
      id: "index",
      header: "Index",
      cell: ({ row }) => row.index + 1,
      size: 70,
    },
    {
      accessorKey: "userId",
      header: "User",
      cell: (info) => info.getValue(),
      size: 150,
    },
    {
      accessorKey: "sponsorType",
      header: "Sponsor Type",
      cell: (info) => info.getValue(),
      size: 200,
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: (info) => info.getValue() || "N/A",
      size: 150,
    },
    {
      accessorKey: "approvedStatus",
      header: "Approved Status",
      cell: (info) => info.getValue() || "N/A",
      size: 150,
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: (info) =>( (info.getValue() as string).slice(0,50) +'....')|| "N/A",
      size: 150,
      
    },

  {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const sponsor = row.original;
        return (
          <div className="flex gap-2">
              {canModerate && sponsor.approvedStatus === "APPROVED" && (
              <>
                <StaticButton
                  onClick={() => {
                    setSelectedSponsor(sponsor);
                    approveDialog.open();
                  }}
                >
                  Approve
                </StaticButton>
                <StaticButton
                  onClick={() => {
                    setSelectedSponsor(sponsor);
                    rejectDialog.open();
                  }}
                  className="flex cursor-pointer items-center justify-center gap-2 my-2 px-4 py-2 rounded-md text-white font-medium transition
        bg-red-500 hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  Reject
                </StaticButton>
              </>
            )}
          </div>
        );
      },
      size: 200,
    },
  ];

  const handleApprove = async () => {
    if (selectedSponsor) {
      await useSponsorHook.approveSponsor(selectedSponsor._id);
      approveDialog.close();
      setSelectedSponsor(null);
    }
  };

  const handleReject = async () => {
    if (selectedSponsor) {
      await useSponsorHook.rejectSponsor(selectedSponsor._id);
      rejectDialog.close();
      setSelectedSponsor(null);
    }
  };

  if (useSponsorHook.loading) return <Loading />;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Sponsors</h1>
        <p className="text-gray-600 mt-2">
          Manage and review sponsor registrations
        </p>
      </div>

      <div className="m-12 p-6 bg-white rounded-lg shadow-md border border-gray-200">
        <DataTable columns={columns} data={useSponsorHook.sponsors} />
      </div>

      <AlertDialog
        isOpen={approveDialog.isOpen}
        onClose={() => approveDialog.close()}
        onConfirm={handleApprove}
        title="Approve Sponsor "
        description={`Are you sure you want to approve the sponsor  for "${selectedSponsor?.userId}"?`}
        confirmText="Approve"
        cancelText="Cancel"
      />

      <AlertDialog
        isOpen={rejectDialog.isOpen}
        onClose={() => rejectDialog.close()}
        onConfirm={handleReject}
        title="Reject Sponsor "
        description={`Are you sure you want to reject the sponsor  for "${selectedSponsor?.userId}"?`}
        confirmText="Reject"
        cancelText="Cancel"
      />
    </div>
  );
}
