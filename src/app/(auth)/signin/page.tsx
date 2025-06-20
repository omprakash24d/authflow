// src/app/(auth)/signin/page.tsx
// This file defines the Sign In page for the AuthFlow system.
// It allows existing users to log into their accounts.

import { SignInForm } from '@/components/auth/signin-form';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthPageLoader } from '@/components/auth/auth-page-loader';

/**
 * Metadata for the Sign In page.
 * Provides title and description for SEO and browser tab.
 */
export const metadata: Metadata = {
  title: 'Sign In to AuthFlow | Secure Account Access',
  description: 'Access your AuthFlow account securely. Sign in with your email/username and password or use social login options. Fast and reliable authentication.',
};

/**
 * SignInPage component.
 * Renders the `SignInForm` which handles the sign-in logic and UI.
 * It uses React Suspense to show a loader while the form component might be loading.
 * @returns JSX.Element
 */
export default function SignInPage() {
  return (
    // Suspense is used here to provide a fallback UI (AuthPageLoader)
    // if SignInForm or its dependencies are code-split and take time to load.
    <Suspense fallback={<AuthPageLoader message="Loading sign-in form..." />} >
      <SignInForm />
    </Suspense>
  );
}
