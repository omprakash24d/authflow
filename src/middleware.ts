import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Add paths that require authentication
const protectedPaths = ['/dashboard']; 
// Add paths that should only be accessible to unauthenticated users
const authPaths = ['/signin', '/signup', '/forgot-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get('firebaseIdToken'); // Example, adjust if using a different cookie name

  // If trying to access a protected path without a session, redirect to signin
  if (protectedPaths.some(path => pathname.startsWith(path))) {
    if (!sessionToken) {
      const url = request.nextUrl.clone();
      url.pathname = '/signin';
      url.searchParams.set('redirectedFrom', pathname); // Optional: add redirect origin
      return NextResponse.redirect(url);
    }
  }

  // If trying to access an auth path (like signin/signup) with an active session, redirect to dashboard
  if (authPaths.some(path => pathname.startsWith(path))) {
    if (sessionToken) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - files in public folder (e.g. images, manifests)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
