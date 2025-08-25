import { useAppSelector, useAppDispatch } from "../store";
import {
  loginUser,
  signupUser,
  logoutUser,
  loadStoredAuth as loadStoredAuthAction,
  clearError,
  updateUser,
  selectTokenUser,
  selectUserEmail,
  selectUserRole,
} from "../store/slices/authSlice";
import { LoginCredentials, SignupCredentials, User } from "../types";
import { useEffect, useRef } from "react";

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const tokenUser = useAppSelector(selectTokenUser);
  const userEmail = useAppSelector(selectUserEmail);
  const userRole = useAppSelector(selectUserRole);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Load stored auth data on app startup only once
    if (!hasInitialized.current && !auth.isAuthenticated && !auth.isLoading) {
      hasInitialized.current = true;
      dispatch(loadStoredAuthAction());
    }
  }, [dispatch]);

  const login = async (credentials: LoginCredentials) => {
    const result = await dispatch(loginUser(credentials));
    return result.meta.requestStatus === "fulfilled";
  };

  const signup = async (credentials: SignupCredentials) => {
    const result = await dispatch(signupUser(credentials));
    return result.meta.requestStatus === "fulfilled";
  };

  const logout = async () => {
    const result = await dispatch(logoutUser());
    return result.meta.requestStatus === "fulfilled";
  };

  const updateProfile = (userData: Partial<User>) => {
    dispatch(updateUser(userData));
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  const loadStoredAuth = () => {
    dispatch(loadStoredAuthAction());
  };

  return {
    // State
    user: auth.user,
    tokenUser,
    userEmail,
    userRole,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    error: auth.error,

    // Actions
    login,
    signup,
    logout,
    updateProfile,
    loadStoredAuth,
    clearError: clearAuthError,
  };
};
