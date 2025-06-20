// src/middleware.ts
// This Next.js middleware handles route protection and redirection based on user authentication status.
// It checks for a session cookie (firebaseIdToken) to determine if a user is authenticated.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Configuration for paths
const PROTECTED_PATHS: string[] = ['/dashboard']; // Paths that require authentication
const AUTH_PATHS: string[] = ['/', '/signin', '/signup', '/forgot-password']; // Paths related to authentication (e.g., login, signup pages, homepage if it's a landing for auth)
const SESSION_COOKIE_NAME = 'firebaseIdToken'; // The name of the session cookie set by /api/auth/session-login

// Helper function to create a redirect response.
function createRedirectResponse(request: NextRequest, targetPath: string): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = targetPath;
  url.search = ''; // Clear any existing query parameters from the original request.
  return NextResponse.redirect(url);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value; // Get cookie value

  // Determine if the current path is one of the protected paths.
  const isAccessingProtectedPath = PROTECTED_PATHS.some(p => pathname.startsWith(p));
  // Determine if the current path is one of the exact authentication-related paths.
  const isOnExactAuthPath = AUTH_PATHS.includes(pathname);

  // Scenario 1: User tries to access a protected path without a session token.
  // Action: Redirect to the sign-in page.
  if (isAccessingProtectedPath && !sessionToken) {
    console.log(`Middleware: Unauthorized access to ${pathname}, redirecting to /signin.`);
    return createRedirectResponse(request, '/signin');
  }

  // Scenario 2: User is authenticated (has a session token) and tries to access an auth page (e.g., sign-in, sign-up, or homepage).
  // Action: Redirect to the dashboard page.
  if (isOnExactAuthPath && sessionToken) {
    console.log(`Middleware: Authenticated user accessing ${pathname}, redirecting to /dashboard.`);
    return createRedirectResponse(request, '/dashboard');
  }

  // If none of the above conditions are met, allow the request to proceed.
  return NextResponse.next();
}

// Configuration for the middleware:
// Specifies which paths the middleware should run on.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes, these might have their own auth)
     * - _next/static (static files like JS, CSS)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Any files in the public folder (e.g., images, manifests - typically identified by a file extension like .png, .json)
     * The regex /((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*) aims to achieve this.
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
