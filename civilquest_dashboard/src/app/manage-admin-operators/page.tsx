"use client";
import Dialog from "@/components/ui/dialog";
import Loading from "@/components/ui/loading";
import StaticButton from "@/components/ui/staticButton";
import useAdminOperator from "@/hooks/useAdminOperator";
import { useDialog } from "@/hooks/useDialog";
import { AdminOperator } from "@/types";
import { useEffect, useState } from "react";
import AddEdit from "./add-edit";
import AlertDialog from "@/components/ui/alertDailog";
import { DataTable } from "@/components/ui/table";
import { ColumnDef } from "@tanstack/react-table";

export default function ManageAdminOperators() {
  const useAdminOperatorHook = useAdminOperator();
  const ManageAdminOperatorDialog = useDialog();
  const deleteDialog = useDialog();
  const [selectedAdminOperator, setSelectedAdminOperator] =
    useState<AdminOperator | null>(null);

  useEffect(() => {
    useAdminOperatorHook.fetchAdminOperators();
  }, []);

  const columns: ColumnDef<AdminOperator>[] = [
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
      accessorKey: "city",
      header: "City",
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
              setSelectedAdminOperator(row.original);
              ManageAdminOperatorDialog.open();
            }}
            children={"Edit"}
          />
          <StaticButton
            onClick={function (): void {
              setSelectedAdminOperator(row.original);
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

  return (
    <div className=" p-4 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {useAdminOperatorHook.loading && <Loading />}
      <Dialog
        isOpen={ManageAdminOperatorDialog.isOpen}
        onClose={ManageAdminOperatorDialog.close}
        title={
          selectedAdminOperator ? "Edit Admin Operator" : "Add Admin Operator"
        }
        children={
          <AddEdit
            useAdminOperatorHook={useAdminOperatorHook}
            handleClose={ManageAdminOperatorDialog.close}
            selectedAdminOperator={
              selectedAdminOperator ? selectedAdminOperator : undefined
            }
          />
        }
      />
      <AlertDialog
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={async () => {
          if (selectedAdminOperator) {
            await useAdminOperatorHook.deleteAdminOperator(
              selectedAdminOperator._id?.$oid!
            );
            deleteDialog.close();
          }
        }}
      />{" "}
      <div className="text-center mb-12 mt-8">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-800 mb-4">
          Admin Operator Management
        </h1>
      </div>
      <div className="m-12 p-6 bg-white rounded-lg shadow-md border border-gray-200">
        <DataTable
          buttons={[
            <StaticButton
              key="add-admin-operator"
              onClick={() => {
                setSelectedAdminOperator(null);
                ManageAdminOperatorDialog.open();
              }}
              children={"Add Admin Operator"}
            />,
          ]}
          columns={columns}
          data={useAdminOperatorHook.adminOperators || []}
        />
      </div>
    </div>
  );
}
