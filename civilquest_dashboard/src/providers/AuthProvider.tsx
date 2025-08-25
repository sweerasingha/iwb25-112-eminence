"use client";

import { UserProvider } from "@/context/userContext";
import React, { ReactNode } from "react";

const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <UserProvider>{children}</UserProvider>;
};

export default AuthProvider;
