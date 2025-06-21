// src/app/api/auth/delete-user-data/route.ts
// This API route handles the secure deletion of a user's data from Firestore.
// It's a critical, protected endpoint in the account deletion process.

import { type NextRequest, NextResponse } from 'next/server';
import { firebaseAdminAuth, firebaseAdminFirestore } from '@/lib/firebase/admin-config';
import { ApiErrors } from '@/lib/constants/messages';

/**
 * DELETE handler for removing a user's data from Firestore.
 * This is the first step in account deletion, performed before deleting the user from Firebase Auth.
 * It ensures no orphaned data remains in the database.
 *
 * @param {NextRequest} request - The incoming NextRequest object, containing the session cookie.
 * @returns {NextResponse} A NextResponse object indicating success or failure of the data deletion.
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

    // To delete the username-to-email mapping, we must first retrieve the username
    // from the user's profile document in Firestore.
    const userProfileRef = db.collection('users').doc(uid);
    const userProfileSnap = await userProfileRef.get();
    
    if (!userProfileSnap.exists) {
      // If the user profile document doesn't exist, it's not a critical error.
      // It might mean the user's sign-up was incomplete. Log it and proceed.
      console.warn(`User profile for UID ${uid} not found during data deletion. Proceeding to delete Auth record.`);
      return NextResponse.json({ status: 'success', message: 'User profile not found in database; nothing to delete.' }, { status: 200 });
    }

    const userData = userProfileSnap.data();
    const username = userData?.username;

    // Use a Firestore write batch to perform multiple deletions atomically.
    const batch = db.batch();

    // 1. Queue deletion of the main user profile document from the 'users' collection.
    batch.delete(userProfileRef);

    // 2. If a username exists, queue deletion of the corresponding document from the 'usernames' collection.
    if (username && typeof username === 'string') {
      const usernameDocRef = db.collection('usernames').doc(username.toLowerCase());
      batch.delete(usernameDocRef);
    } else {
        // Log if a username was expected but not found.
        console.warn(`Username not found in profile for UID ${uid} during data deletion.`);
    }

    // Atomically commit all queued deletions.
    await batch.commit();

    return NextResponse.json({ status: 'success', message: 'User data deleted successfully from database.' }, { status: 200 });

  } catch (error: any) {
    console.error('Error deleting user data from Firestore:', error);
    let errorMessage = ApiErrors.deleteUserDataFailed;
    let statusCode = 500;

    // Provide more specific error messages for common authentication issues.
    if (error.code === 'auth/session-cookie-revoked' || error.code === 'auth/invalid-session-cookie') {
        errorMessage = 'Unauthorized: Invalid session. Please sign in again to complete this action.';
        statusCode = 401;
    } else if (error.message.includes("Firebase Admin SDK not initialized")) {
        errorMessage = 'Internal server error: Service configuration issue.';
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
