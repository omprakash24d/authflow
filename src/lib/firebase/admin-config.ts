
import admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';

// Check if Firebase Admin SDK has already been initialized
if (!admin.apps.length) {
  let credential;
  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (serviceAccountPath) {
    try {
      // The SDK will automatically load the service account file if the path is correct
      credential = admin.credential.cert(serviceAccountPath);
    } catch (e: any) {
      console.error(
        'Failed to load Firebase Admin SDK credentials from GOOGLE_APPLICATION_CREDENTIALS path:',
        e.message
      );
    }
  } else if (
    process.env.FIREBASE_ADMIN_PROJECT_ID &&
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
    process.env.FIREBASE_ADMIN_PRIVATE_KEY
  ) {
    try {
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
    } catch (e: any) {
      console.error(
        'Failed to load Firebase Admin SDK credentials from FIREBASE_ADMIN_* environment variables:',
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
      console.error('Error initializing Firebase Admin SDK:', e.message);
    }
  } else {
    console.error(
      'Firebase Admin SDK is NOT initialized due to missing or invalid credentials. Ensure GOOGLE_APPLICATION_CREDENTIALS or correct FIREBASE_ADMIN_* env variables are set.'
    );
    // Not throwing an error here to allow the app to potentially run parts that don't need Admin SDK,
    // but routes requiring Admin SDK will fail.
  }
}

export const firebaseAdminAuth = () => {
  if (!admin.apps.length) {
    throw new Error('Firebase Admin SDK not initialized. Call firebaseAdminAuth() after initialization.');
  }
  return admin.auth();
};

export const firebaseAdminFirestore = () => {
  if (!admin.apps.length) {
    throw new Error('Firebase Admin SDK not initialized. Call firebaseAdminFirestore() after initialization.');
  }
  return admin.firestore();
};

export default admin;
