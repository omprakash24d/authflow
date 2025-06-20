
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EmailAuthProvider, reauthenticateWithCredential, verifyBeforeUpdateEmail } from 'firebase/auth';
import { auth, firestore } from '@/lib/firebase/config'; // Added firestore
import { doc, setDoc } from 'firebase/firestore'; // Added for Firestore updates
import { ChangeEmailSchema, type ChangeEmailFormValues } from '@/lib/validators/auth';
import { getFirebaseAuthErrorMessage } from '@/lib/firebase/error-mapping';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';

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
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertTriangle, Eye, EyeOff, Mail } from 'lucide-react';

interface ChangeEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangeEmailDialog({ open, onOpenChange }: ChangeEmailDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const form = useForm<ChangeEmailFormValues>({
    resolver: zodResolver(ChangeEmailSchema),
    defaultValues: {
      currentPassword: '',
      newEmail: '',
    },
  });

  async function onSubmit(values: ChangeEmailFormValues) {
    if (!user || !user.email) {
      setFormError('User not found or current email is missing.');
      toast({ title: "Error", description: "User not found or current email is missing.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setFormError(null);

    try {
      const credential = EmailAuthProvider.credential(user.email, values.currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // User re-authenticated, now verify and update email
      await verifyBeforeUpdateEmail(user, values.newEmail);

      // Optionally, update the email in Firestore `users/{uid}` document with a pending status
      // or wait for a Cloud Function triggered by Auth email change event.
      // For now, we inform the user and encourage them to verify.
      // A more robust solution might also update the 'usernames' collection if it stores emails.
      if (firestore) {
        const userProfileRef = doc(firestore, 'users', user.uid);
        await setDoc(userProfileRef, 
          { 
            email: user.email, // Keep old email until verified, or new one if strategy dictates
            emailChangePendingTo: values.newEmail, // Indicate pending change
            updatedAt: new Date() // Or serverTimestamp
          }, 
          { merge: true }
        );
      }

      toast({
        title: 'Verification Email Sent',
        description: `A verification email has been sent to ${values.newEmail}. Please check your inbox and verify to complete the email change. Your current email remains active until then.`,
        duration: 9000, // Longer duration for this important message
      });
      
      form.reset();
      onOpenChange(false); // Close the dialog
    } catch (error: any) {
      console.error('Change Email Error:', error);
      const errorMessage = getFirebaseAuthErrorMessage(error.code);
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
      setShowCurrentPassword(false); // Reset password visibility
      setIsLoading(false); // Ensure loading state is reset
    }
    onOpenChange(isOpen);
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
            {formError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showCurrentPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        {...field}
                        disabled={isLoading}
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
                        <Input type="email" placeholder="new.email@example.com" className="pl-10" {...field} disabled={isLoading} />
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
              <Button type="submit" disabled={isLoading}>
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
