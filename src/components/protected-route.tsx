// src/components/protected-route.tsx
// This client component is used to protect routes that require user authentication.
// It checks the authentication state from `AuthContext`. If the user is not authenticated
// or the state is loading, it displays a loader. If unauthenticated after loading,
// it redirects the user to the sign-in page.

'use client'; // This is a Client Component due to hooks (useEffect, useAuth).

import { useEffect, type ReactNode } from 'react';
import { useAuth } from '@/contexts/auth-context'; // Hook to access authentication state
import { Loader2 } from 'lucide-react'; // Loading spinner icon

/**
 * Props for the ProtectedRoute component.
 * @property {ReactNode} children - The child components or page content to render if the user is authenticated.
 */
interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * ProtectedRoute component.
 * A client-side guard that wraps content that should only be accessible to authenticated users.
 * It handles the loading state and redirects to the sign-in page if the user is not authenticated.
 * This component complements the server-side protection provided by the middleware.
 * @param {ProtectedRouteProps} props - The component's props.
 * @returns JSX.Element - Renders children if authenticated, or a loader/redirect otherwise.
 */
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth(); // Get user and loading state from context

  // useEffect to handle redirection if the user is not authenticated once loading is complete.
  useEffect(() => {
    if (!loading && !user) {
      // If auth state is resolved (`!loading`) and no user is found (`!user`),
      // redirect to the sign-in page using a full page reload.
      // This is a robust method to ensure a clean state, complementing the middleware.
      if (typeof window !== 'undefined') { // Ensure running in a browser environment
        window.location.assign('/signin');
      }
    }
  }, [user, loading]); // Dependencies: re-run effect if user or loading state changes.

  // If the initial authentication state is still loading, display a full-page loader.
  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-background"
        role="status" // ARIA role for live region
        aria-live="polite" // Indicates content may update
      >
        <Loader2 className="h-12 w-12 animate-spin text-primary" aria-hidden="true" />
        <span className="sr-only">Loading user session...</span> {/* For screen readers */}
      </div>
    );
  }

  // If not loading, but there's no user, a redirect is in progress (due to useEffect).
  // Display a loader during this brief period to prevent rendering children or flashing content.
  if (!user) { 
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-background"
        role="status"
        aria-live="polite"
      >
        <Loader2 className="h-12 w-12 animate-spin text-primary" aria-hidden="true" />
        <span className="sr-only">User not authenticated. Redirecting to sign-in page...</span>
      </div>
    );
  }

  // If loading is false and a user object exists, the user is authenticated.
  // Render the protected children content.
  return <>{children}</>;
};
