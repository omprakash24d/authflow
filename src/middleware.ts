// src/middleware.ts
// This Next.js middleware handles route protection and redirection based on user authentication status.
// It inspects an HTTP-only session cookie to determine if a user is authenticated.
// The middleware runs on specified paths before the request is handled by the page or API route.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/constants/auth';

// --- Configuration for Paths ---
// PROTECTED_PATHS: Routes that require an authenticated user. Unauthenticated users will be redirected to the sign-in page.
// AUTH_PATHS: Routes for unauthenticated users (e.g., sign-in, sign-up, landing page). Authenticated users accessing these will be redirected to the dashboard.
const PROTECTED_PATHS: string[] = ['/dashboard'];
const AUTH_PATHS: string[] = ['/', '/signin', '/signup', '/forgot-password'];

/**
 * Creates a redirect response to a specified path.
 * It preserves the original request's protocol and host.
 * @param {NextRequest} request - The original NextRequest.
 * @param {string} targetPath - The path to redirect to (e.g., '/signin').
 * @returns {NextResponse} A NextResponse object configured for redirection.
 */
function createRedirectResponse(request: NextRequest, targetPath: string): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = targetPath;
  url.search = ''; // Clear query parameters to avoid unintended state transfer.
  return NextResponse.redirect(url);
}

/**
 * Middleware function executed for matched routes. It enforces authentication rules.
 * @param {NextRequest} request - The incoming NextRequest object.
 * @returns {NextResponse} A NextResponse object, which either allows the request to proceed or redirects it.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const requestIp = request.ip || 'unknown'; // Get request IP for logging

  const isAccessingProtectedPath = PROTECTED_PATHS.some(p => pathname.startsWith(p));
  const isOnAuthPath = AUTH_PATHS.includes(pathname);

  // Scenario 1: User is NOT authenticated and tries to access a protected path.
  // Action: Redirect to the sign-in page.
  if (isAccessingProtectedPath && !sessionToken) {
    console.log(
      `Middleware: Unauthorized access attempt from IP [${requestIp}] to protected path "${pathname}". Redirecting to /signin.`
    );
    return createRedirectResponse(request, '/signin');
  }

  // Scenario 2: User IS authenticated and tries to access an authentication path (e.g., login page).
  // Action: Redirect to the main dashboard to prevent re-authentication loops.
  if (isOnAuthPath && sessionToken) {
    console.log(
      `Middleware: Authenticated user from IP [${requestIp}] accessing auth path "${pathname}". Redirecting to /dashboard.`
    );
    return createRedirectResponse(request, '/dashboard');
  }

  // If no specific rule matches, allow the request to proceed.
  return NextResponse.next();
}

// --- Middleware Configuration ---
export const config = {
  /*
   * The `matcher` property specifies which paths the middleware should run on.
   * This regex is designed to match most application paths while excluding static assets
   * and API routes, which generally do not require this type of authentication check.
   * 
   * The regex breaks down as follows:
   *   - `\/`: Matches the leading slash of the path.
   *   - `((?!... ).*)`: This is a negative lookahead. It ensures the path does NOT start with:
   *     - `api`: Excludes all API routes (e.g., /api/auth/session-login).
   *     - `_next/static`: Excludes Next.js static files (JS, CSS).
   *     - `_next/image`: Excludes Next.js image optimization files.
   *     - `favicon.ico`: Excludes the favicon file.
   *     - `.*\\..*`: A simple way to exclude paths that contain a dot, which typically represent files (e.g., 'logo.svg', 'manifest.json').
   */
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
