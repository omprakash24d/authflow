
import { type NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebase/admin-config';

export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get('firebaseIdToken')?.value;

  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized: No session cookie provided.' }, { status: 401 });
  }

  try {
    // Verify the session cookie to ensure the user is authenticated.
    // The `true` checks if the cookie has been revoked.
    await admin.auth().verifySessionCookie(sessionCookie, true);

    // Attempt to get the IP address from the request.
    // 'request.ip' is preferred for Edge runtime, 'x-forwarded-for' is common.
    const ipAddress = request.ip || request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'IP Not Available';
    
    // Mock location data as actual geolocation is beyond scope here.
    const location = 'Location data N/A (mocked)';

    return NextResponse.json({ ipAddress, location }, { status: 200 });

  } catch (error) {
    console.error('Error verifying session cookie or getting activity details:', error);
    // Respond with a generic error for security. Specific error is logged server-side.
    return NextResponse.json({ error: 'Unauthorized: Invalid session or failed to process request.' }, { status: 401 });
  }
}
