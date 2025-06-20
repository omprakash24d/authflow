
import admin from 'firebase-admin';

const hasInitialized = admin.apps.length > 0;

if (!hasInitialized) {
  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  
  let credential;
  if (serviceAccountPath) {
    credential = admin.credential.cert(serviceAccountPath);
  } else if (
    process.env.FIREBASE_ADMIN_PROJECT_ID &&
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
    process.env.FIREBASE_ADMIN_PRIVATE_KEY
  ) {
    credential = admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
    });
  } else {
    console.error('Firebase Admin SDK credentials are not configured. Set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_ADMIN_* env variables.');
    // Depending on your error handling, you might throw here or let subsequent calls fail.
  }

  if (credential) {
    admin.initializeApp({
      credential,
    });
  }
}

export const firebaseAdminAuth = admin.auth;
export const firebaseAdminFirestore = admin.firestore; // If you use Firestore with Admin SDK
export default admin;
