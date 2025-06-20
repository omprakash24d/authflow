
import { SignUpForm } from '@/components/auth/signup-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Your AuthFlow Account | Sign Up Today',
  description: 'Join AuthFlow by creating a new account. Quick and easy sign-up process with email/password or social providers. Get started with secure authentication.',
};

export default function SignUpPage() {
  return <SignUpForm />;
}
