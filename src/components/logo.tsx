// src/components/logo.tsx
// This component renders the application's logo.
// It includes an icon and the application name, wrapped in a link to the homepage.

import { ShieldCheck } from 'lucide-react'; // Icon for the logo (example: a shield)
import Link from 'next/link'; // Next.js Link component for client-side navigation

/**
 * Logo component.
 * Displays the application logo, consisting of an icon and the app name.
 * Clicking the logo navigates to the homepage ('/').
 * @returns JSX.Element
 */
export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
      {/* Icon for the logo */}
      <ShieldCheck className="h-8 w-8" /> 
      {/* Application name */}
      <h1 className="text-2xl font-bold font-headline">AuthFlow</h1>
    </Link>
  );
}
