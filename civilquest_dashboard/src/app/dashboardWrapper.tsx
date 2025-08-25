"use client";
import Loading from "@/components/ui/loading";
import { useUserContext } from "@/context/userContext";
import React, { ReactNode } from "react";
import LoginPage from "./(auth)/login/page";

const DashboardWrapper = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const { isChecking, isAuthenticated } = useUserContext();
  if (isChecking) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }
  return <div>{children}</div>;
};

export default DashboardWrapper;
