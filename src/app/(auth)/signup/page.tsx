// src/app/(auth)/signup/page.tsx
// This file defines the Sign Up page for the AuthFlow system.
// It allows new users to create an account.

import { SignUpForm } from '@/components/auth/signup-form';
import type { Metadata } from 'next';

/**
 * Metadata for the Sign Up page.
 * Provides title and description for SEO and browser tab.
 */
export const metadata: Metadata = {
  title: 'Create Your AuthFlow Account | Sign Up Today',
  description: 'Join AuthFlow by creating a new account. Quick and easy sign-up process with email/password or social providers. Get started with secure authentication.',
};

/**
 * SignUpPage component.
 * Renders the `SignUpForm` component which contains the logic and UI
 * for the user registration process.
 * @returns JSX.Element
 */
export default function SignUpPage() {
  return <SignUpForm />;
}
