
'use client';

import { EmailAuthProvider, reauthenticateWithCredential, type User as FirebaseUser } from 'firebase/auth';

/**
 * Re-authenticates the current user with their current password.
 * @param currentUser The currently authenticated Firebase user.
 * @param currentPassword The user's current password.
 * @returns A Promise that resolves on successful re-authentication.
 * @throws An error if re-authentication fails or if the user/email is not available.
 */
export async function reauthenticateCurrentUser(
  currentUser: FirebaseUser,
  currentPassword: string
): Promise<void> {
  if (!currentUser || !currentUser.email) {
    throw new Error('User not found or current email is missing for re-authentication.');
  }

  const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
  await reauthenticateWithCredential(currentUser, credential);
}
