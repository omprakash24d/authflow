// src/app/api/auth/get-email-for-username/route.ts
// This API route allows looking up a user's email address given their username.
// It queries the Firestore 'usernames' collection and is rate-limited to prevent abuse.

import { type NextRequest, NextResponse } from 'next/server';
import { firebaseAdminFirestore } from '@/lib/firebase/admin-config';
import { rateLimiter } from '@/lib/rate-limiter';
import { ApiErrors } from '@/lib/constants/messages';

// Initialize a rate limiter for this endpoint to prevent username enumeration attacks.
const limiter = rateLimiter({
  uniqueTokenPerInterval: 20, // Allows 20 lookup attempts per IP per minute.
  interval: 60000, // 1 minute interval.
});

/**
 * GET handler for fetching a user's email by their username.
 * Expects a 'username' URL query parameter.
 *
 * @param {NextRequest} request - The incoming NextRequest object.
 * @returns {NextResponse} A NextResponse object with the user's email or an error.
 */
export async function GET(request: NextRequest) {
  // Enforce rate limiting.
  const rateLimitResponse = limiter.check(request);
  if (rateLimitResponse) {
    return rateLimitResponse; // If rate-limited, return the 429 response.
  }

  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'Username query parameter is required.' }, { status: 400 });
  }

  // Basic validation: A valid username should not contain '@'.
  if (username.includes('@')) {
    return NextResponse.json({ error: 'Invalid parameter: A username cannot contain an "@" symbol.' }, { status: 400 });
  }
  
  try {
    const db = firebaseAdminFirestore();
    // Query the 'usernames' collection for a document with an ID matching the lowercase username.
    const usernameDoc = await db.collection('usernames').doc(username.toLowerCase()).get();

    if (!usernameDoc.exists) {
      // SECURITY NOTE: To prevent username enumeration, do not confirm that the username was not found.
      // Instead, return a generic error that mimics a credentials failure.
      console.warn(`Username lookup failed for: "${username.toLowerCase()}" (Not Found)`);
      return NextResponse.json({ error: ApiErrors.invalidUserLookup }, { status: 404 });
    }

    const userData = usernameDoc.data();
    if (!userData || !userData.email) {
      // This indicates a data integrity issue.
      console.error(`Firestore document for username "${username.toLowerCase()}" is missing the 'email' field.`);
      return NextResponse.json({ error: 'Internal server error: User data is incomplete.' }, { status: 500 });
    }

    // Successfully found the email.
    return NextResponse.json({ email: userData.email }, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching email for username:', error);
    if (error.message?.includes("Firebase Admin SDK not initialized")) {
        return NextResponse.json({ error: 'Internal server error: Service configuration issue.' }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal server error while fetching user data.' }, { status: 500 });
  }
}
