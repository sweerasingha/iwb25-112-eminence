"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaFileInvoice,
  FaHome,
  FaUsers,
  FaCog,
  FaChartBar,
  FaClipboardList,
} from "react-icons/fa";
import { IoLogOut } from "react-icons/io5";

import LoadingButton from "../ui/button/index";
import { useUserContext } from "@/context/userContext";
import { Roles } from "@/types";

type SidebarItem = {
  name: string;
  href: string;
  icon?: React.ReactNode;
  allowableRoles?: string[];
};

const SideBar = () => {
  const { logout, user } = useUserContext();

  const links: SidebarItem[] = [
    {
      name: "Home",
      href: "/",
      icon: <FaHome />,
      allowableRoles: [Roles.ADMIN, Roles.SUPER_ADMIN, Roles.ADMIN_OPERATOR],
    },
    {
      name: "Manage Admins",
      href: "/manage-admins",
      icon: <FaFileInvoice />,
      allowableRoles: [Roles.SUPER_ADMIN],
    },
    {
      name: "Manage Operators",
      href: "/manage-admin-operators",
      icon: <FaFileInvoice />,
      allowableRoles: [Roles.ADMIN],
    },
    {
      name: "Events",
      href: "/events",
      icon: <FaFileInvoice />,
      allowableRoles: [Roles.ADMIN, Roles.ADMIN_OPERATOR, Roles.SUPER_ADMIN],
    },
    {
      name: "Sponsors",
      href: "/sponsors",
      icon: <FaFileInvoice />,
      allowableRoles: [Roles.ADMIN, Roles.ADMIN_OPERATOR],
    },
    {
      name: "User Management",
      href: "/user-management",
      icon: <FaUsers />,
      allowableRoles: [Roles.ADMIN, Roles.SUPER_ADMIN, Roles.ADMIN_OPERATOR],
    },
    {
      name: "Premium User Requests",
      href: "/premium-user-requests",
      icon: <FaUsers />,
      allowableRoles: [Roles.ADMIN, Roles.ADMIN_OPERATOR],
    },
    {
      name: "Points Management",
      href: "/points-management",
      icon: <FaCog />,
      allowableRoles: [Roles.ADMIN, Roles.ADMIN_OPERATOR, Roles.SUPER_ADMIN],
    },
    {
      name: "Analytics",
      href: "/analytics",
      icon: <FaChartBar />,
      allowableRoles: [Roles.ADMIN, Roles.SUPER_ADMIN],
    },
    {
      name: "Audit & Monitoring",
      href: "/audit",
      icon: <FaClipboardList />,
      allowableRoles: [Roles.ADMIN, Roles.SUPER_ADMIN],
    },

  ];

  const path = usePathname();

  return (
    <div className="hidden sm:flex sm:w-64 h-full bg-primary/85 min-h-screen text-white p-4 fixed flex-col justify-between">
      <div>
        {links.map(
          (link, index) =>
            link.allowableRoles?.includes(
              user?.role ?? Roles.ADMIN_OPERATOR
            ) && (
              <Link
                key={index}
                href={link.href}
                className={`${
                  path === link.href ? "bg-secondary" : "bg-secondary/20"
                } p-4 hover:bg-secondary/50 cursor-pointer flex items-center space-x-3 rounded-md my-4 transition-all duration-300`}
              >
                <div className="text-2xl">{link.icon}</div>
                <h1 className="text-md font-semibold">{link.name}</h1>
              </Link>
            )
        )}
      </div>

      <div>
        <LoadingButton
          onClick={async () => {
            logout();
          }}
          className="p-4 bg-red-700 w-full hover:bg-red-600/50 cursor-pointer rounded-md my-4 mb-16 transition-all duration-300 flex items-center space-x-3"
        >
          <div className="text-2xl">{<IoLogOut />}</div>
          <h1 className="text-md font-semibold">Logout</h1>
        </LoadingButton>
      </div>
    </div>
  );
};

export default SideBar;
