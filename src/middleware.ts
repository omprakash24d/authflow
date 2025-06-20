
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Configuration for paths
const PROTECTED_PATHS: string[] = ['/dashboard'];
// Added '/' to AUTH_PATHS
const AUTH_PATHS: string[] = ['/', '/signin', '/signup', '/forgot-password'];
const SESSION_COOKIE_NAME = 'firebaseIdToken';

// Using direct array.some for clarity with startsWith
// const protectedPathSet = new Set(PROTECTED_PATHS.map(path => path.startsWith('/') ? path : `/${path}`));
// const authPathSet = new Set(AUTH_PATHS.map(path => path.startsWith('/') ? path : `/${path}`));

function createRedirectResponse(request: NextRequest, targetPath: string, addRedirectedFrom: boolean = false): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = targetPath;
  if (addRedirectedFrom && request.nextUrl.pathname !== '/') { // Avoid adding redirectedFrom for root path itself
    url.searchParams.set('redirectedFrom', request.nextUrl.pathname);
  }
  return NextResponse.redirect(url);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME);

  const isAccessingProtectedPath = PROTECTED_PATHS.some(p => pathname.startsWith(p));
  const isAccessingAuthPath = AUTH_PATHS.some(p => pathname.startsWith(p));

  // If trying to access a protected path without a session, redirect to signin
  if (isAccessingProtectedPath && !sessionToken) {
    return createRedirectResponse(request, '/signin', true);
  }

  // If trying to access an auth path (like signin/signup or homepage) with an active session, redirect to dashboard
  if (isAccessingAuthPath && sessionToken) {
    // For homepage, don't add redirectedFrom to avoid cluttering URL if already on dashboard path
    const addRedirectParam = pathname !== '/'; 
    return createRedirectResponse(request, '/dashboard', addRedirectParam);
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

