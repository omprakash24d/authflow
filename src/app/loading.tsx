// src/app/loading.tsx
// This file defines a global loading UI for the Next.js App Router.
// It's automatically displayed as a fallback when a route segment is loading its data.
// This improves user experience by providing immediate feedback during navigation.
// See: https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming

import { Loader2 } from 'lucide-react'; // Icon for visual feedback

/**
 * Global Loading component.
 * Displays a centered spinner to indicate that page content is being loaded.
 * @returns JSX.Element
 */
export default function Loading() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-background"
      role="status" // Informs assistive technologies that this region represents a status.
      aria-live="polite" // Indicates to screen readers that the content may update.
      aria-busy="true"   // Indicates that the region is currently busy loading.
    >
      <Loader2 className="h-16 w-16 animate-spin text-primary" aria-hidden="true" />
      <span className="sr-only">Loading page content...</span> {/* Descriptive text for screen readers */}
    </div>
  );
}
