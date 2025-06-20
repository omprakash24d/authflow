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
// - NEXT_PUBLIC_FIREBASE_APP_ID: Needed for some advanced Firebase integrations or analytics.

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'; // Core Firebase app SDK
import { getAuth, type Auth } from 'firebase/auth'; // Firebase Authentication SDK
import { getFirestore, type Firestore } from 'firebase/firestore'; // Firebase Firestore SDK

// Structure for Firebase configuration, populated from environment variables.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check for essential Firebase configuration keys required for the app to function.
// These are typically apiKey, authDomain, and projectId.
const requiredConfigKeys: (keyof typeof firebaseConfig)[] = [
  'apiKey',
  'authDomain',
  'projectId',
];

// Identify any missing essential configuration keys.
const missingKeys = requiredConfigKeys.filter(key => !firebaseConfig[key]);

let firebaseAppInstance: FirebaseApp | null = null; // To hold the initialized Firebase app instance

if (missingKeys.length === 0) {
  // All required keys are present. Proceed with initialization.
  // Initialize Firebase only if it hasn't been initialized yet (to prevent re-initialization error).
  if (!getApps().length) { // `getApps()` returns an array of initialized Firebase apps.
    try {
      firebaseAppInstance = initializeApp(firebaseConfig);
      console.log("Firebase app initialized successfully (client-side).");
    } catch (e: any) {
      // Log critical error if initialization fails despite having config.
      console.error("CRITICAL: Firebase app initialization failed (client-side):", e.message, "Config used:", firebaseConfig);
      firebaseAppInstance = null; // Ensure it's null on error
    }
  } else {
    // If Firebase app is already initialized (e.g., due to HMR or multiple imports),
    // use the existing app instance.
    firebaseAppInstance = getApps()[0];
  }
} else {
  // If essential configuration keys are missing, log a critical error and skip initialization.
  // Firebase client services will be unavailable.
  console.error(`CRITICAL: Firebase app initialization skipped due to missing essential configuration: ${missingKeys.join(', ')}. Check your NEXT_PUBLIC_FIREBASE_* environment variables. Firebase client services will be unavailable.`);
  firebaseAppInstance = null; // Ensure it's null if config is missing
}

// Export the Firebase app instance and specific service instances (Auth, Firestore).
// These can be `null` if initialization failed or was skipped.
export const firebaseApp: FirebaseApp | null = firebaseAppInstance;
export const auth: Auth | null = firebaseAppInstance ? getAuth(firebaseAppInstance) : null;
export const firestore: Firestore | null = firebaseAppInstance ? getFirestore(firebaseAppInstance) : null;
// Example for Firebase Storage (if used):
// import { getStorage, type FirebaseStorage } from 'firebase/storage';
// export const storage: FirebaseStorage | null = firebaseAppInstance ? getStorage(firebaseAppInstance) : null;

// Log the status of services for easier debugging during setup.
// This helps quickly identify if a service is unavailable due to configuration issues.
if (!firebaseApp) {
  console.warn("Firebase App instance (firebaseApp) is not available (client-side). Check your NEXT_PUBLIC_FIREBASE_* environment variables and any console errors above.");
}
if (!auth) {
  console.warn("Firebase Auth instance (auth) is not available (client-side). Ensure Firebase App initialized correctly.");
}
if (!firestore) {
  console.warn("Firebase Firestore instance (firestore) is not available (client-side). Ensure Firebase App initialized correctly.");
}
// if (!storage) { // Example for storage
//   console.warn("Firebase Storage instance (storage) is not available (client-side). Ensure Firebase App initialized correctly and NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is set if needed.");
// }
