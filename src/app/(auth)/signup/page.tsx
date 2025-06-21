// src/app/(auth)/signup/page.tsx
// This file defines the Sign Up page for the AuthFlow system.
// It allows new users to create an account using the `SignUpForm` component.

import { SignUpForm } from '@/components/auth/signup-form';
import type { Metadata } from 'next';

/**
 * Metadata for the Sign Up page.
 * Provides title and description for SEO and browser tab identification.
 */
export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Join AuthFlow by creating a new account. Quick and easy sign-up process with email/password or social providers. Get started with secure authentication.',
};

/**
 * SignUpPage component.
 * This page component's primary role is to render the `SignUpForm`, which encapsulates
 * all logic and UI for the user registration process.
 *
 * @returns {JSX.Element} The rendered Sign Up form.
 */
export default function SignUpPage() {
  return <SignUpForm />;
}
