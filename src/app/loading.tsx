// src/app/loading.tsx
// This file defines a global loading UI for the Next.js App Router.
// It's displayed as a fallback when route segments are loading their data.
// See: https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming

import { Loader2 } from 'lucide-react'; // Icon for visual feedback

/**
 * Global Loading component.
 * Displays a centered spinner to indicate that content is being loaded.
 * @returns JSX.Element
 */
export default function Loading() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-background"
      aria-live="polite" // Indicates to screen readers that content is updating
      aria-busy="true"   // Indicates that the region is currently busy loading
    >
      <Loader2 className="h-16 w-16 animate-spin text-primary" /> {/* Spinning loader icon */}
    </div>
  );
}
