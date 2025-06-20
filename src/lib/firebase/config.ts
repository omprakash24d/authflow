// src/lib/firebase/config.ts
// This file initializes the Firebase JavaScript SDK for client-side usage.
// It reads configuration from environment variables prefixed with NEXT_PUBLIC_FIREBASE_.
// These variables should be set in your .env.local file (or other .env files).
//
// Required Environment Variables:
// - NEXT_PUBLIC_FIREBASE_API_KEY: Your Firebase project's API key.
// - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: Your Firebase project's auth domain (e.g., your-project-id.firebaseapp.com).
// - NEXT_PUBLIC_FIREBASE_PROJECT_ID: Your Firebase project's ID.
//
// Optional Environment Variables (needed for specific services):
// - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: Needed if using Firebase Storage (e.g., for profile photos).
// - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: Needed if using Firebase Cloud Messaging.
// - NEXT_PUBLIC_FIREBASE_APP_ID: Needed for some advanced Firebase integrations.

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check for essential Firebase configuration keys required for the app to function.
const requiredConfigKeys: (keyof typeof firebaseConfig)[] = [
  'apiKey',
  'authDomain',
  'projectId',
];

const missingKeys = requiredConfigKeys.filter(key => !firebaseConfig[key]);

let firebaseAppInstance: FirebaseApp | null = null;

if (missingKeys.length === 0) {
  // Initialize Firebase only if it hasn't been initialized yet.
  if (!getApps().length) {
    try {
      firebaseAppInstance = initializeApp(firebaseConfig);
      console.log("Firebase app initialized successfully (client-side).");
    } catch (e: any) {
      console.error("CRITICAL: Firebase app initialization failed (client-side):", e.message, "Config used:", firebaseConfig);
      firebaseAppInstance = null; // Ensure it's null on error
    }
  } else {
    // Use the existing app instance if already initialized.
    firebaseAppInstance = getApps()[0];
  }
} else {
  console.error(`CRITICAL: Firebase app initialization skipped due to missing essential configuration: ${missingKeys.join(', ')}. Firebase client services will be unavailable.`);
  firebaseAppInstance = null; // Ensure it's null if config is missing
}

export const firebaseApp: FirebaseApp | null = firebaseAppInstance;
export const auth: Auth | null = firebaseAppInstance ? getAuth(firebaseAppInstance) : null;
export const firestore: Firestore | null = firebaseAppInstance ? getFirestore(firebaseAppInstance) : null;

// Log the status of services for easier debugging during setup.
if (!firebaseApp) {
  console.warn("Firebase App instance is not available (client-side). Check your NEXT_PUBLIC_FIREBASE_* environment variables.");
}
if (!auth) {
  console.warn("Firebase Auth instance is not available (client-side). Ensure Firebase App initialized correctly.");
}
if (!firestore) {
  console.warn("Firebase Firestore instance is not available (client-side). Ensure Firebase App initialized correctly.");
}
