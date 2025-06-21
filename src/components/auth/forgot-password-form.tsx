'use client'; // Client component due to form handling and state.

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase/config'; // Firebase auth instance

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AuthFormWrapper } from '@/components/auth/auth-form-wrapper'; // Consistent wrapper for auth forms
import { FormAlert } from '@/components/ui/form-alert'; // Component to display form-level success/error messages
import { useToast } from '@/hooks/use-toast'; // Hook for displaying toast notifications
import { AuthErrors, SuccessMessages } from '@/lib/constants/messages'; // Centralized messages
import { Mail, Loader2 } from 'lucide-react'; // Icons

// Zod schema for forgot password form validation.
const ForgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }), // Validates email format
});

type ForgotPasswordFormValues = z.infer<typeof ForgotPasswordSchema>;

/**
 * ForgotPasswordForm component.
 * Provides a form for users to submit their email to receive a password reset link.
 * @returns JSX.Element
 */
export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false); // Manages loading state for form submission
  const [formError, setFormError] = useState<string | null>(null); // Stores general form error messages
  const { toast } = useToast(); // Hook for showing toast notifications

  // Initialize react-hook-form with Zod resolver for validation.
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  /**
   * Handles form submission.
   * Sends a password reset email using Firebase Authentication.
   * @param {ForgotPasswordFormValues} values - The validated form values.
   */
  async function onSubmit(values: ForgotPasswordFormValues) {
    setIsLoading(true);
    setFormError(null);

    if (!auth) {
      setFormError(AuthErrors.serviceUnavailable);
      toast({ title: 'Service Error', description: AuthErrors.serviceUnavailable, variant: 'destructive' });
      setIsLoading(false);
      return;
    }

    try {
      // Attempt to send password reset email via Firebase.
      await sendPasswordResetEmail(auth, values.email);
      
      // Use a toast notification for success feedback. This is more consistent with other forms.
      toast({
        title: 'Check Your Email',
        description: SuccessMessages.passwordResetEmailSent,
      });
      form.reset(); // Reset form fields on success for a clean state
    } catch (error: unknown) {
      // Handle errors from Firebase or other issues.
      if (error instanceof Error) {
        console.error('Password Reset Error:', error.message, (error as any).code);
      } else {
        console.error('Password Reset Error:', error);
      }
      // Note: For security, Firebase often doesn't throw errors for non-existent emails.
      // The success message accounts for this, so client-side errors are typically for other issues.
      const errorMessage = 'An error occurred. Please try again.';
      setFormError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthFormWrapper
      title="Forgot Your Password?"
      description="Enter your email address and we'll send you a link to reset your password."
      footerContent={ // Content for the footer of the form card
        <p>
          Remembered your password?{' '}
          <Link href="/signin" className="font-medium text-primary hover:underline">
            Sign In
          </Link>
        </p>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Display form-level error messages */}
          <FormAlert title="Error" message={formError} variant="destructive" />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <div className="relative"> {/* For positioning the icon inside the input */}
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input type="email" placeholder="abc@example.com" className="pl-10" {...field} disabled={isLoading} />
                  </div>
                </FormControl>
                <FormMessage /> {/* Displays validation errors for this field */}
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Send Reset Link
          </Button>
        </form>
      </Form>
    </AuthFormWrapper>
  );
}
