// src/app/api/auth/session-logout/route.ts
// This API route handles user logout by clearing the session cookie.
// While client-side Firebase sign-out clears client state, this ensures
// the server-side session (HTTP-only cookie) is also invalidated.

import { type NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebase/admin-config'; // Firebase Admin SDK (though not strictly needed for simple cookie clearing)

/**
 * POST handler for logging out a user by clearing their session cookie.
 * @param request The incoming NextRequest object.
 * @returns A NextResponse object, clearing the session cookie.
 */
export async function POST(request: NextRequest) {
  // Get the session cookie name (consistent with session-login route).
  const sessionCookieName = 'firebaseIdToken';
  const sessionCookieValue: string | undefined = request.cookies.get(sessionCookieName)?.value;

  // Optional: If active server-side revocation of all user sessions is needed,
  // you would typically verify the session cookie here and then use
  // admin.auth().revokeRefreshTokens(decodedClaims.sub);
  // This is a more involved process and depends on specific security requirements.
  // For simple logout (clearing this session's cookie), direct verification is not always essential
  // as we are just expiring the cookie.
  if (sessionCookieValue) {
    try {
      // Example: If you wanted to decode and revoke:
      // const decodedClaims = await admin.auth().verifySessionCookie(sessionCookieValue);
      // await admin.auth().revokeRefreshTokens(decodedClaims.sub);
      // console.log(`Revoked refresh tokens for user: ${decodedClaims.sub}`);
    } catch (error) {
      // Log if there's an issue during optional server-side revocation steps.
      console.warn('Error during optional session cookie operations on logout (continuing to clear cookie):', error);
    }
  }

  // Create a success response.
  const response = NextResponse.json({ status: 'success', message: 'Logged out successfully.' }, { status: 200 });
  
  // Set the cookie with an immediate expiration date to effectively clear it.
  response.cookies.set({
    name: sessionCookieName,
    value: '', // Set value to empty
    maxAge: 0, // Expire immediately (maxAge is in seconds)
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Match settings from session-login
    path: '/',
    sameSite: 'lax',
  });
  return response;
}
