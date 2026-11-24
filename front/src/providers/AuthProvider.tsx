"use client";

import { createContext, useContext, type ReactNode } from "react";

import { useAuthViewModel, type AuthViewModel } from "@/viewmodels/auth/useAuthViewModel";

const AuthContext = createContext<AuthViewModel | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const authViewModel = useAuthViewModel();

  return <AuthContext.Provider value={authViewModel}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthViewModel => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth는 AuthProvider 내부에서 사용해야 합니다.");
  }

  return context;
};
