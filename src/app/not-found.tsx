// src/app/not-found.tsx
// This file defines a custom 404 "Not Found" page for the application.
// Following Next.js App Router conventions, this component is automatically
// rendered when a user tries to access a route that does not exist.

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileQuestion } from 'lucide-react'; // Icon for visual feedback

/**
 * NotFound component.
 * Displays a user-friendly message indicating that the requested page could not be found,
 * and provides a clear call-to-action to navigate back to the homepage.
 * @returns {JSX.Element} The rendered 404 Not Found page.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8 text-center">
      <FileQuestion className="mb-8 h-24 w-24 text-primary" />
      <h1 className="mb-4 text-4xl font-bold font-headline text-destructive">
        404 - Page Not Found
      </h1>
      <p className="mb-8 max-w-md text-lg text-foreground/80">
        Oops! The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Button asChild size="lg">
        <Link href="/">Go to Homepage</Link>
      </Button>
    </div>
  );
}
