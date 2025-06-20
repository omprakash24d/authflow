// src/lib/firebase/auth-utils.ts
// This file contains utility functions related to Firebase Authentication,
// particularly for client-side operations that might be reused across components.

'use client'; // These utilities are intended for client-side use.

import { EmailAuthProvider, reauthenticateWithCredential, type User as FirebaseUser } from 'firebase/auth';

/**
 * Re-authenticates the current Firebase user with their current password.
 * This is often required by Firebase for sensitive operations like changing email,
 * changing password, or deleting an account.
 *
 * @param {FirebaseUser} currentUser - The currently authenticated Firebase user object.
 *                                    This should be obtained from `auth.currentUser` or `useAuth` hook.
 * @param {string} currentPassword - The user's current password, as entered by them.
 * @returns {Promise<void>} A Promise that resolves on successful re-authentication.
 * @throws An error if re-authentication fails (e.g., wrong password, user not found)
 *         or if the `currentUser` object or their email is not available.
 */
export async function reauthenticateCurrentUser(
  currentUser: FirebaseUser,
  currentPassword: string
): Promise<void> {
  // Guard clause: Ensure currentUser and their email are available.
  // The email is needed to create the EmailAuthCredential.
  if (!currentUser || !currentUser.email) {
    console.error("Re-authentication failed: Current user or user's email is not available.", { currentUser });
    throw new Error('User not found or current email is missing for re-authentication. Please sign in again.');
  }

  // Create an EmailAuthCredential using the user's email and the provided current password.
  const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
  
  // Attempt to re-authenticate the user with the created credential.
  // If successful, Firebase updates its internal state for the user's session,
  // allowing subsequent sensitive operations to proceed for a short period.
  // If it fails (e.g., wrong password), it will throw an error.
  await reauthenticateWithCredential(currentUser, credential);
}
