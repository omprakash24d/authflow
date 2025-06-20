
import type { Metadata } from 'next';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';

export const metadata: Metadata = {
  title: 'Reset Your AuthFlow Password | Forgot Password',
  description: 'Forgot your AuthFlow password? Enter your email address to receive a secure link to reset your password and regain access to your account.',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
