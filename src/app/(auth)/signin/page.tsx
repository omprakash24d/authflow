// src/app/(auth)/signin/page.tsx
// This file defines the Sign In page for the AuthFlow system.
// It uses React Suspense to provide a loading fallback, improving user experience
// while the main `SignInForm` component, which contains all the logic, is loading.

import { SignInForm } from '@/components/auth/signin-form';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthPageLoader } from '@/components/auth/auth-page-loader';

/**
 * Metadata for the Sign In page.
 * Provides title and description for SEO and browser tab identification.
 */
export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Access your AuthFlow account securely. Sign in with your email/username and password or use social login options. Fast and reliable authentication.',
};

/**
 * SignInPage component.
 * Renders the `SignInForm`, which handles all sign-in logic and UI.
 * It wraps the form in a React `Suspense` boundary to show a user-friendly
 * loader (`AuthPageLoader`) while the form component or its dependencies are loading.
 * This prevents a blank screen and improves perceived performance.
 *
 * @returns {JSX.Element} The rendered Sign In page with Suspense.
 */
export default function SignInPage() {
  return (
    // Suspense provides a fallback UI if SignInForm is code-split or takes time to load.
    <Suspense fallback={<AuthPageLoader message="Loading sign-in form..." />} >
      <SignInForm />
    </Suspense>
  );
}
