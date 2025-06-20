
import { type NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebase/admin-config';

export async function POST(request: NextRequest) {
  const sessionCookie: string | undefined = request.cookies.get('firebaseIdToken')?.value;

  if (sessionCookie) {
    try {
      // For a simple logout, just clearing the cookie is often sufficient.
      // If active server-side revocation of all user sessions is needed,
      // you would typically verify the session cookie here and then use
      // admin.auth().revokeRefreshTokens(decodedClaims.sub);
      // This is a more involved process and depends on specific security requirements.
    } catch (error) {
      console.warn('Error during session cookie operations on logout (continuing to clear):', error);
    }
  }

  const response = NextResponse.json({ status: 'success', message: 'Logged out successfully.' }, { status: 200 });
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

