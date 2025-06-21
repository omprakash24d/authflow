// src/app/api/auth/session-login/route.ts
// This API route handles the creation of a secure, server-side session cookie
// after a user successfully authenticates with Firebase on the client-side.
// It receives a Firebase ID token from the client, verifies it, and in exchange,
// creates an HTTP-only session cookie for subsequent authenticated requests.

import { type NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebase/admin-config';
import { rateLimiter } from '@/lib/rate-limiter';
import { SESSION_COOKIE_NAME, SESSION_DURATION_MS } from '@/lib/constants/auth';

// Initialize a rate limiter to prevent brute-force login attempts against this endpoint.
const limiter = rateLimiter({
  uniqueTokenPerInterval: 10, // Allows 10 session creation attempts per IP per minute.
  interval: 60000, // 1 minute interval.
});

/**
 * POST handler for creating a session cookie.
 * Expects a Firebase ID token in the 'Authorization: Bearer <token>' header.
 *
 * @param {NextRequest} request - The incoming NextRequest object.
 * @returns {NextResponse} A NextResponse object that sets the session cookie on success, or an error response.
 */
export async function POST(request: NextRequest) {
  // Enforce rate limiting.
  const rateLimitResponse = limiter.check(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }
  
  const authorization: string | null = request.headers.get('Authorization');
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized: No token provided or malformed authorization header.' }, { status: 401 });
  }
  const idToken = authorization.split('Bearer ')[1];

  if (!idToken) {
     return NextResponse.json({ error: 'Unauthorized: Token is empty.' }, { status: 401 });
  }

  try {
    // Create the session cookie using Firebase Admin SDK.
    const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn: SESSION_DURATION_MS });

    const response = NextResponse.json({ status: 'success', message: 'Session cookie created successfully.' }, { status: 200 });
    
    // Set the session cookie in the response headers with secure attributes.
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionCookie,
      maxAge: SESSION_DURATION_MS / 1000, // maxAge is in seconds
      httpOnly: true, // Prevents client-side JavaScript from accessing the cookie.
      secure: process.env.NODE_ENV === 'production', // Ensures cookie is only sent over HTTPS in production.
      path: '/', // Cookie is valid for all paths on the domain.
      sameSite: 'lax', // Provides a good balance of security (CSRF protection) and usability.
    });
    return response;

  } catch (error: any) {
    console.error('Error creating session cookie:', error);
    const errorCode = error.code || 'UNKNOWN_ERROR';
    // Return a generic error to the client for security, while logging the specific error server-side.
    return NextResponse.json({ error: `Unauthorized: Failed to create session. (Ref: ${errorCode})` }, { status: 401 });
  }
}
