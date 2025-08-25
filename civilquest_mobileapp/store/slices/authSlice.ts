import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  AuthState,
  LoginCredentials,
  SignupCredentials,
  User,
  AuthTokens,
  TokenUser,
} from "../../types";
import { authService } from "../../services/auth";
import { STORAGE_KEYS } from "../../config";
import { getUserFromToken, isTokenExpired } from "../../utils/helpers";
import { api } from "../../services/api";

const initialState: AuthState = {
  user: null,
  tokenUser: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);

      if (!response.success || !response.data?.tokens?.accessToken) {
        return rejectWithValue(response.message || "Login failed");
      }

  const token = response.data.tokens.accessToken;

      // Check if token is expired
      if (isTokenExpired(token)) {
        return rejectWithValue("Token is expired");
      }

      // Extract user info from token
      const tokenUser =
        getUserFromToken(token) || ({ email: credentials.email, role: "USER" } as TokenUser);

  // Store token securely 
  await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, token);
  api.setAuthToken(token);

      return {
        tokens: response.data.tokens,
        tokenUser,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

export const signupUser = createAsyncThunk(
  "auth/signup",
  async (credentials: SignupCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.signup(credentials);

      if (response.success && response.data) {
        const token = response.data.tokens.accessToken;

        if (token) {
          // Check if token is expired
          if (isTokenExpired(token)) {
            return rejectWithValue("Token is expired");
          }

          // Extract user info from token
          const tokenUser = getUserFromToken(token);
          if (!tokenUser) {
            return rejectWithValue("Invalid token format");
          }

          await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, token);
          api.setAuthToken(token);

          return {
            tokens: response.data.tokens,
            tokenUser,
          };
        }

 
        return {
          tokens: { accessToken: "" as unknown as string },
          tokenUser: null as any,
        };
      }

      return rejectWithValue(response.message || "Signup failed");
    } catch (error: any) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_TOKEN);

      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || "Logout failed");
    }
  }
);

export const loadStoredAuth = createAsyncThunk(
  "auth/loadStored",
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);

  if (token) {
        // Check if token is expired
        if (isTokenExpired(token)) {
          await AsyncStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
          return rejectWithValue("Token is expired");
        }

        // Extract user info from token
        const tokenUser = getUserFromToken(token);
        if (!tokenUser) {
          await AsyncStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
          return rejectWithValue("Invalid token format");
        }

  api.setAuthToken(token);
  return {
          tokens: { accessToken: token },
          tokenUser,
        };
      }

      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to load stored auth");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setTokenUser: (state, action: PayloadAction<TokenUser | null>) => {
      state.tokenUser = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tokens = action.payload.tokens;
        state.tokenUser = action.payload.tokenUser;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.tokenUser = null;
      });

    // Signup
    builder
      .addCase(signupUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.isLoading = false;
  state.tokens = action.payload.tokens;
  state.tokenUser = action.payload.tokenUser;
  const hasToken = !!action.payload.tokens?.accessToken;
  state.isAuthenticated = Boolean(hasToken);
  state.error = null;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.tokenUser = null;
      });

    // Logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.tokenUser = null;
        state.tokens = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Load stored auth
    builder
      .addCase(loadStoredAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadStoredAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.tokens = action.payload.tokens;
          state.tokenUser = action.payload.tokenUser;
          state.isAuthenticated = true;
        }
      })
      .addCase(loadStoredAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.tokenUser = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, updateUser, setLoading, setTokenUser } =
  authSlice.actions;

export const selectTokenUser = (state: { auth: AuthState }) =>
  state.auth.tokenUser;
export const selectUserEmail = (state: { auth: AuthState }) =>
  state.auth.tokenUser?.email;
export const selectUserRole = (state: { auth: AuthState }) =>
  state.auth.tokenUser?.role;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) =>
  state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;

export default authSlice.reducer;
