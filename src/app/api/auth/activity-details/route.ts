// src/app/api/auth/activity-details/route.ts
// This API route provides details about the user's current session activity,
// such as their IP address. It's protected and requires an authenticated session.

import { type NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebase/admin-config'; // Firebase Admin SDK for session verification

/**
 * GET handler for fetching user activity details.
 * This endpoint verifies the user's session cookie to ensure they are authenticated.
 * On success, it returns the user's IP address. Location data is mocked.
 *
 * @param {NextRequest} request - The incoming Next.js request object.
 * @returns {NextResponse} A NextResponse object containing activity details or an error response.
 */
export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get('firebaseIdToken')?.value;

  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized: No session cookie provided.' }, { status: 401 });
  }

  try {
    // Verify the session cookie using Firebase Admin SDK.
    // The `true` argument ensures the cookie has not been revoked.
    await admin.auth().verifySessionCookie(sessionCookie, true);

    // Attempt to get the IP address from the request.
    // `request.ip` is the preferred method for Vercel Edge Functions.
    // `x-forwarded-for` is a fallback for common proxy headers.
    const ipAddress = request.ip || request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'IP Not Available';
    
    // NOTE: Real geolocation would require a third-party service (e.g., MaxMind, ip-api.com).
    // For this example, location data is mocked.
    const location = 'Location data unavailable';

    // Return the IP address and mocked location data.
    return NextResponse.json({ ipAddress, location }, { status: 200 });

  } catch (error: any) {
    // Log the detailed error for debugging purposes on the server.
    console.error('Error verifying session cookie or fetching activity details:', error);

    let errorMessage = 'Unauthorized: Invalid session or failed to process request.';
    // Provide a more specific error message if the session cookie is invalid or revoked.
    if (error.code === 'auth/session-cookie-revoked' || error.code === 'auth/invalid-session-cookie') {
        errorMessage = 'Unauthorized: Your session has expired or is invalid. Please sign in again.';
    }

    // Respond with a clear error message.
    return NextResponse.json({ error: errorMessage }, { status: 401 });
  }
}
