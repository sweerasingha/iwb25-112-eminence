"use client";
import Dialog from "@/components/ui/dialog";
import Loading from "@/components/ui/loading";
import StaticButton from "@/components/ui/staticButton";
import useEvent from "@/hooks/useEvent";
import { useDialog } from "@/hooks/useDialog";
import { Event, Roles } from "@/types";
import { useEffect, useState } from "react";
import AlertDialog from "@/components/ui/alertDailog";
import { DataTable } from "@/components/ui/table";
import { ColumnDef } from "@tanstack/react-table";
import AddEdit from "./edit";
import Create from "./create";
import CreateSponsorship from "./create-sponsorship";
import EventCard from "./event-card";
import { useUserContext } from "@/context/userContext";

export default function ManageEvent() {
  const useEventHook = useEvent();
  const { user } = useUserContext();
  const ManageEventDialog = useDialog();
  const deleteDialog = useDialog();
  const endEventDialog = useDialog();
  const createEventDialog = useDialog();
  const showEventDialog = useDialog();
  const approveEventDialog = useDialog();
  const rejectEventDialog = useDialog();
  const createSponsorshipDialog = useDialog();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const role = user?.role;
  const canManage =
    role === Roles.ADMIN || role === Roles.ADMIN_OPERATOR || role === Roles.SUPER_ADMIN;

  useEffect(() => {
    useEventHook.fetchEvents();
  }, []);

  const columns: ColumnDef<Event>[] = [
    {
      id: "index",
      header: "Index",
      cell: ({ row }) => row.index + 1,
      size: 70,
    },
    {
      accessorKey: "eventTitle",
      header: "Event Title",
      cell: ({ row }) => (
        <div className="font-medium text-gray-900">{row.original.eventTitle}</div>
      ),
      size: 100,
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        const d = row.original.date ? new Date(row.original.date) : null;
        const formatted = d ? d.toLocaleDateString() : "-";
        return <span className="text-gray-700">{formatted}</span>;
      },
      size: 100,
    },

    {
      accessorKey: "city",
      header: "City",
      cell: ({ row }) => (
        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-600/20">
          {row.original.city}
        </span>
      ),
      size: 100,
    },

    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const s = row.original.status;
        const styles: Record<string, string> = {
          PENDING: "bg-yellow-50 text-yellow-800 ring-yellow-600/20",
          APPROVED: "bg-green-50 text-green-700 ring-green-600/20",
          REJECTED: "bg-red-50 text-red-700 ring-red-600/20",
          ENDED: "bg-gray-100 text-gray-700 ring-gray-500/20",
        };
        const cls = styles[s] || "bg-gray-50 text-gray-700 ring-gray-500/20";
        return (
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${cls}`}>
            {s}
          </span>
        );
      },
      size: 100,
    },

    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <StaticButton
            onClick={function (): void {
              setSelectedEvent(row.original);
              showEventDialog.open();
            }}
            children={"Show"}
          />
          {canManage && (
            <>
        <StaticButton
                onClick={function (): void {
          setSelectedEvent(row.original);
                  ManageEventDialog.open();
                }}
                children={"Edit"}
                disabled={row.original.status === "ENDED"}
              />
        <StaticButton
                onClick={function (): void {
          setSelectedEvent(row.original);
                  approveEventDialog.open();
                }}
                children={"Approve"}
                disabled={
                  row.original.status === "APPROVED" ||
                  row.original.status === "REJECTED" ||
                  row.original.status === "ENDED"
                }
              />
        <StaticButton
                onClick={function (): void {
          setSelectedEvent(row.original);
                  rejectEventDialog.open();
                }}
                children={"Reject"}
                disabled={
                  row.original.status === "REJECTED" ||
                  row.original.status === "APPROVED" ||
                  row.original.status === "ENDED"
                }
              />
        <StaticButton
                onClick={function (): void {
          setSelectedEvent(row.original);
                  deleteDialog.open();
                }}
                children={"Delete"}
                className="flex cursor-pointer items-center justify-center gap-2 my-2 px-4 py-2 rounded-md text-white font-medium transition
        bg-red-500 hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed"
              />
        <StaticButton
                onClick={function (): void {
          setSelectedEvent(row.original);
                  endEventDialog.open();
                }}
                children={"End"}
                disabled={row.original.status === "ENDED"}
                className="flex cursor-pointer items-center justify-center gap-2 my-2 px-4 py-2 rounded-md text-white font-medium transition
        bg-red-500 hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-400"
              />
              <StaticButton
                onClick={function (): void {
                  setSelectedEvent(row.original);
                  createSponsorshipDialog.open();
                }}
                children={"Sponse"}
                className="flex cursor-pointer items-center justify-center gap-2 my-2 px-4 py-2 rounded-md text-white font-medium transition
        bg-green-500 hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-400"
              />
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className=" p-4 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {useEventHook.loading && <Loading />}
      <Dialog
        isOpen={ManageEventDialog.isOpen}
        onClose={ManageEventDialog.close}
        title={selectedEvent ? "Edit Event" : "Add Event"}
        children={
          <AddEdit
            useEventHook={useEventHook}
            handleClose={ManageEventDialog.close}
            selectedEvent={selectedEvent ? selectedEvent : undefined}
          />
        }
      />
      <Dialog
        isOpen={createEventDialog.isOpen}
        onClose={createEventDialog.close}
        width="lg"
        title="Add Event"
        children={
          <Create
            useEventHook={useEventHook}
            handleClose={createEventDialog.close}
          />
        }
      />
      <Dialog
        isOpen={showEventDialog.isOpen}
        onClose={showEventDialog.close}
        width="lg"
        title="Event Details"
        children={<EventCard event={selectedEvent!} />}
      />
      <AlertDialog
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={async () => {
          if (selectedEvent) {
            const eid = selectedEvent._id || selectedEvent.id;
            await useEventHook.deleteEvent(eid);
            deleteDialog.close();
          }
        }}
      />
      <AlertDialog
        isOpen={approveEventDialog.isOpen}
        onClose={approveEventDialog.close}
        confirmText="Approve Event"
        onConfirm={async () => {
          if (selectedEvent) {
            console.log("Approving event:", selectedEvent);
            const eid = selectedEvent._id || selectedEvent.id;
            await useEventHook.approveEvent(eid);
            approveEventDialog.close();
          }
        }}
      />
      <AlertDialog
        isOpen={rejectEventDialog.isOpen}
        onClose={rejectEventDialog.close}
        confirmText="Reject Event"
        onConfirm={async () => {
          if (selectedEvent) {
            const eid = selectedEvent._id || selectedEvent.id;
            await useEventHook.rejectEvent(eid);
            rejectEventDialog.close();
          }
        }}
      />
      <AlertDialog
        isOpen={endEventDialog.isOpen}
        onClose={endEventDialog.close}
        confirmText="End Event"
        onConfirm={async () => {
          if (selectedEvent) {
            const eid = selectedEvent._id || selectedEvent.id;
            await useEventHook.endEvent(eid);
            endEventDialog.close();
          }
        }}
      />
      <Dialog
        isOpen={createSponsorshipDialog.isOpen}
        onClose={createSponsorshipDialog.close}
        width="lg"
        title="Create Sponsorship"
        children={
          <CreateSponsorship
            handleClose={createSponsorshipDialog.close}
            eventId={(selectedEvent?._id || selectedEvent?.id) as string}
          />
        }
      />
      <div className="text-center mb-12 mt-8">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-800 mb-4">
          Event Management
        </h1>
      </div>
      <div className="m-12 p-6 bg-white rounded-lg shadow-md border border-gray-200">
        <DataTable
          buttons={
            canManage
              ? [
                  <StaticButton
                    key="add-Event"
                    onClick={() => {
                      createEventDialog.open();
                    }}
                    children={"Add Event"}
                  />,
                ]
              : []
          }
          columns={columns}
          data={useEventHook.events || []}
        />
      </div>
    </div>
  );
}
