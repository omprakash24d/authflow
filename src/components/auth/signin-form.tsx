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
  fetchSignInMethodsForEmail,
  GoogleAuthProvider // To check if user signed up with Google
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config'; // Firebase auth instance
import { SignInSchema, type SignInFormValues } from '@/lib/validators/auth'; // Zod schema for validation
import { getFirebaseAuthErrorMessage } from '@/lib/firebase/error-mapping'; // Maps Firebase error codes to user-friendly messages

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AuthFormWrapper } from './auth-form-wrapper'; // Consistent wrapper for auth forms
import { SocialLogins } from './social-logins'; // Component for Google, GitHub, etc. sign-in
import { PasswordInput } from './password-input'; // Custom password input with show/hide toggle
import { EmailVerificationAlert } from './email-verification-alert'; // Alert for unverified emails
import { FormAlert } from '@/components/ui/form-alert'; // Generic form-level alert
import { useToast } from '@/hooks/use-toast'; // Hook for toast notifications
import { Loader2, MailCheck } from 'lucide-react'; // Icons

// Custom error message for unverified emails.
const UNVERIFIED_EMAIL_ERROR_MESSAGE = "Your email address is not verified. Please check your inbox for the verification link we sent you. If you don't see it, be sure to check your spam or junk folder. You can also click below to resend the verification link.";
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
  const [showVerificationMessageFromSignUp, setShowVerificationMessageFromSignUp] = useState(false); // If redirected from sign-up
  const [unverifiedUser, setUnverifiedUser] = useState<User | null>(null); // Stores Firebase user if email is unverified
  const [rememberMe, setRememberMe] = useState(false); // State for "Remember Me" checkbox

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

  // Effect to handle query params (e.g., from sign-up redirect) and "Remember Me" functionality.
  useEffect(() => {
    // Check if redirected from sign-up with a 'verificationEmailSent' flag.
    if (searchParams.get('verificationEmailSent') === 'true') {
      setShowVerificationMessageFromSignUp(true);
      // Clean up the URL by removing the query parameter.
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete('verificationEmailSent');
      const newPath = newSearchParams.toString()
        ? `${pathname}?${newSearchParams.toString()}`
        : pathname;
      router.replace(newPath, { scroll: false }); // `replace` avoids adding to history
    }

    // Check localStorage for a remembered identifier (email/username).
    const rememberedIdentifier = localStorage.getItem(REMEMBER_ME_STORAGE_KEY);
    if (rememberedIdentifier) {
      form.setValue('identifier', rememberedIdentifier); // Pre-fill the form field
      setRememberMe(true); // Check the "Remember Me" box
    }
  }, [searchParams, router, pathname, form, setShowVerificationMessageFromSignUp, setRememberMe]);


  /**
   * Core sign-in logic after email/username resolution.
   * Authenticates with Firebase, checks email verification, and creates a server session.
   * @param emailToUse - The resolved email address to use for sign-in.
   * @param passwordToUse - The password provided by the user.
   * @param currentIdentifier - The original identifier (email or username) entered by the user (for "Remember Me").
   */
  async function handleSignIn(emailToUse: string, passwordToUse: string, currentIdentifier: string) {
    if (!auth) { // Check if Firebase Auth service is available
        setFormError("Authentication service is not available. Sign-in failed.");
        toast({ title: 'Service Unavailable', description: "Authentication service is not available.", variant: 'destructive' });
        setIsLoading(false);
        throw new Error("Auth service unavailable"); 
    }
    // Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, emailToUse, passwordToUse); 
    const firebaseUser = userCredential.user;

    // Check if email is verified
    if (firebaseUser && !firebaseUser.emailVerified) {
      setFormError(UNVERIFIED_EMAIL_ERROR_MESSAGE); // Set specific error message
      setUnverifiedUser(firebaseUser); // Store the unverified user for resend option
      toast({
        title: 'Email Not Verified',
        description: "Check your inbox for a verification link or use the resend option.",
        variant: 'destructive',
      });
      setIsLoading(false); 
      return; // Stop the sign-in process
    }

    // If user is verified, proceed to create a server-side session.
    if (firebaseUser) {
      const idToken = await firebaseUser.getIdToken(); // Get Firebase ID token
      // Call API route to create an HTTP-only session cookie.
      const response = await fetch('/api/auth/session-login', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });

      if (!response.ok) { // Handle API errors
        let errorData = { error: 'Failed to create session. Server response not in expected format.' };
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            try {
                errorData = await response.json();
            } catch (jsonError) {
                console.error("Failed to parse JSON error response from /api/auth/session-login (SignInForm):", jsonError);
            }
        } else {
            const textResponse = await response.text();
            console.error("Non-JSON response from /api/auth/session-login (SignInForm):", textResponse);
            if (textResponse.length < 200) errorData.error = textResponse;
        }
        throw new Error(errorData.error || 'Failed to create session.');
      }
    }

    // Handle "Remember Me" functionality
    if (rememberMe) {
      localStorage.setItem(REMEMBER_ME_STORAGE_KEY, currentIdentifier);
    } else {
      localStorage.removeItem(REMEMBER_ME_STORAGE_KEY);
    }

    toast({
      title: 'Signed In!',
      description: 'Welcome back!',
    });
    // Redirect to dashboard using full page reload to ensure middleware and context are synced.
    window.location.assign('/dashboard');
  }


  /**
   * Main form submission handler.
   * Resolves identifier (if username) to email, then calls `handleSignIn`.
   * @param {SignInFormValues} values - The validated form values.
   */
  async function onSubmit(values: SignInFormValues) {
    setIsLoading(true);
    setFormError(null);
    setShowVerificationMessageFromSignUp(false);
    setUnverifiedUser(null);

    let emailToUse = values.identifier;

    if (!auth) { 
      setFormError("Authentication service is not available. Please try again later.");
      toast({ title: 'Service Unavailable', description: "Authentication service is not available.", variant: 'destructive' });
      setIsLoading(false);
      return;
    }

    try {
      // If identifier doesn't contain '@', assume it's a username and try to fetch the email.
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
        emailToUse = email; // Use the fetched email for sign-in
      }

      // Proceed with the core sign-in logic.
      await handleSignIn(emailToUse, values.password, values.identifier);

    } catch (error: any) {
      console.error("Sign In Error (onSubmit):", error);
      // Map Firebase error codes to user-friendly messages.
      let errorMessage = error.code ? getFirebaseAuthErrorMessage(error.code) : error.message;
      
      // If sign-in fails, check if the email is associated with a Google account as a hint.
      if (auth && emailToUse && (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found')) {
        try {
          const signInMethods = await fetchSignInMethodsForEmail(auth, emailToUse);
          if (signInMethods.includes(GoogleAuthProvider.PROVIDER_ID)) {
            errorMessage += " Tip: This email may be linked to Google Sign-In. Consider trying that method.";
          }
        } catch (fetchMethodsError) {
          // Non-critical error, just log it.
          console.warn("Could not fetch sign in methods for email:", emailToUse, fetchMethodsError);
        }
      }
      
      // Display the error message if it's not the specific unverified email message (handled by handleSignIn).
      if (errorMessage !== UNVERIFIED_EMAIL_ERROR_MESSAGE) {
         setFormError(errorMessage);
         toast({
            title: 'Sign In Failed',
            description: errorMessage, 
            variant: 'destructive',
          });
          setIsLoading(false); // Error occurred, stop loading indicator
      } else if (!unverifiedUser) {
        // This handles errors from handleSignIn if it didn't set unverifiedUser (e.g., session creation failed)
        // or if the error was somehow the UNVERIFIED_EMAIL_ERROR_MESSAGE but unverifiedUser wasn't set.
        setIsLoading(false);
      }
    }
  }

  /**
   * Handles resending the email verification link.
   */
  async function handleResendVerificationEmail() {
    if (!unverifiedUser || !auth) { // Ensure we have the user object and auth service
      toast({ title: 'Error', description: 'Cannot resend verification email at this time. Auth service or user details missing.', variant: 'destructive'});
      return;
    }
    setIsResendingVerification(true);
    setFormError(null); // Clear previous general form errors
    try {
      await sendEmailVerification(unverifiedUser);
      toast({
        title: 'Verification Email Sent',
        description: 'A new verification email has been sent to your address. Please check your inbox.',
      });
      // Keep the unverified email message visible or re-set it.
      setFormError(UNVERIFIED_EMAIL_ERROR_MESSAGE); 
    } catch (error: any) {
      console.error("Error resending verification email:", error);
      const errorMessage = getFirebaseAuthErrorMessage(error.code);
      setFormError(errorMessage); // Show specific error for resend failure
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
    <AuthFormWrapper
      title="Sign In to AuthFlow"
      description="Enter your credentials to access your account."
      footerContent={ // Link to sign-up page
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
          {/* Display general form errors (not unverified email error, handled by EmailVerificationAlert) */}
          {formError && formError !== UNVERIFIED_EMAIL_ERROR_MESSAGE && (
            <FormAlert title="Error" message={formError} variant="destructive" />
          )}
          {/* Display alert for unverified email and resend option */}
          {formError === UNVERIFIED_EMAIL_ERROR_MESSAGE && unverifiedUser && (
            <EmailVerificationAlert
              message={UNVERIFIED_EMAIL_ERROR_MESSAGE}
              onResend={handleResendVerificationEmail}
              isResending={isResendingVerification}
              showResendButton={!!unverifiedUser}
            />
          )}
          {/* Display message if redirected from sign-up after verification email was sent */}
          {showVerificationMessageFromSignUp && !formError && (
            <Alert variant="default" className="bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300">
              <MailCheck className="h-5 w-5 text-green-500 dark:text-green-400" />
              <AlertTitle className="font-semibold">Verification Email Sent During Sign Up</AlertTitle>
              <AlertDescription>
                If you just signed up, please check your inbox and click the verification link to activate your account before signing in.
              </AlertDescription>
            </Alert>
          )}

          {/* Form Fields */}
          <FormField
            control={form.control}
            name="identifier" // Email or Username
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email or Username</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="om@example.com or omprakash24d"
                    {...field}
                    disabled={anyLoading}
                    autoComplete="username" // Helps password managers
                  />
                </FormControl>
                <FormMessage /> {/* Field-specific validation errors */}
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
                  <PasswordInput // Custom password input with show/hide
                    placeholder="••••••••"
                    disabled={anyLoading}
                    autoComplete="current-password" // Helps password managers
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Remember Me Checkbox */}
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

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={anyLoading || !auth}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Sign In
          </Button>
        </form>
      </Form>
      <SocialLogins /> {/* Component for Google, GitHub, etc. sign-in options */}
    </AuthFormWrapper>
  );
}
