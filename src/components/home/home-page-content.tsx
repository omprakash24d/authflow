
'use client';

// useEffect and useRouter are no longer needed for redirection here
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import LoadingComponent from '@/app/loading'; 

export default function HomePageContent() {
  const { user, loading } = useAuth();
  // const router = useRouter(); // No longer needed

  // useEffect for redirection has been removed as middleware now handles it.
  // useEffect(() => {
  //   if (!loading) {
  //     if (user) {
  //       router.replace('/dashboard');
  //     }
  //   }
  // }, [user, loading, router]);

  if (loading) {
    return <LoadingComponent />;
  }

  // If middleware has not redirected (i.e., user is not authenticated), show landing content.
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

  // If user is logged in, middleware should have redirected.
  // This state (loading is false, user exists) should ideally not be reached for long on the homepage.
  // Showing a loader here is a fallback during the brief period before middleware effect or if something unexpected occurs.
  return <LoadingComponent />;
}

