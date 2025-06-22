// src/app/api/auth/session-logout/route.ts
// This API route handles user logout by clearing the server-side session cookie.
// While client-side Firebase sign-out clears the client's auth state, this endpoint
// ensures the secure, HTTP-only session cookie is also invalidated.

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import admin from '@/lib/firebase/admin-config';
import { SESSION_COOKIE_NAME } from '@/lib/constants/auth';

/**
 * POST handler for logging out a user by clearing their session cookie.
 * This effectively invalidates the user's server-side session.
 * It uses the modern `cookies()` API from `next/headers` for reliable cookie deletion.
 *
 * @returns {NextResponse} A NextResponse object confirming the logout.
 */
export async function POST() {
  const sessionCookieValue = cookies().get(SESSION_COOKIE_NAME)?.value;

  // For enhanced security, you can optionally revoke all active refresh tokens for the user,
  // which would sign them out of all devices. This is a more forceful logout.
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

  // Clear the cookie by setting its expiration date to a past time (the epoch).
  // This is the most reliable way to instruct the browser to delete the cookie.
  // The 'path' must match the path of the cookie to be deleted.
  try {
    cookies().set({
      name: SESSION_COOKIE_NAME,
      value: '',
      expires: new Date(0), // Set expiry to epoch time
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
    });
  } catch (error) {
    console.error("Failed to set cookie for logout:", error);
    return NextResponse.json({ status: 'error', message: 'Failed to clear session.' }, { status: 500 });
  }

  // Return a success response.
  return NextResponse.json({ status: 'success', message: 'Logged out successfully.' }, { status: 200 });
}
