
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore'; // Uncommented

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let firebaseApp: FirebaseApp;

// Check if all required config values are present
const requiredConfigKeys: (keyof typeof firebaseConfig)[] = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
];

const missingKeys = requiredConfigKeys.filter(key => !firebaseConfig[key]);

if (missingKeys.length > 0) {
  console.error(`Firebase config is missing or incomplete. Missing keys: ${missingKeys.join(', ')}. Please check your .env file.`);
}


if (!getApps().length) {
  if (missingKeys.length === 0) { // Only initialize if config is not missing
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    console.warn("Firebase app initialization skipped due to missing configuration.");
    // @ts-ignore
    firebaseApp = null; 
  }
} else {
  firebaseApp = getApps()[0];
}

// @ts-ignore
const auth: Auth = firebaseApp ? getAuth(firebaseApp) : null;
// @ts-ignore
const firestore: Firestore = firebaseApp ? getFirestore(firebaseApp) : null; // Initialize Firestore

export { firebaseApp, auth, firestore }; // Export firestore
