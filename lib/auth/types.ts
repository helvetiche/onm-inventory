import type { User as FirebaseUser } from "firebase/auth";

export type AuthUser = {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  displayName: string | null;
};

export const firebaseUserToAuthUser = (user: FirebaseUser): AuthUser => ({
  uid: user.uid,
  email: user.email ?? null,
  emailVerified: user.emailVerified,
  displayName: user.displayName ?? null,
});
