"use client";

import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type UserCredential,
} from "firebase/auth";
import { useCallback, useState } from "react";
import { clientAuth } from "@/lib/firebase/client";
import { useAuthContext } from "@/lib/auth/AuthProvider";

type AuthErrorCode =
  | "auth/email-already-in-use"
  | "auth/invalid-email"
  | "auth/weak-password"
  | "auth/invalid-credential"
  | "auth/user-not-found"
  | "auth/wrong-password"
  | "auth/invalid-credential"
  | "auth/too-many-requests"
  | string;

const normalizeAuthError = (code: AuthErrorCode): string => {
  const map: Record<string, string> = {
    "auth/email-already-in-use": "Email is already in use",
    "auth/invalid-email": "Invalid email address",
    "auth/weak-password": "Password should be at least 6 characters",
    "auth/invalid-credential": "Invalid email or password",
    "auth/user-not-found": "No account found for this email",
    "auth/wrong-password": "Invalid email or password",
    "auth/too-many-requests": "Too many attempts. Try again later",
  };

  return map[code] ?? "An error occurred. Please try again.";
};

export const useAuth = (): ReturnType<typeof useAuthContext> => useAuthContext();

export const useSignUp = (): {
  signUp: (email: string, password: string) => Promise<UserCredential | null>;
  isLoading: boolean;
  error: string | null;
} => {
  const { refetch } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signUp = useCallback(
    async (
      email: string,
      password: string
    ): Promise<UserCredential | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const cred = await createUserWithEmailAndPassword(
          clientAuth,
          email,
          password
        );

        await refetch();

        return cred;
      } catch (err) {
        const code = (err as { code?: AuthErrorCode })?.code ?? "unknown";

        setError(normalizeAuthError(code));

        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [refetch]
  );

  return { signUp, isLoading, error };
};

export const useSignIn = (): {
  signIn: (email: string, password: string) => Promise<UserCredential | null>;
  isLoading: boolean;
  error: string | null;
} => {
  const { refetch } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = useCallback(
    async (
      email: string,
      password: string
    ): Promise<UserCredential | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const cred = await signInWithEmailAndPassword(
          clientAuth,
          email,
          password
        );

        await refetch();

        return cred;
      } catch (err) {
        const code = (err as { code?: AuthErrorCode })?.code ?? "unknown";

        setError(normalizeAuthError(code));

        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [refetch]
  );

  return { signIn, isLoading, error };
};

export const useSignOut = (): {
  signOut: () => Promise<void>;
  isLoading: boolean;
} => {
  const { refetch } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);

  const signOutFn = useCallback(async (): Promise<void> => {
    setIsLoading(true);

    try {
      await signOut(clientAuth);
      await refetch();
    } finally {
      setIsLoading(false);
    }
  }, [refetch]);

  return { signOut: signOutFn, isLoading };
};

export const useResetPassword = (): {
  resetPassword: (email: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  success: boolean;
} => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const resetPassword = useCallback(async (email: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await sendPasswordResetEmail(clientAuth, email);
      setSuccess(true);
    } catch (err) {
      const code = (err as { code?: AuthErrorCode })?.code ?? "unknown";

      setError(normalizeAuthError(code));
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { resetPassword, isLoading, error, success };
};
