// src/lib/firebase/admin-config.ts
// This file initializes the Firebase Admin SDK for server-side usage (e.g., in API routes or middleware).
// It requires administrative credentials, which should be kept secure and NOT exposed to the client-side.
//
// Configuration Options (set in .env.local or your server environment):
// 1. GOOGLE_APPLICATION_CREDENTIALS (Recommended for deployed environments):
//    - Set this environment variable to the absolute path of your Firebase service account key JSON file.
//    - Download this file from: Firebase Console > Project settings > Service accounts > Generate new private key.
//
// 2. Individual FIREBASE_ADMIN_* Environment Variables (Can be used for local development):
//    - FIREBASE_ADMIN_PROJECT_ID: Your Firebase project ID (from service account JSON).
//    - FIREBASE_ADMIN_CLIENT_EMAIL: The client email from your service account key.
//    - FIREBASE_ADMIN_PRIVATE_KEY: The private key from your service account key.
//      IMPORTANT: If setting FIREBASE_ADMIN_PRIVATE_KEY directly in an .env file,
//      ensure all newline characters (\n) within the key are escaped as \\n.

import admin from 'firebase-admin'; // Firebase Admin SDK
import type { ServiceAccount } from 'firebase-admin'; // Type for service account credentials

// Check if Firebase Admin SDK has already been initialized to prevent re-initialization error.
if (!admin.apps.length) {
  let credential; // Holds the credential object for initialization
  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (serviceAccountPath) {
    // Option 1: Using GOOGLE_APPLICATION_CREDENTIALS environment variable (path to JSON file)
    try {
      credential = admin.credential.cert(serviceAccountPath);
      console.log('Firebase Admin SDK: Attempting to initialize with GOOGLE_APPLICATION_CREDENTIALS.');
    } catch (e: any) {
      console.error(
        'Firebase Admin SDK: Failed to load credentials from GOOGLE_APPLICATION_CREDENTIALS path:',
        serviceAccountPath, 'Error:', e.message
      );
      // It's crucial to understand why this failed. Often due to incorrect path or file format.
    }
  } else if (
    // Option 2: Using individual environment variables for project ID, client email, and private key
    process.env.FIREBASE_ADMIN_PROJECT_ID &&
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
    process.env.FIREBASE_ADMIN_PRIVATE_KEY
  ) {
    try {
      // Reconstruct the private key, unescaping newlines if they were escaped for .env storage.
      const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(
        /\\n/g, // Replace literal '\\n' with actual newline character '\n'
        '\n'
      );
      // Construct the service account object from environment variables.
      const serviceAccount: ServiceAccount = {
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: privateKey,
      };
      credential = admin.credential.cert(serviceAccount);
      console.log('Firebase Admin SDK: Attempting to initialize with FIREBASE_ADMIN_* environment variables.');
    } catch (e: any) {
      console.error(
        'Firebase Admin SDK: Failed to load credentials from FIREBASE_ADMIN_* environment variables. Check if variables are set and private key format is correct (newlines escaped as \\n). Error:',
        e.message
      );
    }
  }

  // If a credential object was successfully created, initialize the Firebase Admin app.
  if (credential) {
    try {
      admin.initializeApp({
        credential,
        // databaseURL: `https://${process.env.FIREBASE_ADMIN_PROJECT_ID}.firebaseio.com` // Optional: if using Realtime Database
      });
      console.log('Firebase Admin SDK initialized successfully.');
    } catch (e: any) {
      console.error('Firebase Admin SDK: Error initializing app with credential:', e.message);
      // This usually means the credential object was malformed or there's a conflict.
    }
  } else {
    // If no credential could be created, log a critical error.
    // Server-side Firebase operations will fail.
    console.error(
      'Firebase Admin SDK: NOT initialized. Credentials missing or invalid. Ensure GOOGLE_APPLICATION_CREDENTIALS or all FIREBASE_ADMIN_* environment variables are set correctly for server-side operations.'
    );
  }
}

// Export functions to get initialized Firebase Admin services (Auth, Firestore).
// These functions throw an error if the Admin SDK is not initialized, preventing runtime issues elsewhere.

/**
 * Returns the Firebase Admin Auth service.
 * @throws Error if Firebase Admin SDK is not initialized.
 * @returns {admin.auth.Auth} The Firebase Admin Auth service.
 */
export const firebaseAdminAuth = (): admin.auth.Auth => {
  if (!admin.apps.length || !admin.apps[0]) { // Check if the primary app instance exists
    console.error('Firebase Admin SDK is not initialized. firebaseAdminAuth() will fail.');
    throw new Error('Firebase Admin SDK not initialized. Cannot access Admin Auth service.');
  }
  return admin.auth();
};

/**
 * Returns the Firebase Admin Firestore service.
 * @throws Error if Firebase Admin SDK is not initialized.
 * @returns {admin.firestore.Firestore} The Firebase Admin Firestore service.
 */
export const firebaseAdminFirestore = (): admin.firestore.Firestore => {
  if (!admin.apps.length || !admin.apps[0]) { // Check if the primary app instance exists
    console.error('Firebase Admin SDK is not initialized. firebaseAdminFirestore() will fail.');
    throw new Error('Firebase Admin SDK not initialized. Cannot access Admin Firestore service.');
  }
  return admin.firestore();
};

// Export the default admin namespace for convenience, though direct use of the above functions is preferred for clarity.
export default admin;
