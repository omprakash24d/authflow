// src/app/(auth)/forgot-password/page.tsx
// This file defines the "Forgot Password" page for the AuthFlow system.
// It allows users who have forgotten their password to request a reset link via email.

import type { Metadata } from 'next';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';

/**
 * Metadata for the Forgot Password page.
 * Provides title and description for SEO and browser tab.
 */
export const metadata: Metadata = {
  title: 'Reset Your AuthFlow Password | Forgot Password',
  description: 'Forgot your AuthFlow password? Enter your email address to receive a secure link to reset your password and regain access to your account.',
};

/**
 * ForgotPasswordPage component.
 * Renders the `ForgotPasswordForm` component which contains the logic and UI
 * for the password reset request process.
 * @returns JSX.Element
 */
export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
