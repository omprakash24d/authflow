// src/app/api/auth/delete-user-data/route.ts
// This API route handles the deletion of a user's data from Firestore.
// It's a critical part of the account deletion process to ensure no orphaned data remains.

import { type NextRequest, NextResponse } from 'next/server';
import admin, { firebaseAdminAuth, firebaseAdminFirestore } from '@/lib/firebase/admin-config';

/**
 * DELETE handler for removing user data from Firestore.
 * This should be called before deleting the user from Firebase Authentication.
 * @param request The incoming NextRequest object.
 * @returns A NextResponse object indicating success or failure.
 */
export async function DELETE(request: NextRequest) {
  const sessionCookie = request.cookies.get('firebaseIdToken')?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized: No session cookie provided.' }, { status: 401 });
  }

  try {
    const auth = firebaseAdminAuth();
    const db = firebaseAdminFirestore();

    // Verify the session cookie to securely get the user's UID.
    const decodedToken = await auth.verifySessionCookie(sessionCookie, true);
    const uid = decodedToken.uid;

    // We need the user's username to delete their document from the 'usernames' collection.
    // It's safer to fetch this from the database record rather than trusting a client-sent value.
    const userProfileRef = db.collection('users').doc(uid);
    const userProfileSnap = await userProfileRef.get();
    
    if (!userProfileSnap.exists) {
      // If the user profile doc doesn't exist, there's nothing to delete in 'users',
      // but we might still have a record in 'usernames' from an incomplete signup.
      // We can't find the username, so we log it and proceed. The Auth deletion will still work.
      console.warn(`User profile for UID ${uid} not found during data deletion. The user may not have a username record.`);
       return NextResponse.json({ status: 'success', message: 'User profile not found, nothing to delete.' }, { status: 200 });
    }

    const userData = userProfileSnap.data();
    const username = userData?.username;

    // Use a batch to perform atomic deletions.
    const batch = db.batch();

    // 1. Delete the main user profile document from the 'users' collection.
    batch.delete(userProfileRef);

    // 2. If a username exists, delete the corresponding document from the 'usernames' collection.
    if (username && typeof username === 'string') {
      const usernameDocRef = db.collection('usernames').doc(username.toLowerCase());
      batch.delete(usernameDocRef);
    } else {
        console.warn(`Username not found in profile for UID ${uid} during data deletion.`);
    }

    // Commit the batch.
    await batch.commit();

    return NextResponse.json({ status: 'success', message: 'User data deleted successfully from database.' }, { status: 200 });

  } catch (error: any) {
    console.error('Error deleting user data from Firestore:', error);
    let errorMessage = 'Internal server error while deleting user data.';
    let statusCode = 500;

    if (error.code === 'auth/session-cookie-revoked' || error.code === 'auth/invalid-session-cookie') {
        errorMessage = 'Unauthorized: Invalid session. Please sign in again.';
        statusCode = 401;
    } else if (error.message.includes("Firebase Admin SDK not initialized")) {
        errorMessage = 'Internal server error: Service configuration issue.';
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
