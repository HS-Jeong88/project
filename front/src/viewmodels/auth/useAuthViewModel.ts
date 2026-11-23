"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
} from "@/models/auth/auth.model";

import type { AuthUser, LoginInput, RegisterInput } from "@/models/auth/auth.types";

import { clearAccessToken, setAccessToken } from "@/lib/api/apiClient";

export function useAuthViewModel() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const initialized = useRef(false);

  const refreshSession = useCallback(async () => {
    try {
      const token = await refreshAccessToken();

      setAccessToken(token);

      const currentUser = await getCurrentUser();

      setUser(currentUser);

      return currentUser;
    } catch {
      clearAccessToken();
      setUser(null);

      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialized.current) {
      return;
    }

    initialized.current = true;

    void refreshSession();
  }, [refreshSession]);

  const login = useCallback(async (input: LoginInput) => {
    const result = await loginUser(input);

    setAccessToken(result.accessToken);

    const currentUser = result.user ?? (await getCurrentUser());

    setUser(currentUser);

    return currentUser;
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    await registerUser(input);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } finally {
      clearAccessToken();
      setUser(null);
    }
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: user !== null,
    login,
    register,
    logout,
    refreshSession,
  };
}

export type AuthViewModel = ReturnType<typeof useAuthViewModel>;
