
import { type NextRequest, NextResponse } from 'next/server';
import { firebaseAdminFirestore } from '@/lib/firebase/admin-config';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'Username query parameter is required.' }, { status: 400 });
  }

  if (username.includes('@')) {
    return NextResponse.json({ error: 'Username cannot contain "@" symbol.' }, { status: 400 });
  }
  
  try {
    const db = firebaseAdminFirestore();
    const usernameDoc = await db.collection('usernames').doc(username.toLowerCase()).get();

    if (!usernameDoc.exists) {
      return NextResponse.json({ error: 'Username not found.' }, { status: 404 });
    }

    const userData = usernameDoc.data();
    if (!userData || !userData.email) {
      console.error(`Firestore document for username ${username.toLowerCase()} is missing email field.`);
      return NextResponse.json({ error: 'Internal server error: User data incomplete.' }, { status: 500 });
    }

    return NextResponse.json({ email: userData.email }, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching email for username:', error);
    // Log specific Firebase Admin SDK initialization errors if they occur
    if (error.message && error.message.includes("Firebase Admin SDK not initialized")) {
        return NextResponse.json({ error: 'Internal server error: Service configuration issue.' }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal server error while fetching user data.' }, { status: 500 });
  }
}
