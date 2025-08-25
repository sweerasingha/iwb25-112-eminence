"use client";
import Dialog from "@/components/ui/dialog";
import Loading from "@/components/ui/loading";
import StaticButton from "@/components/ui/staticButton";
import useAdmin from "@/hooks/useAdmin";
import { useDialog } from "@/hooks/useDialog";
import { ProvincialAdmin } from "@/types";
import { useEffect, useState } from "react";
import AddEdit from "./add-edit";
import AlertDialog from "@/components/ui/alertDailog";
import { DataTable } from "@/components/ui/table";
import { ColumnDef } from "@tanstack/react-table";

export default function ManageAdmin() {
  const useAdminHook = useAdmin();
  const ManageAdminDialog = useDialog();
  const deleteDialog = useDialog();
  const [selectedAdmin, setSelectedAdmin] = useState<ProvincialAdmin | null>(
    null
  );

  useEffect(() => {
    useAdminHook.fetchAdmins();
  }, []);

  const columns: ColumnDef<ProvincialAdmin>[] = [
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
      size: 100,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: (info) => info.getValue(),
      size: 100,
    },
    {
      accessorKey: "phoneNumber",
      header: "Phone Number",
      cell: (info) => info.getValue(),
      size: 100,
    },
    {
      accessorKey: "province",
      header: "Province",
      cell: (info) => info.getValue(),
      size: 100,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <StaticButton
            onClick={function (): void {
              setSelectedAdmin(row.original);
              ManageAdminDialog.open();
            }}
            children={"Edit"}
          />
          <StaticButton
            onClick={function (): void {
              setSelectedAdmin(row.original);
              deleteDialog.open();
            }}
            children={"Delete"}
            className="flex cursor-pointer items-center justify-center gap-2 my-2 px-4 py-2 rounded-md text-white font-medium transition
        bg-red-500 hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>
      ),
    },
  ];
  console.log(useAdminHook.admins);

  return (
    <div className=" p-4 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {useAdminHook.loading && <Loading />}
      {/* dialogs */}
      <Dialog
        isOpen={ManageAdminDialog.isOpen}
        onClose={ManageAdminDialog.close}
        title={selectedAdmin ? "Edit Admin" : "Add Admin"}
        children={
          <AddEdit
            useAdminHook={useAdminHook}
            handleClose={ManageAdminDialog.close}
            selectedAdmin={selectedAdmin ? selectedAdmin : undefined}
          />
        }
      />
      <AlertDialog
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={async () => {
          if (selectedAdmin) {
            await useAdminHook.deleteAdmin(selectedAdmin._id?.$oid!);
            deleteDialog.close();
          }
        }}
      />{" "}
      {/* Header */}
      <div className="text-center mb-12 mt-8">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-800 mb-4">
          Admin Management
        </h1>
      </div>
      <div className="m-12 p-6 bg-white rounded-lg shadow-md border border-gray-200">
        <DataTable
          buttons={[
            <StaticButton
              key="add-Admin"
              onClick={() => {
                setSelectedAdmin(null);
                ManageAdminDialog.open();
              }}
              children={"Add Admin"}
            />,
          ]}
          columns={columns}
          data={useAdminHook.admins || []}
        />
      </div>
    </div>
  );
}
