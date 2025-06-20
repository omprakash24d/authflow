
'use client';

import { useEffect, type ReactNode } from 'react'; // Removed memo
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if loading is complete and there's no user.
    if (!loading && !user) {
      router.push('/signin');
    }
  }, [user, loading, router]); // Dependencies are correct.

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

  // If not loading and still no user, the useEffect will handle redirection.
  // Return a loader (or null) here to prevent rendering children prematurely
  // while the redirect is in progress.
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

