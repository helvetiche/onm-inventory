import "server-only";

import {
  cert,
  getApp,
  getApps,
  initializeApp,
  type App,
} from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { env } from "@/lib/env";

let cachedAdminApp: App | null = null;

export const getFirebaseAdminApp = (): App => {
  if (cachedAdminApp) {
    return cachedAdminApp;
  }

  if (getApps().length > 0) {
    cachedAdminApp = getApp();

    return cachedAdminApp;
  }

  const app = initializeApp({
    credential: cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });

  cachedAdminApp = app;

  return app;
};

export const getAdminAuth = (): Auth => getAuth(getFirebaseAdminApp());

export const getAdminDb = (): Firestore => getFirestore(getFirebaseAdminApp());
