"use client";

import type { JSX, ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { clientAuth } from "@/lib/firebase/client";
import {
  firebaseUserToAuthUser,
  type AuthUser,
} from "@/lib/auth/types";

type AuthState = {
  user: AuthUser | null;
  isLoading: boolean;
};

type AuthContextValue = AuthState & {
  refetch: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({
  children,
}: AuthProviderProps): JSX.Element => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleAuthChange = useCallback((firebaseUser: User | null): void => {
    setUser(firebaseUser ? firebaseUserToAuthUser(firebaseUser) : null);
    setIsLoading(false);
  }, []);

  const refetch = useCallback((): void => {
    const currentUser = clientAuth.currentUser;

    handleAuthChange(currentUser);
  }, [handleAuthChange]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(clientAuth, handleAuthChange);

    return () => {
      unsubscribe();
    };
  }, [handleAuthChange]);

  const value: AuthContextValue = {
    user,
    isLoading,
    refetch,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }

  return context;
};
