// src/components/dashboard/settings/change-password-dialog.tsx
// This component provides a dialog for users to change their password.
// It requires re-authentication with the current password before updating to a new one.

'use client'; // Client component due to form handling, state, and Firebase interactions.

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updatePassword } from 'firebase/auth'; // Firebase function to update password
import { ChangePasswordSchema, type ChangePasswordFormValues } from '@/lib/validators/auth'; // Zod schema for validation
import { getFirebaseAuthErrorMessage } from '@/lib/firebase/error-mapping'; // Maps Firebase errors to messages
import { reauthenticateCurrentUser } from '@/lib/firebase/auth-utils'; // Utility for re-authentication
import { useAuth } from '@/contexts/auth-context'; // Hook to access authenticated user
import { useToast } from '@/hooks/use-toast'; // Hook for toast notifications
import { AuthErrors } from '@/lib/constants/messages';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'; // ShadCN Dialog components
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FormAlert } from '@/components/ui/form-alert'; // For displaying form-level errors
import { PasswordInput } from '@/components/auth/password-input'; // Custom password input with show/hide
import { PasswordStrengthIndicator } from '@/components/auth/password-strength-indicator'; // UI for password strength
import { Loader2 } from 'lucide-react'; // Loading icon

/**
 * Props for the ChangePasswordDialog component.
 * @property open - Boolean to control the visibility of the dialog.
 * @property onOpenChange - Callback function to handle changes in the dialog's open state.
 */
interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * ChangePasswordDialog component.
 * A modal dialog form for users to update their password.
 * Requires current password for re-authentication and validates new password strength.
 * @param {ChangePasswordDialogProps} props - The component's props.
 * @returns JSX.Element
 */
export function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
  const { user } = useAuth(); // Get current Firebase user from context
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false); // Loading state for form submission
  const [formError, setFormError] = useState<string | null>(null); // For displaying form-level errors

  // Initialize react-hook-form with Zod resolver
  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  // Watch the new password field to update the strength indicator dynamically
  const watchedNewPassword = form.watch('newPassword');

  /**
   * Handles form submission for changing the password.
   * 1. Re-authenticates the user with their current password.
   * 2. Updates the password in Firebase Authentication.
   * @param {ChangePasswordFormValues} values - The validated form values.
   */
  async function onSubmit(values: ChangePasswordFormValues) {
    // Ensure user is authenticated
    if (!user) { 
      setFormError(AuthErrors.userNotAuthenticated);
      toast({ title: 'Error', description: AuthErrors.userNotAuthenticated, variant: 'destructive'});
      return;
    }

    setIsLoading(true);
    setFormError(null);

    try {
      // Step 1: Re-authenticate the user with their current password.
      // This is a security measure required by Firebase for sensitive operations.
      await reauthenticateCurrentUser(user, values.currentPassword); 
      
      // Step 2: Update the password in Firebase Authentication.
      await updatePassword(user, values.newPassword);

      toast({
        title: 'Password Updated',
        description: 'Your password has been changed successfully.',
      });
      form.reset(); // Reset form fields
      onOpenChange(false); // Close the dialog
    } catch (error: any) {
      console.error('Change Password Error:', error);
      // Map Firebase error codes to user-friendly messages.
      const errorMessage = getFirebaseAuthErrorMessage(error.code || (error.message.includes("User not found") ? 'auth/user-not-found' : undefined));
      setFormError(errorMessage);
      toast({
        title: 'Error Changing Password',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Handles closing the dialog. Resets form and state.
   * @param {boolean} isOpen - The new open state of the dialog.
   */
  const handleDialogClose = (isOpen: boolean) => {
    if (!isOpen) { // If dialog is being closed
      form.reset();
      setFormError(null);
      setIsLoading(false); // Ensure loading is reset
    }
    onOpenChange(isOpen); // Propagate open state change
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Enter your current password and a new password. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <FormAlert title="Error" message={formError} variant="destructive" />
            
            {/* Current Password Field */}
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="••••••••"
                      disabled={isLoading}
                      autoComplete="current-password" // Helps password managers
                      {...field}
                    />
                  </FormControl>
                  <FormMessage /> {/* Field-specific validation errors */}
                </FormItem>
              )}
            />

            {/* New Password Field */}
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                     <PasswordInput
                      placeholder="••••••••"
                      disabled={isLoading}
                      autoComplete="new-password" // Helps password managers
                      {...field}
                    />
                  </FormControl>
                  {/* Display password strength indicator if new password has input */}
                  {watchedNewPassword && watchedNewPassword.length > 0 && (
                    <PasswordStrengthIndicator password={watchedNewPassword} />
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirm New Password Field */}
            <FormField
              control={form.control}
              name="confirmNewPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
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
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isLoading}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
