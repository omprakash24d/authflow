// src/app/(auth)/forgot-password/page.tsx
// This file defines the "Forgot Password" page for the AuthFlow system.
// It allows users who have forgotten their password to request a reset link via email.
// The primary logic and UI are encapsulated in the `ForgotPasswordForm` component,
// which is rendered by this page.

import type { Metadata } from 'next';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';

/**
 * Metadata for the Forgot Password page.
 * Provides title and description for SEO and browser tab identification.
 */
export const metadata: Metadata = {
  title: 'Forgot Password',
  description: 'Forgot your AuthFlow password? Enter your email address to receive a secure link to reset your password and regain access to your account.',
};

/**
 * ForgotPasswordPage component.
 * This page component simply renders the `ForgotPasswordForm`, which contains all
 * the necessary logic and UI for the password reset request process.
 *
 * @returns {JSX.Element} The rendered Forgot Password form.
 */
export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
