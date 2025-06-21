// src/app/api/auth/activity-details/route.ts
// This API route provides details about the user's current session activity,
// such as IP address. It requires an authenticated session.

import { type NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebase/admin-config'; // Firebase Admin SDK for session verification

/**
 * GET handler for fetching activity details.
 * Verifies the user's session cookie and returns IP address information.
 * @param request The incoming NextRequest object.
 * @returns A NextResponse object with activity details or an error.
 */
export async function GET(request: NextRequest) {
  // Retrieve the session cookie from the request.
  const sessionCookie = request.cookies.get('firebaseIdToken')?.value;

  if (!sessionCookie) {
    // If no session cookie is found, return an unauthorized error.
    return NextResponse.json({ error: 'Unauthorized: No session cookie provided.' }, { status: 401 });
  }

  try {
    // Verify the session cookie using Firebase Admin SDK.
    // The `true` argument checks if the cookie has been revoked.
    await admin.auth().verifySessionCookie(sessionCookie, true);

    // Attempt to get the IP address from the request.
    // `request.ip` is preferred for Vercel Edge Functions.
    // `x-forwarded-for` is a common header for proxies.
    const ipAddress = request.ip || request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'IP Not Available';
    
    // Mock location data as actual geolocation is beyond the scope of this basic example
    // and would require a third-party service or more complex setup.
    const location = 'Location data unavailable';

    // Return the IP address and mocked location data.
    return NextResponse.json({ ipAddress, location }, { status: 200 });

  } catch (error) {
    // Log any errors during session verification or processing.
    console.error('Error verifying session cookie or getting activity details:', error);
    // Respond with a generic error for security; specific error is logged server-side.
    return NextResponse.json({ error: 'Unauthorized: Invalid session or failed to process request.' }, { status: 401 });
  }
}
