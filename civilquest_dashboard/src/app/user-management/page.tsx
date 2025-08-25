"use client";
import React, { use, useEffect, useState } from "react";
import useUser from "@/hooks/useUser";
import LoadingButton from "@/components/ui/button";
import Loading from "@/components/ui/loading";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/table";

const USER_ROLES = [
  { name: "Premium User", value: "PREMIUM_USER" },
  { name: "Regular User", value: "USER" },
  { name: "Admin", value: "ADMIN" },
  { name: "Super Admin", value: "SUPER_ADMIN" },
  { name: "Admin Operator", value: "ADMIN_OPERATOR" },
];

export default function UserManagementPage() {
  const { users, loading, searchUsers, getUsersByRole } = useUser();
  const [searchParams, setSearchParams] = useState({
    name: "",
    role: "",
    limit: 10,
    skip: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      await searchUsers(searchParams);
    };
    fetchData();
  }, []);

  const handleSearch = async () => {
    const params = {
      ...searchParams,
      name: searchParams.name || undefined,
      role: searchParams.role || undefined,
    };
    await searchUsers(params);
  };

  const handleGetByRole = async (role: string) => {
    await getUsersByRole(role);
  };

  const columns: ColumnDef<any>[] = [
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
      accessorKey: "role",
      header: "Role",
      cell: (info) => info.getValue(),
      size: 100,
    },
    {
      accessorKey: "verified",
      header: "Verified",
      cell: (info) => (info.getValue() ? "Yes" : "No"),
      size: 100,
    },
  ];

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="text-center mb-12 mt-8">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-800 mb-4">
          User Management
        </h1>
      </div>
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Search Users</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <input
            type="text"
            placeholder="Search by name"
            value={searchParams.name}
            onChange={(e) =>
              setSearchParams((prev) => ({ ...prev, name: e.target.value }))
            }
            className="border border-gray-300 rounded-md px-3 py-2"
          />
          <select
            value={searchParams.role}
            onChange={(e) =>
              setSearchParams((prev) => ({ ...prev, role: e.target.value }))
            }
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">Select role</option>
            {USER_ROLES.map((role) => (
              <option key={role.value} value={role.value}>
                {role.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Limit"
            value={searchParams.limit}
            onChange={(e) =>
              setSearchParams((prev) => ({
                ...prev,
                limit: parseInt(e.target.value) || 10,
              }))
            }
            className="border border-gray-300 rounded-md px-3 py-2"
          />
          <input
            type="number"
            placeholder="Skip"
            value={searchParams.skip}
            onChange={(e) =>
              setSearchParams((prev) => ({
                ...prev,
                skip: parseInt(e.target.value) || 0,
              }))
            }
            className="border border-gray-300 rounded-md px-3 py-2"
          />
        </div>
        <LoadingButton onClick={handleSearch}>Search Users</LoadingButton>
      </div>

      <DataTable columns={columns} data={users} />
    </div>
  );
}
