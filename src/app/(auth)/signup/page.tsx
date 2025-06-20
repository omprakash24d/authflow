import { SignUpForm } from '@/components/auth/signup-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up | AuthFlow',
  description: 'Create a new account on AuthFlow.',
};

export default function SignUpPage() {
  return <SignUpForm />;
}
