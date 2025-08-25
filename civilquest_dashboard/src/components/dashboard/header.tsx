"use client";

import React from "react";
import { FaBell, FaUser, FaCog } from "react-icons/fa";
import { useUserContext } from "@/context/userContext";
import LoadingButton from "@/components/ui/button";

const DashboardHeader: React.FC = () => {
  const { user, logout } = useUserContext();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-gray-900">
            Civil Quest Dashboard
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200">
            <FaBell className="w-5 h-5" />
          </button>

          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200">
            <FaCog className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center">
              <FaUser className="w-4 h-4" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900">
                {user?.email?.split("@")[0] || "Admin"}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role?.toLowerCase().replace("_", " ") || "Administrator"}
              </p>
            </div>
          </div>

          <LoadingButton
            onClick={async () => {
              logout();
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
          >
            Logout
          </LoadingButton>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
