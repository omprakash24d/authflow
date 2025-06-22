// src/components/auth/signin-form.tsx
// This component renders the sign-in form. It handles user input for email/username and password,
// validation, communication with Firebase for authentication, session creation via an API route,
// and manages UI states like loading and error messages.

'use client'; // Client component due to extensive state management, form handling, and effects.

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation'; // Next.js navigation hooks
import { 
  signInWithEmailAndPassword, 
  sendEmailVerification, 
  type User, // Firebase User type
  type UserCredential,
  fetchSignInMethodsForEmail,
  GoogleAuthProvider, // To check if user signed up with Google
  getMultiFactorResolver,
  type MultiFactorResolver,
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config'; // Firebase auth instance
import { SignInSchema, type SignInFormValues } from '@/lib/validators/auth'; // Zod schema for validation
import { getFirebaseAuthErrorMessage } from '@/lib/firebase/error-mapping'; // Maps Firebase error codes to user-friendly messages
import { AuthErrors, ApiErrors } from '@/lib/constants/messages'; // Centralized error messages

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AuthFormWrapper } from './auth-form-wrapper'; // Consistent wrapper for auth forms
import { SocialLogins } from './social-logins'; // Component for Google, GitHub, etc. sign-in
import { PasswordInput } from './password-input'; // Custom password input with show/hide toggle
import { EmailVerificationAlert } from './email-verification-alert'; // Alert for unverified emails
import { MfaVerificationDialog } from './mfa-verification-dialog'; // Dialog for MFA
import { FormAlert } from '@/components/ui/form-alert'; // Generic form-level alert
import { useToast } from '@/hooks/use-toast'; // Hook for toast notifications
import { Loader2 } from 'lucide-react'; // Icons

const REMEMBER_ME_STORAGE_KEY = 'authFlowRememberedIdentifier'; // localStorage key for "Remember Me"

/**
 * SignInForm component.
 * Handles the entire sign-in process, including form rendering, validation,
 * API calls, and user feedback.
 * @returns JSX.Element
 */
