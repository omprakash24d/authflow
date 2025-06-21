// src/app/error.tsx
// This file defines a custom error boundary for the Next.js App Router.
// It catches runtime errors that occur during rendering in its segment
// and child segments, allowing for a graceful fallback UI.
// See: https://nextjs.org/docs/app/building-your-application/routing/error-handling

'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react'; // Icon for visual feedback

/**
 * Props for the Error component.
 * @property error - The error object that was caught. It may include a `digest` for server-side errors.
 * @property reset - A function to attempt to re-render the component tree segment where the error occurred.
 */
interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global Error component for the application.
 * Displays a user-friendly error message and provides an option to retry.
 * This component acts as a catch-all for unexpected client-side and server-side rendering errors.
 * 
 * @param {ErrorProps} props - The component's props.
 * @returns JSX.Element
 */
export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service or console for debugging.
    // In a production environment, you would integrate with services like Sentry, LogRocket, etc.
    console.error("Caught an error in error.tsx:", error);
  }, [error]);

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center bg-background p-8 text-center"
      role="alert" // ARIA role for accessibility
      aria-live="assertive" // Ensures screen readers announce the error immediately.
    >
      <AlertTriangle className="mb-4 h-16 w-16 text-destructive" /> {/* Error Icon */}
      <h2 className="mb-4 text-3xl font-bold font-headline text-destructive">
        Oops, Something Went Wrong!
      </h2>
      <p className="mb-8 max-w-md text-lg text-foreground/80">
        We encountered an unexpected issue. Please try again, or if the problem persists, contact support.
      </p>
      {process.env.NODE_ENV === 'development' && error.message && (
        // Displaying the error message is helpful for debugging but might be too technical for end-users.
        // It's good practice to only show this in development.
        <p className="mb-4 text-sm text-muted-foreground bg-muted p-2 rounded-md">
          Error details: {error.message}
        </p>
      )}
      {error.digest && (
        // The digest is a server-generated hash for server-side errors, useful for correlation in logs.
        <p className="mb-4 text-xs text-muted-foreground">
          Error Digest: {error.digest}
        </p>
      )}
      <Button
        type="button"
        onClick={
          // Attempt to recover by trying to re-render the segment.
          () => reset()
        }
        size="lg"
        aria-label="Try to recover from the error"
      >
        Try Again
      </Button>
    </div>
  );
}
