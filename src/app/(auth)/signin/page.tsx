
import { SignInForm } from '@/components/auth/signin-form';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthPageLoader } from '@/components/auth/auth-page-loader'; // Updated import

export const metadata: Metadata = {
  title: 'Sign In to AuthFlow | Secure Account Access',
  description: 'Access your AuthFlow account securely. Sign in with your email/username and password or use social login options. Fast and reliable authentication.',
};

export default function SignInPage() {
  return (
    <Suspense fallback={<AuthPageLoader message="Loading sign-in form..." />}>
      <SignInForm />
    </Suspense>
  );
}