export function SignInForm() {
  // State variables
  const [isLoading, setIsLoading] = useState(false); // For general form submission loading
  const [isResendingVerification, setIsResendingVerification] = useState(false); // For "Resend Verification" loading
  const [formError, setFormError] = useState<string | null>(null); // For general form errors
  const [postSignUpMessage, setPostSignUpMessage] = useState<string | null>(null); // If redirected from sign-up
  const [unverifiedUser, setUnverifiedUser] = useState<User | null>(null); // Stores Firebase user if email is unverified
  const [rememberMe, setRememberMe] = useState(false); // State for "Remember Me" checkbox
  const [mfaResolver, setMfaResolver] = useState<MultiFactorResolver | null>(null);
  const [isMfaDialogOpen, setIsMfaDialogOpen] = useState(false);


  // Hooks
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // Initialize react-hook-form
  const form = useForm<SignInFormValues>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      identifier: '', // Can be email or username
      password: '',
    },
  });

  // Effect to check if redirected from sign-up with a 'verificationEmailSent' flag.
  useEffect(() => {
    if (searchParams.get('verificationEmailSent') === 'true') {
      setPostSignUpMessage("If you just signed up, please check your inbox and click the verification link to activate your account before signing in.");
      // Clean up the URL by removing the query parameter.
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete('verificationEmailSent');
      const newPath = newSearchParams.toString()
        ? `${pathname}?${newSearchParams.toString()}`
        : pathname;
      router.replace(newPath, { scroll: false }); // `replace` avoids adding to history
    }
  }, [searchParams, router, pathname]);

  // Effect to handle the "Remember Me" functionality on initial component mount.
  useEffect(() => {
    const rememberedIdentifier = localStorage.getItem(REMEMBER_ME_STORAGE_KEY);
    if (rememberedIdentifier) {
      form.setValue('identifier', rememberedIdentifier); // Pre-fill the form field
      setRememberMe(true); // Check the "Remember Me" box
    }
    // This effect should only run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  /**
   * Finalizes the sign-in process after all checks (including MFA) are complete.
   * Creates the server-side session and redirects the user.
   * @param user - The fully authenticated Firebase User object.
   * @param currentIdentifier - The identifier used for "Remember Me".
   */
  async function finalizeSignIn(user: User, currentIdentifier: string) {
    setIsLoading(true); // Show final loading state
    setFormError(null);

    try {
      // Create server-side session
      const idToken = await user.getIdToken();
      const response = await fetch('/api/auth/session-login', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        let errorData = { error: AuthErrors.sessionCreationError };
        // ... (error handling as before)
        throw new Error(errorData.error || 'Failed to create session.');
      }

      // Handle "Remember Me"
      if (rememberMe) {
        localStorage.setItem(REMEMBER_ME_STORAGE_KEY, currentIdentifier);
      } else {
        localStorage.removeItem(REMEMBER_ME_STORAGE_KEY);
      }

      toast({
        title: 'Signed In!',
        description: 'Welcome back!',
      });
      // Redirect to dashboard
      window.location.assign('/dashboard');

    } catch (error: any) {
      console.error("Sign In Finalization Error:", error);
      const errorMessage = error.message || AuthErrors.sessionCreationError;
      setFormError(errorMessage);
      toast({
        title: 'Sign In Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      setIsLoading(false); // Stop loading on finalization error
    }
  }

  /**
   * Main form submission handler.
   * Resolves identifier (if username) to email, then calls `signInWithEmailAndPassword`.
   * Handles MFA and other error states.
   * @param {SignInFormValues} values - The validated form values.
   */
  async function onSubmit(values: SignInFormValues) {
    setIsLoading(true);
    setFormError(null);
    setPostSignUpMessage(null);
    setUnverifiedUser(null);
    setMfaResolver(null);

    if (!auth) { 
      setFormError(AuthErrors.serviceUnavailable);
      toast({ title: 'Service Unavailable', description: AuthErrors.serviceUnavailable, variant: 'destructive' });
      setIsLoading(false);
      return;
    }

    try {
      let emailToUse = values.identifier;
      // If identifier doesn't contain '@', assume it's a username and try to fetch the email.
      if (!values.identifier.includes('@')) {
        const usernameLookupResponse = await fetch(`/api/auth/get-email-for-username?username=${encodeURIComponent(values.identifier)}`);
        if (!usernameLookupResponse.ok) {
          const errorData = await usernameLookupResponse.json().catch(() => ({}));
          const specificMessage = errorData.error || ApiErrors.invalidUserLookup;
          throw new Error(specificMessage);
        }
        const { email } = await usernameLookupResponse.json();
        if (!email) {
          throw new Error(AuthErrors.couldNotFindEmailForUsername);
        }
        emailToUse = email; // Use the fetched email for sign-in
      }
      
      const userCredential = await signInWithEmailAndPassword(auth, emailToUse, values.password);
      const firebaseUser = userCredential.user;

      if (firebaseUser && !firebaseUser.emailVerified) {
        setFormError(AuthErrors.unverifiedEmail);
        setUnverifiedUser(firebaseUser);
        toast({
          title: 'Email Not Verified',
          description: "Check your inbox for a verification link or use the resend option.",
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }
      
      // If sign-in is successful and no other checks fail, finalize it.
      await finalizeSignIn(firebaseUser, values.identifier);

    } catch (error: any) {
      console.error("Sign In Error (onSubmit):", error);
      
      if (auth && error.code === 'auth/multi-factor-auth-required') {
        const resolver = getMultiFactorResolver(auth, error);
        setMfaResolver(resolver);
        setIsMfaDialogOpen(true);
        setFormError(AuthErrors.mfaRequired);
        toast({
          title: 'Verification Required',
          description: AuthErrors.mfaRequired,
        });
        setIsLoading(false);
        return;
      }

      let errorMessage = error.code ? getFirebaseAuthErrorMessage(error.code) : error.message;
      
      if (auth && values.identifier && (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found')) {
         try {
            const emailToCheck = values.identifier.includes('@') ? values.identifier : (await (await fetch(`/api/auth/get-email-for-username?username=${encodeURIComponent(values.identifier)}`)).json()).email;
            if (emailToCheck) {
                const signInMethods = await fetchSignInMethodsForEmail(auth, emailToCheck);
                if (signInMethods.includes(GoogleAuthProvider.PROVIDER_ID)) {
                    errorMessage += " Tip: This email may be linked to Google Sign-In. Consider trying that method.";
                }
            }
        } catch (fetchMethodsError) {
          console.warn("Could not fetch sign in methods for email:", fetchMethodsError);
        }
      }
      
      if (errorMessage !== AuthErrors.unverifiedEmail) {
         setFormError(errorMessage);
         toast({
            title: 'Sign In Failed',
            description: errorMessage, 
            variant: 'destructive',
          });
      }
    }
    // Only set loading to false if we haven't entered an async flow like MFA
    if (!isMfaDialogOpen) {
      setIsLoading(false);
    }
  }

  /**
   * Handles resending the email verification link.
   */
  async function handleResendVerificationEmail() {
    if (!unverifiedUser || !auth) {
      toast({ title: 'Error', description: 'Cannot resend verification email at this time. Auth service or user details missing.', variant: 'destructive'});
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
      setFormError(AuthErrors.unverifiedEmail); 
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

  // Combined loading state for disabling form elements.
  const anyLoading = isLoading || isResendingVerification;

  return (
    <>
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
            {formError && formError !== AuthErrors.unverifiedEmail && (
              <FormAlert title="Error" message={formError} variant="destructive" />
            )}
            {formError === AuthErrors.unverifiedEmail && unverifiedUser && (
              <EmailVerificationAlert
                message={AuthErrors.unverifiedEmail}
                onResend={handleResendVerificationEmail}
                isResending={isResendingVerification}
                showResendButton={!!unverifiedUser}
              />
            )}
            {postSignUpMessage && (
              <FormAlert
                title="Verification Email Sent"
                message={postSignUpMessage}
                variant="success"
              />
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
                      placeholder="••••••••"
                      disabled={anyLoading}
                      autoComplete="current-password"
                      {...field}
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

            <Button type="submit" className="w-full" disabled={anyLoading || !auth}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Sign In
            </Button>
          </form>
        </Form>
        <SocialLogins />
      </AuthFormWrapper>

      <MfaVerificationDialog
        open={isMfaDialogOpen}
        onOpenChange={setIsMfaDialogOpen}
        resolver={mfaResolver}
        onVerify={(credential) => finalizeSignIn(credential.user, form.getValues('identifier'))}
      />
    </>
  );
}
