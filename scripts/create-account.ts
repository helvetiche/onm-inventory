#!/usr/bin/env tsx

import "dotenv/config"; // This loads the .env file
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

async function createAccount() {
  try {
    console.log("🔧 Initializing Firebase Admin...");
    
    // Check environment variables
    if (!process.env.FIREBASE_PROJECT_ID) {
      throw new Error("FIREBASE_PROJECT_ID environment variable is missing");
    }
    if (!process.env.FIREBASE_CLIENT_EMAIL) {
      throw new Error("FIREBASE_CLIENT_EMAIL environment variable is missing");
    }
    if (!process.env.FIREBASE_PRIVATE_KEY) {
      throw new Error("FIREBASE_PRIVATE_KEY environment variable is missing");
    }

    console.log(`📋 Project ID: ${process.env.FIREBASE_PROJECT_ID}`);
    console.log(`📧 Client Email: ${process.env.FIREBASE_CLIENT_EMAIL}`);

    // Initialize Firebase Admin directly (without server-only module)
    if (getApps().length === 0) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        }),
      });
    }

    const auth = getAuth();

    const email = "helvetiche@gmail.com";
    const password = "Nasche2004";

    console.log("👤 Creating user account...");

    // Create the user
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      emailVerified: true, // Set as verified so they can login immediately
      displayName: "Admin User",
    });

    console.log("✅ Successfully created user account:");
    console.log(`   Email: ${userRecord.email}`);
    console.log(`   UID: ${userRecord.uid}`);
    console.log(`   Display Name: ${userRecord.displayName}`);
    console.log(`   Email Verified: ${userRecord.emailVerified}`);
    console.log("");
    console.log("🎉 You can now login with these credentials!");

  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("email-already-exists")) {
        console.log("⚠️  User account already exists with this email.");
        console.log("   You can login with the existing credentials:");
        console.log("   Email: helvetiche@gmail.com");
        console.log("   Password: Nasche2004");
      } else {
        console.error("❌ Error creating user account:", error.message);
        console.error("Full error:", error);
      }
    } else {
      console.error("❌ Unknown error:", error);
    }
  }
}

// Run the script
createAccount().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error("Script failed:", error);
  process.exit(1);
});