// src/components/dashboard/settings/change-email-dialog.tsx
// This component provides a dialog for users to change their email address.
// It requires password re-authentication and sends a verification link to the new email.

'use client'; // Client component due to form handling, state, and Firebase interactions.

import { useState } from 'react';
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
import { Loader2, Eye, EyeOff, Mail } from 'lucide-react'; // Icons

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
  const [showCurrentPassword, setShowCurrentPassword] = useState(false); // Toggle visibility of current password

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
    // Ensure user is authenticated
    if (!user) { 
      setFormError('User not authenticated.');
      toast({ title: "Error", description: "User not authenticated.", variant: "destructive" });
      return;
    }
    // Ensure Firestore service is available for updating user profile records
     if (!firestore) {
      setFormError('Database service is not available. Cannot update email profile data.');
      toast({ title: "Configuration Error", description: "Database service unavailable.", variant: "destructive" });
      setIsLoading(false); // Reset loading state
      return;
    }

    // Prevent user from "changing" to the same email address.
    if (values.newEmail.toLowerCase() === user.email?.toLowerCase()) {
      setFormError("The new email address cannot be the same as your current one.");
      return;
    }

    setIsLoading(true);
    setFormError(null);

    try {
      // Step 1: Re-authenticate the user with their current password.
      // This is a security measure required by Firebase for sensitive operations.
      await reauthenticateCurrentUser(user, values.currentPassword); 
      
      // Step 2: Initiate email update process with Firebase.
      // This sends a verification link to the new email address. The email is not
      // actually changed in Firebase Auth until the user clicks this link.
      await verifyBeforeUpdateEmail(user, values.newEmail);

      // Step 3 (Optional but good practice): Update user's profile in Firestore
      // to reflect that an email change is pending.
      // `firestore` is confirmed non-null by the check above.
      const userProfileRef = doc(firestore, 'users', user.uid);
      await setDoc(userProfileRef,
        {
          // `email` field in Firestore might remain the old one until verification.
          // Or, store the new email in a separate field like `emailChangePendingTo`.
          emailChangePendingTo: values.newEmail, 
          updatedAt: serverTimestamp() // Timestamp the update
        },
        { merge: true } // Merge to avoid overwriting other profile data
      );
      
      toast({
        title: 'Verification Email Sent',
        description: `A verification email has been sent to ${values.newEmail}. Please check your inbox and verify to complete the email change. Your current email remains active until then.`,
        duration: 9000, // Longer duration for important messages
      });

      form.reset(); // Reset form fields
      onOpenChange(false); // Close the dialog
    } catch (error: any) {
      console.error('Change Email Error:', error);
      // Map Firebase error codes to user-friendly messages.
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

  /**
   * Handles closing the dialog. Resets form and state.
   * @param {boolean} isOpen - The new open state of the dialog.
   */
  const handleDialogClose = (isOpen: boolean) => {
    if (!isOpen) { // If dialog is being closed
      form.reset();
      setFormError(null);
      setShowCurrentPassword(false);
      setIsLoading(false); // Ensure loading is reset
    }
    onOpenChange(isOpen); // Propagate open state change
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Email Address</DialogTitle>
          <DialogDescription>
            Enter your current password and your new email address. A verification link will be sent to your new email.
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
                    <div className="relative"> {/* For password visibility toggle */}
                      <Input
                        type={showCurrentPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        {...field}
                        disabled={isLoading}
                        autoComplete="current-password"
                      />
                       <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                        disabled={isLoading}
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage /> {/* Field-specific validation errors */}
                </FormItem>
              )}
            />

            {/* New Email Field */}
            <FormField
              control={form.control}
              name="newEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Email Address</FormLabel>
                  <FormControl>
                     <div className="relative"> {/* For email icon */}
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input type="email" placeholder="new.email@example.com" className="pl-10" {...field} disabled={isLoading} autoComplete="email" />
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
              <Button type="submit" disabled={isLoading || !firestore}> {/* Disable if loading or Firestore unavailable */}
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
