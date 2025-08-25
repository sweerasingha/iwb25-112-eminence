"use client";

import { deleteCookie, getCookie, setCookie } from "cookies-next";
import { jwtDecode } from "jwt-decode";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CustomJwtPayload, User, UserSession } from "../types";
import { STORAGE_KEYS } from "@/config";

interface UseContextValue extends UserSession {
  updateAccessToken: (token: string | null) => void;
  isChecking: boolean;
  setIsChecking: (isChecking: boolean) => void;
  logout: () => void;
}

interface UserContextProps {
  children: ReactNode;
  initialSession?: UserSession;
}

const UserContext = createContext<UseContextValue | undefined>(undefined);

export const UserProvider: React.FC<UserContextProps> = ({
  children,
  initialSession,
}) => {
  const [session, setSession] = useState<UserSession>(
    initialSession || { user: null, isAuthenticated: false }
  );
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkStoredToken = () => {
      try {
        const storedToken = getCookie(STORAGE_KEYS.USER_TOKEN);
        if (typeof storedToken === "string") {
          const decodedToken = jwtDecode<CustomJwtPayload>(storedToken);

          // Check token expiration
          if (decodedToken.exp && decodedToken.exp * 1000 < Date.now()) {
            deleteCookie(STORAGE_KEYS.USER_TOKEN);
            setSession({ user: null, isAuthenticated: false });
            setIsChecking(false);
            return;
          }

          const user: User = {
            email: decodedToken.sub,
            role: decodedToken.role,
            token: storedToken,
          };
          console.log("User:", user);
          setSession({
            user,
            isAuthenticated: true,
          });
        }
      } catch (error) {
        console.error("Token validation error:", error);
        deleteCookie(STORAGE_KEYS.USER_TOKEN);
        setSession({ user: null, isAuthenticated: false });
      } finally {
        setIsChecking(false);
      }
    };

    checkStoredToken();
  }, []);

  const updateAccessToken = (token: string | null) => {
    try {
      console.log("Updating access token:", token);
      if (typeof token === "string") {
        setCookie(STORAGE_KEYS.USER_TOKEN, token);
        const decodedToken = jwtDecode<CustomJwtPayload>(token);
        const user: User = {
          email: decodedToken.sub,
          role: decodedToken.role,
          token: token,
        };

        setSession({
          user,
          isAuthenticated: true,
        });
      } else {
        deleteCookie(STORAGE_KEYS.USER_TOKEN);
        setSession({ user: null, isAuthenticated: false });
      }
    } catch (error) {
      console.error(error);
      deleteCookie(STORAGE_KEYS.USER_TOKEN);
      setSession({ user: null, isAuthenticated: false });
    }
  };

  const logout = () => {
    deleteCookie(STORAGE_KEYS.USER_TOKEN);
    setSession({ user: null, isAuthenticated: false });
  };

  const value = useMemo(
    () => ({
      ...session,
      updateAccessToken,
      isChecking,
      setIsChecking,
      logout,
    }),
    [session, isChecking]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUserContext = (): UseContextValue => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};
