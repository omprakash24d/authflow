
'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center bg-background p-8 text-center"
      role="alert"
    >
      <AlertTriangle className="mb-4 h-16 w-16 text-destructive" />
      <h2 className="mb-4 text-3xl font-bold font-headline text-destructive">
        Oops, Something Went Wrong!
      </h2>
      <p className="mb-8 max-w-md text-lg text-foreground/80">
        We encountered an unexpected issue. Please try again, or if the problem persists, contact support.
      </p>
      {error.message && (
        <p className="mb-4 text-sm text-muted-foreground bg-muted p-2 rounded-md">
          Error details: {error.message}
        </p>
      )}
      <Button
        type="button"
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
        size="lg"
      >
        Try Again
      </Button>
    </div>
  );
}
