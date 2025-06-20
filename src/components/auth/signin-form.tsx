
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { signInWithEmailAndPassword, sendEmailVerification, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { SignInSchema, type SignInFormValues } from '@/lib/validators/auth';
import { getFirebaseAuthErrorMessage } from '@/lib/firebase/error-mapping';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AuthFormWrapper } from './auth-form-wrapper';
import { SocialLogins } from './social-logins';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, AlertTriangle, Loader2, MailCheck, Send } from 'lucide-react';

const UNVERIFIED_EMAIL_ERROR_MESSAGE = 'Your email address is not verified. Please check your inbox for the verification link we sent you, or click below to resend.';

export function SignInForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showVerificationMessageFromSignUp, setShowVerificationMessageFromSignUp] = useState(false);
  const [unverifiedUser, setUnverifiedUser] = useState<User | null>(null);
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    if (searchParams.get('verificationEmailSent') === 'true') {
      setShowVerificationMessageFromSignUp(true);
      // Create a new URLSearchParams object from the current one
      const newSearchParams = new URLSearchParams(searchParams.toString());
      // Delete the specific parameter
      newSearchParams.delete('verificationEmailSent');
      // Construct the new path. If there are no search params left, don't append '?'
      const newPath = newSearchParams.toString()
        ? `${pathname}?${newSearchParams.toString()}`
        : pathname;
      router.replace(newPath, { scroll: false });
    }
  }, [searchParams, router, pathname, setShowVerificationMessageFromSignUp]);


  const form = useForm<SignInFormValues>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  async function handleSignIn(emailToUse: string, passwordToUse: string) {
    const userCredential = await signInWithEmailAndPassword(auth, emailToUse, passwordToUse);
    const firebaseUser = userCredential.user;

    if (firebaseUser && !firebaseUser.emailVerified) {
      setFormError(UNVERIFIED_EMAIL_ERROR_MESSAGE);
      setUnverifiedUser(firebaseUser);
      toast({
        title: 'Email Not Verified',
        description: "Check your inbox for a verification link or use the resend option.",
        variant: 'destructive',
      });
      setIsLoading(false); // Ensure loading is stopped here
      return; // Stop further execution
    }
    
    if (firebaseUser) {
      const idToken = await firebaseUser.getIdToken();
      const response = await fetch('/api/auth/session-login', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        let errorData = { error: 'Failed to create session. Server response not in expected format.' };
        try {
          errorData = await response.json();
        } catch (jsonError) {
          // Keep default error
        }
        throw new Error(errorData.error || 'Failed to create session.');
      }
    }
    
    toast({
      title: 'Signed In!',
      description: 'Welcome back!',
    });
    router.push('/dashboard');
  }


  async function onSubmit(values: SignInFormValues) {
    setIsLoading(true);
    setFormError(null);
    setShowVerificationMessageFromSignUp(false); 
    setUnverifiedUser(null);

    let emailToUse = values.identifier;

    try {
      if (!values.identifier.includes('@')) { // Assume it's a username
        const usernameLookupResponse = await fetch(`/api/auth/get-email-for-username?username=${encodeURIComponent(values.identifier)}`);
        if (!usernameLookupResponse.ok) {
          const errorData = await usernameLookupResponse.json().catch(() => ({}));
          const specificMessage = errorData.error || 'Invalid username or credentials.';
          setFormError(specificMessage);
          toast({ title: 'Sign In Failed', description: specificMessage, variant: 'destructive' });
          setIsLoading(false);
          return;
        }
        const { email } = await usernameLookupResponse.json();
        if (!email) {
          setFormError('Could not find email for the provided username.');
          toast({ title: 'Sign In Failed', description: 'Could not find email for the provided username.', variant: 'destructive' });
          setIsLoading(false);
          return;
        }
        emailToUse = email;
      }
      
      await handleSignIn(emailToUse, values.password);

    } catch (error: any) {
      console.error("Sign In Error:", error);
      const errorMessage = error.code ? getFirebaseAuthErrorMessage(error.code) : error.message;
      // Ensure specific username lookup errors from above aren't overwritten by generic Firebase errors if possible
      if (!form.formState.errors.identifier && !formError) { // Check if a specific error was not already set
         setFormError(errorMessage);
      }
       toast({
        title: 'Sign In Failed',
        description: formError || errorMessage, // Prefer already set formError if it exists
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResendVerificationEmail() {
    if (!unverifiedUser) return;
    setIsResendingVerification(true);
    setFormError(null); 
    try {
      await sendEmailVerification(unverifiedUser);
      toast({
        title: 'Verification Email Sent',
        description: 'A new verification email has been sent to your address. Please check your inbox.',
      });
      setUnverifiedUser(null); 
    } catch (error: any) {
      console.error("Error resending verification email:", error);
      const errorMessage = getFirebaseAuthErrorMessage(error.code);
      setFormError(errorMessage); 
      toast({
        title: 'Resend Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsResendingVerification(false);
    }
  }

  const anyLoading = isLoading || isResendingVerification;

  return (
    <AuthFormWrapper
      title="Sign In to AuthFlow"
      description="Enter your credentials to access your account."
      footerContent={
        <p>
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Sign Up
          </Link>
        </p>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {formError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          {showVerificationMessageFromSignUp && !formError && ( 
            <Alert variant="default" className="bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300">
              <MailCheck className="h-5 w-5 text-green-500 dark:text-green-400" />
              <AlertTitle className="font-semibold">Verification Email Sent During Sign Up</AlertTitle>
              <AlertDescription>
                If you just signed up, please check your inbox and click the verification link to activate your account before signing in.
              </AlertDescription>
            </Alert>
          )}
          <FormField
            control={form.control}
            name="identifier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email or Username</FormLabel>
                <FormControl>
                  <Input 
                    type="text" 
                    placeholder="john.doe@example.com or johndoe" 
                    {...field} 
                    disabled={anyLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <div className="relative">
                    <Input 
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••" 
                      {...field} 
                      disabled={anyLoading}
                    />
                     <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      disabled={anyLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={anyLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Sign In
          </Button>

          {unverifiedUser && formError === UNVERIFIED_EMAIL_ERROR_MESSAGE && (
            <Button
              type="button"
              variant="outline"
              className="w-full mt-2"
              onClick={handleResendVerificationEmail}
              disabled={anyLoading}
            >
              {isResendingVerification ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Resend Verification Email
            </Button>
          )}
        </form>
      </Form>
      <SocialLogins />
    </AuthFormWrapper>
  );
}
