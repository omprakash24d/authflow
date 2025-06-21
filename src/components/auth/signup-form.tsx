// src/components/auth/signup-form.tsx
// This component renders the sign-up form. It handles user input for registration details,
// validation, AI-powered password breach checking, interaction with Firebase for account creation
// and email verification, and saving user profile data to Firestore.

'use client'; // Client component due to extensive state, form handling, and effects.

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from 'firebase/auth';
import { auth, firestore } from '@/lib/firebase/config'; // Firebase auth and firestore instances
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'; // Firestore functions
import { SignUpSchema, type SignUpFormValues } from '@/lib/validators/auth'; // Zod schema for validation
import { checkPasswordBreach } from '@/ai/flows/password-breach-detector'; // AI flow for password check
import { getFirebaseAuthErrorMessage } from '@/lib/firebase/error-mapping'; // Maps Firebase errors to messages
import { AuthErrors } from '@/lib/constants/messages'; // Centralized error messages

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AuthFormWrapper } from './auth-form-wrapper'; // Consistent wrapper for auth forms
import { PasswordInput } from './password-input'; // Custom password input
import { PasswordStrengthIndicator } from './password-strength-indicator'; // Password strength UI
import { SocialLogins } from './social-logins'; // Social login options
import { PasswordBreachDialog } from './password-breach-dialog'; // Dialog for breached password warning
import { FormAlert } from '@/components/ui/form-alert'; // General form alert
import { useToast } from '@/hooks/use-toast'; // Hook for toast notifications
import { Loader2, User, UserCheck } from 'lucide-react'; // Loading icon

/**
 * SignUpForm component.
 * Handles the user registration process, including form input, validation,
 * password security checks, Firebase account creation, and profile setup.
 * @returns JSX.Element
 */
