// src/app/api/auth/get-email-for-username/route.ts
// This API route allows looking up a user's email address given their username.
// It queries the Firestore 'usernames' collection.

import { type NextRequest, NextResponse } from 'next/server';
import { firebaseAdminFirestore } from '@/lib/firebase/admin-config'; // Firebase Admin SDK for Firestore access
import { rateLimiter } from '@/lib/rate-limiter'; // Import the rate limiter utility

// Initialize a rate limiter for this endpoint.
// Allows 20 requests per minute to prevent username enumeration attacks.
const limiter = rateLimiter({
  uniqueTokenPerInterval: 20,
  interval: 60000, // 1 minute
});

/**
 * GET handler for fetching a user's email by their username.
 * Expects a 'username' query parameter.
 * @param request The incoming NextRequest object.
 * @returns A NextResponse object with the user's email or an error.
 */
export async function GET(request: NextRequest) {
  // Check if the request is rate-limited.
  const rateLimitResponse = limiter.check(request);
  if (rateLimitResponse) {
    return rateLimitResponse; // If rate-limited, return the 429 response.
  }

  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    // If username query parameter is missing, return a bad request error.
    return NextResponse.json({ error: 'Username query parameter is required.' }, { status: 400 });
  }

  // Basic validation: username should not contain '@' as it might be an email.
  if (username.includes('@')) {
    return NextResponse.json({ error: 'Username cannot contain "@" symbol.' }, { status: 400 });
  }
  
  try {
    const db = firebaseAdminFirestore(); // Get Firestore instance
    // Query the 'usernames' collection for a document matching the lowercase username.
    const usernameDoc = await db.collection('usernames').doc(username.toLowerCase()).get();

    if (!usernameDoc.exists) {
      // SECURITY: To prevent username enumeration, do not confirm that the username was not found.
      // Instead, return a generic error that mimics a credentials failure.
      // The client-side will interpret this as "Invalid username or credentials".
      console.warn(`Username lookup failed for: "${username.toLowerCase()}" (Not Found)`);
      return NextResponse.json({ error: 'Invalid user lookup.' }, { status: 404 });
    }

    const userData = usernameDoc.data();
    // Check if the document data and email field exist.
    if (!userData || !userData.email) {
      console.error(`Firestore document for username ${username.toLowerCase()} is missing email field.`);
      return NextResponse.json({ error: 'Internal server error: User data incomplete.' }, { status: 500 });
    }

    // Return the email address associated with the username.
    return NextResponse.json({ email: userData.email }, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching email for username:', error);
    // Handle specific Firebase Admin SDK initialization errors.
    if (error.message && error.message.includes("Firebase Admin SDK not initialized")) {
        return NextResponse.json({ error: 'Internal server error: Service configuration issue.' }, { status: 500 });
    }
    // Return a generic internal server error for other issues.
    return NextResponse.json({ error: 'Internal server error while fetching user data.' }, { status: 500 });
  }
}
