// src/components/dashboard/settings/change-email-dialog.tsx
// This component provides a dialog for users to change their email address.
// It requires password re-authentication and sends a verification link to the new email.

'use client'; // Client component due to form handling, state, and Firebase interactions.

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { verifyBeforeUpdateEmail } from 'firebase/auth'; // Firebase function to update email with verification
import { firestore } from '@/lib/firebase/config'; // Firestore instance
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'; // Firestore functions
import { ChangeEmailSchema, type ChangeEmailFormValues } from '@/lib/validators/auth'; // Zod schema for validation
import { getFirebaseAuthErrorMessage } from '@/lib/firebase/error-mapping'; // Maps Firebase errors to messages
import { reauthenticateCurrentUser } from '@/lib/firebase/auth-utils'; // Utility for re-authentication
import { useAuth } from '@/contexts/auth-context'; // Hook to access authenticated user
import { useToast } from '@/hooks/use-toast'; // Hook for toast notifications
import { AuthErrors, ProfileErrors, ValidationErrors } from '@/lib/constants/messages';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { PasswordInput } from '@/components/auth/password-input'; // Use consistent password input
import { Loader2, Mail } from 'lucide-react'; // Icons

/**
 * Props for the ChangeEmailDialog component.
 * @property open - Boolean to control the visibility of the dialog.
 * @property onOpenChange - Callback function to handle changes in the dialog's open state.
 */
interface ChangeEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * ChangeEmailDialog component.
 * A modal dialog form for users to update their email address.
 * Requires current password for re-authentication.
 * @param {ChangeEmailDialogProps} props - The component's props.
 * @returns JSX.Element
 */
export function ChangeEmailDialog({ open, onOpenChange }: ChangeEmailDialogProps) {
  const { user } = useAuth(); // Get current Firebase user from context
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false); // Loading state for form submission
  const [formError, setFormError] = useState<string | null>(null); // For displaying form-level errors

  // Determine if the user has a password provider. This action is only available for password-based accounts.
  const hasPasswordProvider = useMemo(() => {
    return user?.providerData.some(p => p.providerId === 'password');
  }, [user]);

  // Initialize react-hook-form with Zod resolver
  const form = useForm<ChangeEmailFormValues>({
    resolver: zodResolver(ChangeEmailSchema),
    defaultValues: {
      currentPassword: '',
      newEmail: '',
    },
  });

  /**
   * Handles form submission for changing the email.
   * 1. Re-authenticates the user with their current password.
   * 2. Calls Firebase to send a verification link to the new address.
   * 3. Updates Firestore to note the pending email change (optional, for record-keeping).
   * @param {ChangeEmailFormValues} values - The validated form values.
   */
  async function onSubmit(values: ChangeEmailFormValues) {
    if (!user) { 
      setFormError(AuthErrors.userNotAuthenticated);
      toast({ title: "Error", description: AuthErrors.userNotAuthenticated, variant: "destructive" });
      return;
    }
    if (!firestore) {
      setFormError(ProfileErrors.dbServiceUnavailable);
      toast({ title: "Configuration Error", description: "Database service unavailable.", variant: "destructive" });
      setIsLoading(false);
      return;
    }
    if (!hasPasswordProvider) {
      setFormError("This action is not available for accounts created via social sign-in.");
      return;
    }

    if (values.newEmail.toLowerCase() === user.email?.toLowerCase()) {
      form.setError('newEmail', { type: 'manual', message: ValidationErrors.newEmailSameAsCurrent });
      return;
    }

    setIsLoading(true);
    setFormError(null);

    try {
      await reauthenticateCurrentUser(user, values.currentPassword); 
      await verifyBeforeUpdateEmail(user, values.newEmail);

      const userProfileRef = doc(firestore, 'users', user.uid);
      await setDoc(userProfileRef,
        {
          emailChangePendingTo: values.newEmail, 
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );
      
      toast({
        title: 'Verification Email Sent',
        description: `A verification email has been sent to ${values.newEmail}. Please check your inbox and verify to complete the email change. Your current email remains active until then.`,
        duration: 9000,
      });

      handleDialogClose(false);
    } catch (error: any) {
      console.error('Change Email Error:', error);
      const errorMessage = getFirebaseAuthErrorMessage(error.code || (error.message.includes("User not found") ? 'auth/user-not-found' : undefined));
      setFormError(errorMessage);
      toast({
        title: 'Error Changing Email',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleDialogClose = (isOpen: boolean) => {
    if (!isOpen) {
      form.reset();
      setFormError(null);
      setIsLoading(false);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Email Address</DialogTitle>
          <DialogDescription>
            {hasPasswordProvider
              ? "Enter your current password and your new email address. A verification link will be sent to your new email."
              : "This action requires a password and is not available for accounts created via social sign-in."
            }
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <FormAlert title="Error" message={formError} variant="destructive" />
            
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                        placeholder="••••••••"
                        disabled={isLoading || !hasPasswordProvider}
                        autoComplete="current-password"
                        {...field}
                      />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Email Address</FormLabel>
                  <FormControl>
                     <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input type="email" placeholder="new.email@example.com" className="pl-10" {...field} disabled={isLoading || !hasPasswordProvider} autoComplete="email" />
                      </div>
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
              <Button type="submit" disabled={isLoading || !firestore || !hasPasswordProvider}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Verification Email
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
