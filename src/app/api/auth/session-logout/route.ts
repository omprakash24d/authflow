// src/app/api/auth/session-logout/route.ts
// This API route handles user logout by clearing the server-side session cookie.
// While client-side Firebase sign-out clears the client's auth state, this endpoint
// ensures the secure, HTTP-only session cookie is also invalidated.

import { type NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebase/admin-config';
import { SESSION_COOKIE_NAME } from '@/lib/constants/auth';

/**
 * POST handler for logging out a user by clearing their session cookie.
 * This effectively invalidates the user's server-side session.
 *
 * @param {NextRequest} request - The incoming NextRequest object.
 * @returns {NextResponse} A NextResponse object that clears the session cookie.
 */
export async function POST(request: NextRequest) {
  const sessionCookieValue: string | undefined = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  // For enhanced security, you can optionally revoke all active refresh tokens for the user,
  // which would sign them out of all devices. This is a more forceful logout.
  // The basic implementation here simply clears the cookie for the current session.
  if (sessionCookieValue) {
    try {
      const decodedClaims = await admin.auth().verifySessionCookie(sessionCookieValue);
      // Optional: Uncomment the following line to revoke all refresh tokens for this user.
      // This is a more forceful sign-out that invalidates sessions on all devices.
      // await admin.auth().revokeRefreshTokens(decodedClaims.sub);
      // console.log(`Successfully revoked refresh tokens for user: ${decodedClaims.sub}`);
    } catch (error) {
      // This can happen if the cookie is invalid or expired. We can ignore this
      // error and proceed to clear the cookie from the browser anyway.
      console.warn('Could not verify session cookie on logout (it may be expired or invalid). Proceeding to clear cookie.', error);
    }
  }

  // Create a success response.
  const response = NextResponse.json({ status: 'success', message: 'Logged out successfully.' }, { status: 200 });
  
  // Set the cookie with an immediate expiration date (`maxAge: 0`) to effectively delete it from the browser.
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: '', // Set value to empty string.
    maxAge: 0, // Expire immediately.
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'lax',
  });
  return response;
}
