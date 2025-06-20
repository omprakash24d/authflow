
import { SignInForm } from '@/components/auth/signin-form';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sign In to AuthFlow | Secure Account Access',
  description: 'Access your AuthFlow account securely. Sign in with your email/username and password or use social login options. Fast and reliable authentication.',
};

// A more visually indicative and accessible loading component for Suspense
function Loading() {
  return (
    <div 
      className="flex flex-col justify-center items-center h-full py-10 text-muted-foreground" 
      aria-live="polite" 
      aria-busy="true"
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
      <span>Loading sign-in form...</span>
    </div>
  );
}


export default function SignInPage() {
  return (
    <Suspense fallback={<Loading />}>
      <SignInForm />
    </Suspense>
  );
}
