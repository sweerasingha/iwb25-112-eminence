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
import useEvent from "@/hooks/useEvent";
import { useMemo } from "react";
import Dialog from "@/components/ui/dialog";
import Link from "next/link";

export default function ManageSponsors() {
  const useSponsorHook = useSponsor();
  const approveDialog = useDialog();
  const rejectDialog = useDialog();
  const showSponsorDialog = useDialog();
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);
  const { user } = useUserContext();
  const role = user?.role;
  const useEventHook = useEvent();
  const canModerate =
    role === Roles.ADMIN_OPERATOR ||
    role === Roles.PREMIUM_USER ||
    role === Roles.ADMIN;

  useEffect(() => {
    useSponsorHook.fetchSponsors();
    useEventHook.fetchEvents();
  }, []);

  const eventMap = useMemo(() => {
    const map = new Map<string, any>();
    for (const e of useEventHook.events) {
      const id = (e as any)._id || (e as any).id;
      if (id) map.set(String(id), e);
    }
    return map;
  }, [useEventHook.events]);

  const columns: ColumnDef<Sponsor>[] = [
    {
      id: "index",
      header: "Index",
      cell: ({ row }) => row.index + 1,
      size: 70,
    },
    {
      accessorKey: "eventId",
      header: "Event",
      cell: ({ row }) => {
        const e = row.original as any;
        const ev = eventMap.get(e.eventId);
        const title = ev?.eventTitle || e.eventTitle || e.event?.eventTitle || ("#" + (e.eventId?.slice(-6) || "-"));
        const dRaw = ev?.date || e.eventDate || e.event?.date;
        const d = dRaw ? new Date(dRaw) : null;
        const dateStr = d ? d.toLocaleDateString() : "-";
        const city = ev?.city || e.eventCity || e.event?.city || "-";
        return (
          <div className="leading-tight">
            <div className="font-medium text-gray-900 truncate max-w-[220px]" title={title}>{title}</div>
            <div className="text-xs text-gray-500">{dateStr} · {city}</div>
          </div>
        );
      },
      size: 260,
    },
    {
      accessorKey: "sponsorType",
      header: "Sponsor Type",
      cell: (info) => info.getValue(),
      size: 140,
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => {
        const amount = row.original.amount;
        const donation = (row.original as any).donationAmount;
        const n = typeof amount === "number" ? amount : Number(amount);
        const formatted = isNaN(n) ? "-" : n.toLocaleString(undefined, { style: "currency", currency: "USD" });
        const hasDonation = typeof donation === "number" && donation > 0;
        return (
          <div className="flex flex-col">
            <span>{formatted}</span>
            {hasDonation && (
              <span className="text-xs text-gray-500">Donation: {donation.toLocaleString(undefined, { style: "currency", currency: "USD" })}</span>
            )}
          </div>
        );
      },
      size: 140,
    },
    {
      accessorKey: "approvedStatus",
      header: "Approved Status",
      cell: ({ row }) => {
        const s = row.original.approvedStatus;
        const styles: Record<string, string> = {
          PENDING: "bg-yellow-50 text-yellow-800 ring-yellow-600/20",
          APPROVED: "bg-green-50 text-green-700 ring-green-600/20",
          REJECTED: "bg-red-50 text-red-700 ring-red-600/20",
          ENDED: "bg-gray-100 text-gray-700 ring-gray-500/20",
        };
        const cls = styles[s] || "bg-gray-50 text-gray-700 ring-gray-500/20";
        return (
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${cls}`}
          >
            {s}
          </span>
        );
      },
      size: 130,
    },

    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const sponsor = row.original;
        return (
          <div className="flex gap-2">
            <StaticButton
              onClick={() => {
                setSelectedSponsor(sponsor);
                showSponsorDialog.open();
              }}
            >
              Show
            </StaticButton>
            {canModerate && sponsor.approvedStatus === "PENDING" && (
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
                  className="flex cursor-pointer items-center justify-center gap-2 my-2 px-4 py-2 rounded-md text-white font-medium transition bg-red-500 hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  Reject
                </StaticButton>
              </>
            )}
          </div>
        );
      },
      size: 220,
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
        <div className="text-center mb-12 mt-8">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-800 mb-4">
          Sponsor Management
        </h1>
      </div>

      <div className="m-12 p-6 bg-white rounded-lg shadow-md border border-gray-200">
        {useSponsorHook.error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {useSponsorHook.error}
          </div>
        )}
        <DataTable columns={columns} data={useSponsorHook.sponsors} />
        {!useSponsorHook.error && useSponsorHook.sponsors.length === 0 && (
          <div className="mt-4 text-center text-gray-500 text-sm">No sponsor requests found.</div>
        )}
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

      {/* Show Sponsor Details */}
      <Dialog
        isOpen={showSponsorDialog.isOpen}
        onClose={() => showSponsorDialog.close()}
        title="Sponsor Details"
        width="lg"
      >
        {selectedSponsor && (
          <div className="space-y-6">
            {(() => {
              const ev = eventMap.get(selectedSponsor.eventId) as any;
              const status = selectedSponsor.approvedStatus;
              const statusStyles: Record<string, string> = {
                PENDING: "bg-yellow-50 text-yellow-800 ring-yellow-600/20",
                APPROVED: "bg-green-50 text-green-700 ring-green-600/20",
                REJECTED: "bg-red-50 text-red-700 ring-red-600/20",
                ENDED: "bg-gray-100 text-gray-700 ring-gray-500/20",
              };
              const statusCls = statusStyles[status] || "bg-gray-50 text-gray-700 ring-gray-500/20";
              const dateStr = ev?.date ? new Date(ev.date).toLocaleDateString() : "-";
              const city = ev?.city || "-";
              const amountStr = typeof selectedSponsor.amount === "number"
                ? selectedSponsor.amount.toLocaleString(undefined, { style: "currency", currency: "USD" })
                : String(selectedSponsor.amount);
              const donation = (selectedSponsor as any).donationAmount;

              return (
                <>
                  {/* Header */}
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-lg font-semibold text-gray-900 truncate" title={ev?.eventTitle || selectedSponsor.eventId}>
                        {ev?.eventTitle || ("#" + selectedSponsor.eventId.slice(-6))}
                      </div>
                      <div className="text-sm text-gray-600">
                        {dateStr} · {city}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-600/20">
                          {selectedSponsor.sponsorType}
                        </span>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${statusCls}`}>
                          {status}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{amountStr}</div>
                      {typeof donation === "number" && donation > 0 && (
                        <div className="text-xs text-gray-500">Donation: {donation.toLocaleString(undefined, { style: "currency", currency: "USD" })}</div>
                      )}
                    </div>
                  </div>

                  {/* Quick actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/events?search=${encodeURIComponent(ev?.eventTitle || selectedSponsor.eventId)}`}
                      className="inline-flex cursor-pointer items-center justify-center gap-2 px-4 py-2 rounded-md text-white font-medium transition bg-gray-800 hover:bg-gray-900"
                    >
                      View Event
                    </Link>
                    {canModerate && selectedSponsor.approvedStatus === "PENDING" && (
                      <>
                        <StaticButton onClick={() => { setSelectedSponsor(selectedSponsor); approveDialog.open(); }}>Approve</StaticButton>
                        <StaticButton
                          onClick={() => { setSelectedSponsor(selectedSponsor); rejectDialog.open(); }}
                          className="flex cursor-pointer items-center justify-center gap-2 px-4 py-2 rounded-md text-white font-medium transition bg-red-500 hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-400"
                        >
                          Reject
                        </StaticButton>
                      </>
                    )}
                  </div>

                  {/* Details grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-500">Sponsor ID</div>
                      <div className="font-medium break-all">{selectedSponsor._id}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-500">User ID</div>
                      <div className="font-medium break-all">{selectedSponsor.userId}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-500">Event ID</div>
                      <div className="font-medium break-all">{selectedSponsor.eventId}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-500">Status</div>
                      <div className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${statusCls}`}>{status}</div>
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <div className="text-sm text-gray-500">Description</div>
                      <div className="rounded-md border border-gray-200 p-3 text-sm text-gray-800 whitespace-pre-wrap break-words bg-gray-50">{selectedSponsor.description || '-'}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-500">Created</div>
                      <div className="font-medium">{selectedSponsor.createdAt ? new Date(selectedSponsor.createdAt).toLocaleString() : '-'}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-500">Updated</div>
                      <div className="font-medium">{selectedSponsor.updatedAt ? new Date(selectedSponsor.updatedAt).toLocaleString() : '-'}</div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </Dialog>
    </div>
  );
}
