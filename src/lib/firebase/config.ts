
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

const requiredConfigKeys: (keyof typeof firebaseConfig)[] = [
  'apiKey',
  'authDomain',
  'projectId',
]; // Reduced to essential keys for basic app functionality

const missingKeys = requiredConfigKeys.filter(key => !firebaseConfig[key]);

let firebaseAppInstance: FirebaseApp | null = null;

if (missingKeys.length === 0) {
  if (!getApps().length) {
    try {
      firebaseAppInstance = initializeApp(firebaseConfig);
      console.log("Firebase app initialized successfully.");
    } catch (e: any) {
      console.error("CRITICAL: Firebase app initialization failed:", e.message, "Config used:", firebaseConfig);
      firebaseAppInstance = null; // Ensure it's null on error
    }
  } else {
    firebaseAppInstance = getApps()[0];
  }
} else {
  console.error(`CRITICAL: Firebase app initialization skipped due to missing essential configuration: ${missingKeys.join(', ')}. Firebase services will be unavailable.`);
  firebaseAppInstance = null; // Ensure it's null if config is missing
}

export const firebaseApp: FirebaseApp | null = firebaseAppInstance;
export const auth: Auth | null = firebaseAppInstance ? getAuth(firebaseAppInstance) : null;
export const firestore: Firestore | null = firebaseAppInstance ? getFirestore(firebaseAppInstance) : null;

// Log the status of services
if (!firebaseApp) {
  console.warn("Firebase App instance is not available.");
}
if (!auth) {
  console.warn("Firebase Auth instance is not available.");
}
if (!firestore) {
  console.warn("Firebase Firestore instance is not available.");
}
