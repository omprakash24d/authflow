
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updatePassword } from 'firebase/auth';
// auth import no longer needed directly if user comes from useAuth()
import { ChangePasswordSchema, type ChangePasswordFormValues } from '@/lib/validators/auth';
import { getFirebaseAuthErrorMessage } from '@/lib/firebase/error-mapping';
import { reauthenticateCurrentUser } from '@/lib/firebase/auth-utils'; 
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
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
import { FormAlert } from '@/components/ui/form-alert'; // New import
import { PasswordInput } from '@/components/auth/password-input'; 
import { PasswordStrengthIndicator } from '@/components/auth/password-strength-indicator';
import { Loader2 } from 'lucide-react'; // Removed AlertTriangle

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const watchedNewPassword = form.watch('newPassword');

  async function onSubmit(values: ChangePasswordFormValues) {
    if (!user) { 
      setFormError('User not authenticated.');
      toast({ title: 'Error', description: 'User not authenticated.', variant: 'destructive'});
      return;
    }

    setIsLoading(true);
    setFormError(null);

    try {
      await reauthenticateCurrentUser(user, values.currentPassword); 
      await updatePassword(user, values.newPassword);

      toast({
        title: 'Password Updated',
        description: 'Your password has been changed successfully.',
      });
      form.reset();
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmNewPassword(false);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Change Password Error:', error);
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

  const handleDialogClose = (isOpen: boolean) => {
    if (!isOpen) {
      form.reset();
      setFormError(null);
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmNewPassword(false);
      setIsLoading(false);
    }
    onOpenChange(isOpen);
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
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <PasswordInput<ChangePasswordFormValues, "currentPassword">
                      field={field}
                      placeholder="••••••••"
                      disabled={isLoading}
                      showPasswordState={showCurrentPassword}
                      toggleShowPasswordState={() => setShowCurrentPassword(!showCurrentPassword)}
                      autoComplete="current-password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                     <PasswordInput<ChangePasswordFormValues, "newPassword">
                      field={field}
                      placeholder="••••••••"
                      disabled={isLoading}
                      showPasswordState={showNewPassword}
                      toggleShowPasswordState={() => setShowNewPassword(!showNewPassword)}
                      autoComplete="new-password"
                    />
                  </FormControl>
                  {watchedNewPassword && watchedNewPassword.length > 0 && (
                    <PasswordStrengthIndicator password={watchedNewPassword} />
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmNewPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <PasswordInput<ChangePasswordFormValues, "confirmNewPassword">
                      field={field}
                      placeholder="••••••••"
                      disabled={isLoading}
                      showPasswordState={showConfirmNewPassword}
                      toggleShowPasswordState={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                      autoComplete="new-password"
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
