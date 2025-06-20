
import { type NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebase/admin-config'; // Initializes admin app

export async function POST(request: NextRequest) {
  const sessionCookie = request.cookies.get('firebaseIdToken')?.value;

  if (sessionCookie) {
    try {
      // Optional: Verify the session cookie and revoke refresh tokens.
      // const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true);
      // await admin.auth().revokeRefreshTokens(decodedClaims.sub);
    } catch (error) {
      // Ignore error if cookie is invalid, just clear it.
      console.warn('Error verifying session cookie during logout (continuing to clear):', error);
    }
  }

  const response = NextResponse.json({ status: 'success' }, { status: 200 });
  response.cookies.set({
    name: 'firebaseIdToken',
    value: '',
    maxAge: 0, // Expire immediately
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'lax',
  });
  return response;
}
