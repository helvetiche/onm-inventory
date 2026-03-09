"use client";

import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { env } from "@/lib/env";

const firebaseClientConfig = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
} as const;

let firebaseClientApp: FirebaseApp | undefined;

const getFirebaseClientApp = (): FirebaseApp => {
  if (firebaseClientApp) {
    return firebaseClientApp;
  }

  if (getApps().length > 0) {
    firebaseClientApp = getApp();

    return firebaseClientApp;
  }

  firebaseClientApp = initializeApp(firebaseClientConfig);

  return firebaseClientApp;
};

const clientApp = getFirebaseClientApp();

export const clientAuth: Auth = getAuth(clientApp);
export const clientDb: Firestore = getFirestore(clientApp);
