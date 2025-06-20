import { SignInForm } from '@/components/auth/signin-form';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Sign In | AuthFlow',
  description: 'Sign in to your AuthFlow account.',
};

// A simple loading component for Suspense
function Loading() {
  return <div className="flex justify-center items-center h-full">Loading form...</div>;
}


export default function SignInPage() {
  return (
    <Suspense fallback={<Loading />}>
      <SignInForm />
    </Suspense>
  );
}
