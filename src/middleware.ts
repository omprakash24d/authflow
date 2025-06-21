// src/middleware.ts
// This Next.js middleware handles route protection and redirection based on user authentication status.
// It inspects an HTTP-only session cookie to determine if a user is authenticated.
// The middleware runs on specified paths before the request is handled by the page or API route.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/constants/auth';

// Configuration for paths:
// PROTECTED_PATHS: Routes that require an authenticated user.
// AUTH_PATHS: Routes primarily for unauthenticated users (e.g., sign-in, sign-up, landing page).
//             Authenticated users accessing these will be redirected (e.g., to dashboard).
const PROTECTED_PATHS: string[] = ['/dashboard']; // Add other protected base paths as needed (e.g., '/settings', '/profile')
const AUTH_PATHS: string[] = ['/', '/signin', '/signup', '/forgot-password']; // Paths for authentication flow or public landing

/**
 * Helper function to create a redirect response.
 * Clones the request's URL, changes the pathname, clears search params, and creates a redirect.
 * @param request - The original NextRequest.
 * @param targetPath - The path to redirect to.
 * @returns A NextResponse object configured for redirection.
 */
function createRedirectResponse(request: NextRequest, targetPath: string): NextResponse {
  const url = request.nextUrl.clone(); // Clone the original URL
  url.pathname = targetPath; // Set the new path
  url.search = ''; // Clear any existing query parameters from the original request to avoid unintended state.
  return NextResponse.redirect(url);
}

/**
 * Middleware function executed for matched routes.
 * @param request - The incoming NextRequest object.
 * @returns A NextResponse object (either proceed with `NextResponse.next()` or redirect).
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl; // Get the current path from the request URL
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value; // Get the session token value from cookies

  // Determine if the current path is one of the protected paths (e.g., /dashboard, /dashboard/settings).
  const isAccessingProtectedPath = PROTECTED_PATHS.some(p => pathname.startsWith(p));
  // Determine if the current path is one of the exact authentication-related paths.
  const isOnExactAuthPath = AUTH_PATHS.includes(pathname);

  // Scenario 1: User tries to access a protected path WITHOUT a session token.
  // Action: Redirect to the sign-in page.
  if (isAccessingProtectedPath && !sessionToken) {
    console.log(`Middleware: Unauthorized access attempt to protected path ${pathname}. Redirecting to /signin.`);
    return createRedirectResponse(request, '/signin');
  }

  // Scenario 2: User IS authenticated (has a session token) AND tries to access an exact auth page
  // (e.g., sign-in, sign-up, or the homepage if it's considered an auth path).
  // Action: Redirect to the main dashboard page. This prevents authenticated users from seeing login/signup forms again.
  if (isOnExactAuthPath && sessionToken) {
    console.log(`Middleware: Authenticated user accessing auth path ${pathname}. Redirecting to /dashboard.`);
    return createRedirectResponse(request, '/dashboard');
  }

  // If none of the above conditions are met (e.g., accessing a public page, or
  // an authenticated user accessing a non-auth, non-protected page, or
  // an unauthenticated user accessing a non-protected, non-auth page),
  // allow the request to proceed to the intended destination.
  return NextResponse.next();
}

// Configuration for the middleware:
// Specifies which paths the middleware should run on using a matcher.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes - these often have their own token/auth validation)
     * - _next/static (static files like JS, CSS, fonts)
     * - _next/image (Next.js image optimization files)
     * - favicon.ico (favicon file)
     * - Any files in the public folder (e.g., images, manifests - typically identified by a file extension like .png, .json, .svg)
     * The regex `\/((?!api|_next\/static|_next\/image|favicon\.ico|.*\..*).*)` aims to achieve this:
     *   - `\/`: Matches the leading slash.
     *   - `((?!... ).*)`: This is a negative lookahead. It matches any sequence of characters (`.*`)
     *     as long as it's NOT followed by `api`, `_next/static`, etc.
     *   - `.*\..*`: This part tries to exclude paths that look like files with extensions (e.g., `image.png`, `manifest.json`).
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