export function SignUpForm() {
  // State variables
  const [isLoading, setIsLoading] = useState(false); // Manages loading state for form submission
  const [formError, setFormError] = useState<string | null>(null); // Stores general form error messages
  // Stores details if a password breach is detected, to show a warning dialog
  const [breachWarning, setBreachWarning] = useState<{ count: number; formValues: SignUpFormValues } | null>(null);

  // Hooks
  const router = useRouter();
  const { toast } = useToast();
  const passwordInputRef = useRef<HTMLInputElement | null>(null); // Ref to focus password input after breach warning

  // Initialize react-hook-form
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      termsAccepted: false,
    },
  });

  // Watch the password field to update the strength indicator dynamically
  const watchedPassword = form.watch('password');

  /**
   * Core registration logic: creates user in Firebase Auth, updates profile,
   * saves data to Firestore, and sends verification email.
   * @param {SignUpFormValues} registrationValues - The validated form values.
   */
  async function executeRegistration(registrationValues: SignUpFormValues) {
    setIsLoading(true);
    setFormError(null);

    // Check if Firebase Auth service is available
    if (!auth) {
      setFormError(AuthErrors.serviceUnavailable);
      toast({ title: 'Service Unavailable', description: AuthErrors.serviceUnavailable, variant: 'destructive' });
      setIsLoading(false);
      return;
    }

    try {
      // Create user with email and password in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, registrationValues.email, registrationValues.password);
      const user = userCredential.user;

      // Update Firebase Auth user profile with username (displayName)
      await updateProfile(user, {
        displayName: registrationValues.username,
      });

      // If Firestore is available, save additional user details
      if (firestore) {
        try {
            // Create a document in 'usernames' collection to map username to UID and email (for username login)
            const usernameDocRef = doc(firestore, 'usernames', registrationValues.username.toLowerCase());
            await setDoc(usernameDocRef, {
              uid: user.uid,
              email: user.email, // Store email for potential lookup
              username: registrationValues.username, // Store the cased username for display purposes
              createdAt: serverTimestamp(), // Timestamp of creation
            });

            // Create/update a document in 'users' collection with detailed profile information
            const userProfileDocRef = doc(firestore, 'users', user.uid);
            await setDoc(userProfileDocRef, {
                firstName: registrationValues.firstName,
                lastName: registrationValues.lastName,
                email: user.email,
                username: registrationValues.username,
                photoURL: user.photoURL, // Initially null, but good practice to include
                createdAt: serverTimestamp(),
            }, { merge: true }); // Merge true to avoid overwriting existing fields if any
        } catch (dbError: any) {
            // Handle Firestore errors gracefully; account creation still succeeded
            console.error("Firestore error during sign up:", dbError);
            toast({
                title: "Profile Save Warning",
                description: "Your account was created, but there was an issue saving profile details to the database. You can update them in your account settings.",
                variant: "default", 
                duration: 7000,
            });
        }
      } else {
        // Firestore not available, inform user
        console.warn("Firestore client not available, skipping username/profile document creation.");
        toast({
            title: "Firestore Unavailable",
            description: "Your account was created, but profile details could not be saved to the database at this time. Please try updating them in your settings later.",
            variant: "default",
            duration: 7000,
        });
      }

      // Send email verification to the newly created user
      await sendEmailVerification(user);
      toast({
        title: 'Account Created!',
        description: 'A verification email has been sent. Please check your inbox.',
      });
      // Redirect to sign-in page with a flag to show a message about email verification
      router.push('/signin?verificationEmailSent=true');

    } catch (error: any) {
      // Handle errors from Firebase Auth or other issues during registration
      console.error("Registration Error:", error);
      let errorMessage = getFirebaseAuthErrorMessage(error.code); // Get user-friendly message
      // Specific handling for Firestore permission errors if they occur despite Auth success
      if (error.code === 'firestore/permission-denied' || (error.message && error.message.toLowerCase().includes('permission denied'))) {
        errorMessage = 'Account created, but failed to save username/profile due to database permissions. Please contact support or check your Firestore security rules.';
      }
      setFormError(errorMessage);
       toast({
        title: 'Sign Up Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Main form submission handler.
   * First checks password for breaches, then proceeds with registration.
   * @param {SignUpFormValues} values - The validated form values.
   */
  async function onSubmit(values: SignUpFormValues) {
    setIsLoading(true);
    setFormError(null);
    setBreachWarning(null); // Reset breach warning

    try {
      // Check if the chosen password has been breached using the AI flow
      const breachResult = await checkPasswordBreach({ password: values.password });
      if (breachResult.isBreached && (breachResult.breachCount || 0) > 0) {
        // If breached, show a warning dialog instead of proceeding immediately
        setBreachWarning({ count: breachResult.breachCount || 0, formValues: values });
        setIsLoading(false);
        return; // Stop and wait for user decision from dialog
      }
      // If not breached (or no breach check configured/error), proceed with registration
      await executeRegistration(values);
    } catch (error: any) {
      // Handle errors from the password breach check itself (e.g., API issues)
      console.error("Error during pre-registration checks (e.g., password breach):", error);
      const breachCheckErrorMsg = getFirebaseAuthErrorMessage(error.code) || "Could not verify password security. Please try again.";
      setFormError(breachCheckErrorMsg);
      toast({
        title: 'Security Check Failed',
        description: breachCheckErrorMsg,
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  }

  // Handler for when user decides to proceed despite password breach warning
  const handleProceedWithBreachedPassword = () => {
    if (breachWarning?.formValues) {
      executeRegistration(breachWarning.formValues); // Proceed with the stored form values
    }
    setBreachWarning(null); // Close the dialog
  };

  // Handler for when user decides to choose a new password after breach warning
  const handleChooseNewPassword = () => {
    setBreachWarning(null); // Close the dialog
    form.setValue('password', ''); // Clear password fields
    form.setValue('confirmPassword', '');
    // Focus the password input for convenience
    passwordInputRef.current?.focus();
    toast({
        title: 'Choose a New Password',
        description: 'Please enter a new, secure password.',
    });
  };

  // Handler for when the breach dialog's open state changes (e.g., closed via Esc or overlay click)
  const handleBreachDialogOnOpenChange = (isOpen: boolean) => {
    if (!isOpen && breachWarning) {
      // If dialog is closed without explicit action (Proceed/ChooseNew), default to "Choose New" behavior
      handleChooseNewPassword();
    } else if (!isOpen) {
      // General close without active warning
      setBreachWarning(null);
    }
  }

  return (
    <AuthFormWrapper
      title="Create an Account"
      description="Enter your details below to get started."
      footerContent={ // Link to sign-in page
        <p>
          Already have an account?{' '}
          <Link href="/signin" className="font-medium text-primary hover:underline">
            Sign In
          </Link>
        </p>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormAlert title="Error" message={formError} variant="destructive" />
          
          {/* Name Fields */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input placeholder="Om" {...field} disabled={isLoading} autoComplete="given-name" className="pl-10" />
                    </div>
                  </FormControl>
                  <FormMessage /> {/* Field-specific validation errors */}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input placeholder="Prakash" {...field} disabled={isLoading} autoComplete="family-name" className="pl-10" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Username Field */}
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                   <div className="relative">
                      <UserCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input placeholder="omprakash24d" {...field} disabled={isLoading} autoComplete="username" className="pl-10" />
                    </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="om@gmail.com" {...field} disabled={isLoading} autoComplete="email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password Field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                        placeholder="••••••••"
                        disabled={isLoading}
                        autoComplete="new-password"
                        {...field}
                        ref={passwordInputRef}
                    />
                  </FormControl>
                  {/* Display password strength indicator if password has input */}
                  {watchedPassword && watchedPassword.length > 0 && (
                    <PasswordStrengthIndicator password={watchedPassword} />
                  )}
                  <FormMessage />
                </FormItem>
              )
            }
          />

          {/* Confirm Password Field */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder="••••••••"
                    disabled={isLoading}
                    autoComplete="new-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Terms and Conditions Checkbox */}
          <FormField
            control={form.control}
            name="termsAccepted"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-label="Accept terms and conditions"
                    disabled={isLoading}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-normal">
                    I agree to the{' '}
                    <Link href="/terms-of-service" className="font-medium text-primary hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy-policy" className="font-medium text-primary hover:underline">
                      Privacy Policy
                    </Link>
                    .
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isLoading || !auth}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Sign Up
          </Button>
        </form>
      </Form>
      <SocialLogins /> {/* Social login options */}

      {/* Password Breach Dialog (conditionally rendered) */}
      {breachWarning && (
        <PasswordBreachDialog
          isOpen={breachWarning !== null}
          breachCount={breachWarning.count}
          onProceed={handleProceedWithBreachedPassword}
          onChooseNew={handleChooseNewPassword}
          onOpenChange={handleBreachDialogOnOpenChange}
        />
      )}
    </AuthFormWrapper>
  );
}
