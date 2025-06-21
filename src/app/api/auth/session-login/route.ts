// src/app/api/auth/session-login/route.ts
// This API route handles the creation of a session cookie after a user
// successfully authenticates with Firebase on the client-side.
// It receives a Firebase ID token from the client, verifies it, and
// creates an HTTP-only session cookie.

import { type NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebase/admin-config'; // Firebase Admin SDK for creating session cookies
import { rateLimiter } from '@/lib/rate-limiter'; // Import the rate limiter utility

// Initialize a rate limiter for this endpoint.
// Allows 10 requests per minute from a single IP address to prevent brute-force login attempts.
const limiter = rateLimiter({
  uniqueTokenPerInterval: 10,
  interval: 60000, // 1 minute
});

/**
 * POST handler for creating a session cookie.
 * Expects a Firebase ID token in the Authorization header (Bearer token).
 * @param request The incoming NextRequest object.
 * @returns A NextResponse object, setting the session cookie on success, or an error response.
 */
export async function POST(request: NextRequest) {
  // Check if the request is rate-limited.
  const rateLimitResponse = limiter.check(request);
  if (rateLimitResponse) {
    return rateLimitResponse; // If rate-limited, return the 429 response immediately.
  }
  
  const authorization: string | null = request.headers.get('Authorization');
  if (!authorization || !authorization.startsWith('Bearer ')) {
    // If no token or malformed header, return an unauthorized error.
    return NextResponse.json({ error: 'Unauthorized: No token provided or malformed authorization header' }, { status: 401 });
  }
  const idToken = authorization.split('Bearer ')[1];

  if (!idToken) {
     // If token is empty after splitting, return an unauthorized error.
     return NextResponse.json({ error: 'Unauthorized: Token is empty' }, { status: 401 });
  }

  try {
    // Define the session cookie's expiration time (e.g., 14 days).
    const expiresIn = 60 * 60 * 24 * 14 * 1000; // 14 days in milliseconds
    // Create the session cookie using Firebase Admin SDK.
    const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });

    // Create a success response.
    const response = NextResponse.json({ status: 'success', message: 'Session cookie created successfully.' }, { status: 200 });
    
    // Set the session cookie in the response headers.
    response.cookies.set({
      name: 'firebaseIdToken', // Name of the cookie
      value: sessionCookie,
      maxAge: expiresIn / 1000, // maxAge is in seconds
      httpOnly: true, // Makes the cookie inaccessible to client-side JavaScript
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production (HTTPS)
      path: '/', // Cookie is valid for all paths
      sameSite: 'lax', // CSRF protection: 'lax' is a good default
    });
    return response;

  } catch (error: any) {
    console.error('Error creating session cookie:', error);
    const errorCode = error.code || 'UNKNOWN_ERROR';
    // Return a generic error to the client for security, logging the specific error server-side.
    return NextResponse.json({ error: `Unauthorized: Failed to create session (Ref: ${errorCode})` }, { status: 401 });
  }
}
