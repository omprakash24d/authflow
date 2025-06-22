// src/components/dashboard/settings/mfa-unenroll-dialog.tsx
// This component provides a dialog for users to disable Two-Factor Authentication (2FA/MFA).
// It requires password re-authentication for security.

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { reauthenticateCurrentUser } from '@/lib/firebase/auth-utils';
import { getFirebaseAuthErrorMessage } from '@/lib/firebase/error-mapping';
import { ValidationErrors, AuthErrors } from '@/lib/constants/messages';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { PasswordInput } from '@/components/auth/password-input';
import { FormAlert } from '@/components/ui/form-alert';
import { Loader2 } from 'lucide-react';

// Schema for the password confirmation form
const UnenrollMfaSchema = z.object({
  password: z.string().min(1, ValidationErrors.passwordRequired),
});
type UnenrollMfaFormValues = z.infer<typeof UnenrollMfaSchema>;

interface MfaUnenrollDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function MfaUnenrollDialog({ open, onOpenChange, onSuccess }: MfaUnenrollDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<UnenrollMfaFormValues>({
    resolver: zodResolver(UnenrollMfaSchema),
    defaultValues: { password: '' },
  });

  const onSubmit = async (values: UnenrollMfaFormValues) => {
    if (!user) {
      setFormError(AuthErrors.userNotAuthenticated);
      return;
    }
    const mfaFactor = user.multiFactor?.enrolledFactors?.[0];
    if (!mfaFactor) {
      setFormError(AuthErrors.mfaNotEnrolled);
      return;
    }

    setIsLoading(true);
    setFormError(null);

    try {
      await reauthenticateCurrentUser(user, values.password);
      await user.multiFactor.unenroll(mfaFactor);

      toast({
        title: '2FA Disabled',
        description: 'Two-Factor Authentication has been successfully disabled for your account.',
      });
      onSuccess();
      handleDialogClose(false);
    } catch (error: any) {
      console.error('MFA Unenrollment Error:', error);
      const errorMessage = getFirebaseAuthErrorMessage(error.code);
      setFormError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
          <DialogDescription>
            This action will remove the extra layer of security from your account. Please enter your password to confirm.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormAlert title="Error" message={formError} variant="destructive" />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="••••••••"
                      {...field}
                      disabled={isLoading}
                      autoComplete="current-password"
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
              <Button type="submit" variant="destructive" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Disable 2FA
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
