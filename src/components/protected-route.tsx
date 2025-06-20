
'use client';

import { useEffect, type ReactNode } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';
// useRouter is no longer needed if we use window.location.assign
// import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  // const router = useRouter(); // No longer needed

  useEffect(() => {
    if (!loading && !user) {
      // Use window.location.assign for a full page reload to /signin
      if (typeof window !== 'undefined') {
        window.location.assign('/signin');
      }
    }
  }, [user, loading]); // Dependencies remain correct.

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-background"
        role="status"
        aria-live="polite"
      >
        <Loader2 className="h-12 w-12 animate-spin text-primary" aria-hidden="true" />
        <span className="sr-only">Loading content...</span>
      </div>
    );
  }

  // If not loading and user is null, the useEffect will handle redirection.
  // Render a loader (or null) to prevent children rendering while redirect is in progress.
  if (!user) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-background"
        role="status"
        aria-live="polite"
      >
        <Loader2 className="h-12 w-12 animate-spin text-primary" aria-hidden="true" />
        <span className="sr-only">Redirecting to sign-in...</span>
      </div>
    );
  }

  // If loading is false and user exists, render children.
  return <>{children}</>;
};
