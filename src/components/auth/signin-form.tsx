
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { 
  signInWithEmailAndPassword, 
  sendEmailVerification, 
  type User,
  fetchSignInMethodsForEmail,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { SignInSchema, type SignInFormValues } from '@/lib/validators/auth';
import { getFirebaseAuthErrorMessage } from '@/lib/firebase/error-mapping';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // Keep for specific alerts
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AuthFormWrapper } from './auth-form-wrapper';
import { SocialLogins } from './social-logins';
import { PasswordInput } from './password-input';
import { EmailVerificationAlert } from './email-verification-alert';
import { FormAlert } from '@/components/ui/form-alert'; 
import { useToast } from '@/hooks/use-toast';
import { Loader2, MailCheck } from 'lucide-react'; 

const UNVERIFIED_EMAIL_ERROR_MESSAGE = "Your email address is not verified. Please check your inbox for the verification link we sent you. If you don't see it, be sure to check your spam or junk folder. You can also click below to resend the verification link.";
const REMEMBER_ME_STORAGE_KEY = 'authFlowRememberedIdentifier';

export function SignInForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  // const [showPassword, setShowPassword] = useState(false); // Removed, PasswordInput handles its state
  const [formError, setFormError] = useState<string | null>(null);
  const [showVerificationMessageFromSignUp, setShowVerificationMessageFromSignUp] = useState(false);
  const [unverifiedUser, setUnverifiedUser] = useState<User | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  useEffect(() => {
    if (searchParams.get('verificationEmailSent') === 'true') {
      setShowVerificationMessageFromSignUp(true);
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete('verificationEmailSent');
      const newPath = newSearchParams.toString()
        ? `${pathname}?${newSearchParams.toString()}`
        : pathname;
      router.replace(newPath, { scroll: false });
    }

    const rememberedIdentifier = localStorage.getItem(REMEMBER_ME_STORAGE_KEY);
    if (rememberedIdentifier) {
      form.setValue('identifier', rememberedIdentifier);
      setRememberMe(true);
    }
  }, [searchParams, router, pathname, form, setShowVerificationMessageFromSignUp, setRememberMe]);


  async function handleSignIn(emailToUse: string, passwordToUse: string, currentIdentifier: string) {
    const userCredential = await signInWithEmailAndPassword(auth!, emailToUse, passwordToUse); 
    const firebaseUser = userCredential.user;

    if (firebaseUser && !firebaseUser.emailVerified) {
      setFormError(UNVERIFIED_EMAIL_ERROR_MESSAGE);
      setUnverifiedUser(firebaseUser);
      toast({
        title: 'Email Not Verified',
        description: "Check your inbox for a verification link or use the resend option.",
        variant: 'destructive',
      });
      setIsLoading(false); 
      return; 
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

    if (rememberMe) {
      localStorage.setItem(REMEMBER_ME_STORAGE_KEY, currentIdentifier);
    } else {
      localStorage.removeItem(REMEMBER_ME_STORAGE_KEY);
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
      if (!auth) { 
        setFormError("Authentication service is not available. Please try again later.");
        toast({ title: 'Service Unavailable', description: "Authentication service is not available.", variant: 'destructive' });
        setIsLoading(false);
        return;
      }

      if (!values.identifier.includes('@')) {
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

      await handleSignIn(emailToUse, values.password, values.identifier);

    } catch (error: any) {
      console.error("Sign In Error:", error);
      let errorMessage = error.code ? getFirebaseAuthErrorMessage(error.code) : error.message;
      
      if (auth && emailToUse && (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found')) {
        try {
          const signInMethods = await fetchSignInMethodsForEmail(auth, emailToUse);
          if (signInMethods.includes(GoogleAuthProvider.PROVIDER_ID)) {
            errorMessage += " Tip: This email may be linked to Google Sign-In. Consider trying that method.";
          }
        } catch (fetchMethodsError) {
          console.warn("Could not fetch sign in methods for email:", emailToUse, fetchMethodsError);
        }
      }
      
      if (errorMessage !== UNVERIFIED_EMAIL_ERROR_MESSAGE && !form.formState.errors.identifier && !formError) {
         setFormError(errorMessage);
      }
       toast({
        title: 'Sign In Failed',
        description: formError || errorMessage, 
        variant: 'destructive',
      });
    } finally {
      if(formError !== UNVERIFIED_EMAIL_ERROR_MESSAGE && !(unverifiedUser && !unverifiedUser.emailVerified) ) {
        setIsLoading(false);
      }
    }
  }

  async function handleResendVerificationEmail() {
    if (!unverifiedUser || !auth) { 
      toast({ title: 'Error', description: 'Cannot resend verification email at this time.', variant: 'destructive'});
      return;
    }
    setIsResendingVerification(true);
    setFormError(null); 
    try {
      await sendEmailVerification(unverifiedUser);
      toast({
        title: 'Verification Email Sent',
        description: 'A new verification email has been sent to your address. Please check your inbox.',
      });
      setFormError(UNVERIFIED_EMAIL_ERROR_MESSAGE); 
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
          {formError && formError !== UNVERIFIED_EMAIL_ERROR_MESSAGE && (
            <FormAlert title="Error" message={formError} variant="destructive" />
          )}
          {formError === UNVERIFIED_EMAIL_ERROR_MESSAGE && unverifiedUser && (
            <EmailVerificationAlert
              message={UNVERIFIED_EMAIL_ERROR_MESSAGE}
              onResend={handleResendVerificationEmail}
              isResending={isResendingVerification}
              showResendButton={!!unverifiedUser}
            />
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
                    placeholder="om@example.com or omprakash24d"
                    {...field}
                    disabled={anyLoading}
                    autoComplete="username"
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
                  <PasswordInput
                    field={field}
                    placeholder="••••••••"
                    disabled={anyLoading}
                    autoComplete="current-password"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember-me"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              disabled={anyLoading}
            />
            <Label htmlFor="remember-me" className="text-sm font-normal">
              Remember me
            </Label>
          </div>
          <Button type="submit" className="w-full" disabled={anyLoading}>
            {(isLoading && !(unverifiedUser && !unverifiedUser.emailVerified)) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Sign In
          </Button>
        </form>
      </Form>
      <SocialLogins />
    </AuthFormWrapper>
  );
}
