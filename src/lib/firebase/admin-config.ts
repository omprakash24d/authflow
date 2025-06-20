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
//    - FIREBASE_ADMIN_PROJECT_ID: Your Firebase project ID.
//    - FIREBASE_ADMIN_CLIENT_EMAIL: The client email from your service account key.
//    - FIREBASE_ADMIN_PRIVATE_KEY: The private key from your service account key.
//      IMPORTANT: If setting FIREBASE_ADMIN_PRIVATE_KEY directly in an .env file,
//      ensure all newline characters (\n) within the key are escaped as \\n.

import admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';

// Check if Firebase Admin SDK has already been initialized to prevent re-initialization.
if (!admin.apps.length) {
  let credential;
  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (serviceAccountPath) {
    try {
      // The SDK will automatically load the service account file if the path is correct.
      credential = admin.credential.cert(serviceAccountPath);
      console.log('Firebase Admin SDK: Attempting to initialize with GOOGLE_APPLICATION_CREDENTIALS.');
    } catch (e: any) {
      console.error(
        'Firebase Admin SDK: Failed to load credentials from GOOGLE_APPLICATION_CREDENTIALS path:',
        serviceAccountPath, e.message
      );
    }
  } else if (
    process.env.FIREBASE_ADMIN_PROJECT_ID &&
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
    process.env.FIREBASE_ADMIN_PRIVATE_KEY
  ) {
    try {
      // Reconstruct the private key, unescaping newlines.
      const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(
        /\\n/g,
        '\n'
      );
      const serviceAccount: ServiceAccount = {
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: privateKey,
      };
      credential = admin.credential.cert(serviceAccount);
      console.log('Firebase Admin SDK: Attempting to initialize with FIREBASE_ADMIN_* environment variables.');
    } catch (e: any) {
      console.error(
        'Firebase Admin SDK: Failed to load credentials from FIREBASE_ADMIN_* environment variables:',
        e.message
      );
    }
  }

  if (credential) {
    try {
      admin.initializeApp({
        credential,
      });
      console.log('Firebase Admin SDK initialized successfully.');
    } catch (e: any) {
      console.error('Firebase Admin SDK: Error initializing app:', e.message);
    }
  } else {
    console.error(
      'Firebase Admin SDK: NOT initialized. Credentials missing or invalid. Ensure GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_ADMIN_* env variables are set correctly for server-side operations.'
    );
  }
}

// Export functions to get initialized services, throwing an error if not initialized.
export const firebaseAdminAuth = () => {
  if (!admin.apps.length || !admin.apps[0]) { // Check if primary app exists
    console.error('Firebase Admin SDK is not initialized. firebaseAdminAuth() will fail.');
    throw new Error('Firebase Admin SDK not initialized. Cannot access Auth service.');
  }
  return admin.auth();
};

export const firebaseAdminFirestore = () => {
  if (!admin.apps.length || !admin.apps[0]) { // Check if primary app exists
    console.error('Firebase Admin SDK is not initialized. firebaseAdminFirestore() will fail.');
    throw new Error('Firebase Admin SDK not initialized. Cannot access Firestore service.');
  }
  return admin.firestore();
};

export default admin;
