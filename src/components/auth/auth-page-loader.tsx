// src/components/auth/auth-page-loader.tsx
// This component provides a simple loading indicator specifically for authentication pages.
// It's typically used as a fallback in React Suspense when an auth form is loading.

'use client'; // This component uses client-side rendering features.

import { Loader2 } from 'lucide-react'; // Loading spinner icon

/**
 * Props for the AuthPageLoader component.
 * @property message - An optional message to display below the loader (defaults to "Loading...").
 */
interface AuthPageLoaderProps {
  message?: string;
}

/**
 * AuthPageLoader component.
 * Displays a loading spinner and an optional message.
 * Intended for use as a Suspense fallback on authentication pages.
 * @param {AuthPageLoaderProps} props - The component's props.
 * @returns JSX.Element
 */
export function AuthPageLoader({ message = 'Loading...' }: AuthPageLoaderProps) {
  return (
    <div
      className="flex flex-col justify-center items-center h-full py-10 text-muted-foreground"
      aria-live="polite" // Informs screen readers that content is updating
      aria-busy="true"   // Informs screen readers that this part of the page is busy
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" /> {/* Spinning loader icon */}
      <span>{message}</span> {/* Loading message */}
    </div>
  );
}
