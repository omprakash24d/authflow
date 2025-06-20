
'use client';

import { useEffect, type ReactNode, memo } from 'react'; // Import memo
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
}

// Internal component logic
const ProtectedRouteLogic = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // You could add a query parameter here if you want the sign-in page
      // to display a specific message, e.g., router.push('/signin?reason=protected');
      router.push('/signin');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        role="status"
        aria-live="polite"
      >
        <Loader2 className="h-12 w-12 animate-spin text-primary" aria-hidden="true" />
        <span className="sr-only">Loading content...</span>
      </div>
    );
  }

  if (!user) {
    // This case should ideally not be reached due to the useEffect redirect,
    // but it's a fallback. The router.push in useEffect will handle navigation.
    return null;
  }

  return <>{children}</>;
};

// Export the memoized component
export const ProtectedRoute = memo(ProtectedRouteLogic);

