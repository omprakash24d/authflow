'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Logo } from '@/components/logo';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('/dashboard');
      }
      // If not loading and no user, stay on this page (landing page)
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }
  
  // If not loading and no user, show landing content
  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8 text-center">
        <div className="mb-12">
          <Logo />
        </div>
        <h2 className="mb-4 text-4xl font-bold font-headline text-primary">
          Welcome to AuthFlow
        </h2>
        <p className="mb-8 max-w-xl text-lg text-foreground/80">
          A comprehensive User and Authentication System built with Firebase and Next.js.
          Secure, scalable, and feature-rich for your application needs.
        </p>
        <div className="space-x-4">
          <Button asChild size="lg">
            <Link href="/signup">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/signin">Sign In</Link>
          </Button>
        </div>
         <p className="mt-12 text-sm text-muted-foreground">
          Explore features like email/password auth, social logins, MFA, and more.
        </p>
      </div>
    );
  }

  // If user is logged in, ProtectedRoute on /dashboard will handle it.
  // This return is mostly a fallback or if the redirect hasn't happened yet.
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
      <p className="ml-4 text-lg">Loading your experience...</p>
    </div>
  );
}
