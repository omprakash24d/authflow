
import { type NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebase/admin-config';

export async function POST(request: NextRequest) {
  const authorization: string | null = request.headers.get('Authorization');
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized: No token provided or malformed authorization header' }, { status: 401 });
  }
  const idToken = authorization.split('Bearer ')[1];

  if (!idToken) {
     return NextResponse.json({ error: 'Unauthorized: Token is empty' }, { status: 401 });
  }

  try {
    // Session cookie will be valid for 14 days.
    const expiresIn = 60 * 60 * 24 * 14 * 1000;
    const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });

    const response = NextResponse.json({ status: 'success', message: 'Session cookie created successfully.' }, { status: 200 });
    response.cookies.set({
      name: 'firebaseIdToken',
      value: sessionCookie,
      maxAge: expiresIn / 1000, // maxAge is in seconds
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
    });
    return response;

  } catch (error: any) {
    console.error('Error creating session cookie:', error);
    const errorCode = error.code || 'UNKNOWN_ERROR';
    // Avoid sending detailed internal Firebase errors to the client for security.
    // The specific Firebase error code is logged on the server.
    return NextResponse.json({ error: `Unauthorized: Failed to create session (Ref: ${errorCode})` }, { status: 401 });
  }
}

