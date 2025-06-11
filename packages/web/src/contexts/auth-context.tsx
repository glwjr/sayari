"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { apiClient } from "@/lib/api-client";
import {
  AuthAction,
  AuthContextType,
  AuthState,
  LoginCredentials,
  RegisterData,
} from "@/types/auth";
import { User } from "@/types/user";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "AUTH_START":
      return { ...state, loading: true, error: null };
    case "AUTH_SUCCESS":
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
      };
    case "AUTH_ERROR":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: action.payload,
      };
    case "LOGOUT":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null,
      };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    isAuthenticated: false,
    user: null,
    token: null,
    loading: true,
    error: null,
  });

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("access_token");
      if (token) {
        try {
          const user = await apiClient.get<User>("/auth/validate");
          dispatch({
            type: "AUTH_SUCCESS",
            payload: { user, token },
          });
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          localStorage.removeItem("access_token");
          dispatch({ type: "AUTH_ERROR", payload: "Session expired" });
        }
      } else {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    dispatch({ type: "AUTH_START" });

    try {
      const response = await apiClient.post<{
        access_token: string;
        user: User;
      }>("/auth/login", credentials);

      localStorage.setItem("access_token", response.access_token);
      dispatch({
        type: "AUTH_SUCCESS",
        payload: {
          user: response.user,
          token: response.access_token,
        },
      });

      return { success: true };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const errorMessage = error.message || "Login failed";
      dispatch({ type: "AUTH_ERROR", payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData: RegisterData) => {
    dispatch({ type: "AUTH_START" });

    try {
      const response = await apiClient.post<{
        access_token: string;
        user: User;
      }>("/auth/register", userData);

      localStorage.setItem("access_token", response.access_token);
      dispatch({
        type: "AUTH_SUCCESS",
        payload: {
          user: response.user,
          token: response.access_token,
        },
      });

      return { success: true };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const errorMessage = error.message || "Registration failed";
      dispatch({ type: "AUTH_ERROR", payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    dispatch({ type: "LOGOUT" });
  };

  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  const refreshUser = async () => {
    try {
      const user = await apiClient.get<User>("/users/profile");
      if (state.token) {
        dispatch({
          type: "AUTH_SUCCESS",
          payload: { user, token: state.token },
        });
      }
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        clearError,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
