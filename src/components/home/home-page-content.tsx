// src/components/home/home-page-content.tsx
// This component renders the content for the application's homepage.
// It displays different content based on the user's authentication state:
// - If loading auth state: shows a global loader.
// - If not authenticated: shows a welcome message and links to sign up/sign in.
// - If authenticated: shows a global loader (as middleware should redirect to dashboard).

'use client'; // Client component due to use of `useAuth` hook and client-side logic.

import { useAuth } from '@/contexts/auth-context'; // Hook to access authentication state
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Logo } from '@/components/logo'; // Application logo
import LoadingComponent from '@/app/loading'; // Global loading component

/**
 * HomePageContent component.
 * Dynamically renders content for the homepage based on authentication status.
 * @returns JSX.Element
 */
export default function HomePageContent() {
  const { user, loading } = useAuth(); // Get user and loading state from AuthContext

  // If initial authentication state is still loading, display the global loader.
  if (loading) {
    return <LoadingComponent />;
  }

  // If authentication state is resolved and user is NOT authenticated,
  // display the landing page content for unauthenticated users.
  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8 text-center">
        <div className="mb-12">
          <Logo /> {/* Application Logo */}
        </div>
        <h2 className="mb-4 text-4xl font-bold font-headline text-primary">
          Welcome to AuthFlow
        </h2>
        <p className="mb-8 max-w-xl text-lg text-foreground/80">
          A comprehensive User and Authentication System built with Firebase and Next.js.
          Secure, scalable, and feature-rich for your application needs.
        </p>
        {/* Call to action buttons */}
        <div className="space-x-4">
          <Button asChild size="lg">
            <Link href="/signup">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/signin">Sign In</Link>
          </Button>
        </div>
         <p className="mt-12 text-sm text-muted-foreground">
          Explore features like email/password auth, social logins, MFA, and more.
        </p>
      </div>
    );
  }

  // If authentication state is resolved and user IS authenticated:
  // The middleware (`src/middleware.ts`) should have already redirected the user
  // from the homepage ('/') to an authenticated route (e.g., '/dashboard').
  // Showing a loader here is a fallback for the brief moment before the middleware's
  // redirect takes effect. This prevents a "flash" of the logged-out homepage content.
  return <LoadingComponent />;
}
