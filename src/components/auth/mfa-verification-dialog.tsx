// src/components/auth/mfa-verification-dialog.tsx
// This component provides a dialog for users to enter their TOTP code
// during the sign-in process when MFA is required.

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type MultiFactorResolver, TotpMultiFactorGenerator, type UserCredential } from 'firebase/auth';
import { MfaVerificationSchema, type MfaVerificationFormValues } from '@/lib/validators/auth';
import { getFirebaseAuthErrorMessage } from '@/lib/firebase/error-mapping';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FormAlert } from '@/components/ui/form-alert';
import { Loader2 } from 'lucide-react';

interface MfaVerificationDialogProps {
  open: boolean;
  resolver: MultiFactorResolver | null;
  onVerify: (userCredential: UserCredential) => void;
  onOpenChange: (open: boolean) => void;
}

export function MfaVerificationDialog({ open, resolver, onVerify, onOpenChange }: MfaVerificationDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<MfaVerificationFormValues>({
    resolver: zodResolver(MfaVerificationSchema),
    defaultValues: { code: '' },
  });

  const onSubmit = async (values: MfaVerificationFormValues) => {
    if (!resolver) {
      setFormError('Authentication session expired. Please try signing in again.');
      return;
    }

    setIsLoading(true);
    setFormError(null);

    try {
      const multiFactorAssertion = TotpMultiFactorGenerator.assertionForSignIn(values.code);
      const userCredential = await resolver.resolveSignIn(multiFactorAssertion);
      toast({ title: 'Verification Successful!', description: 'You are now signed in.' });
      onVerify(userCredential);
      handleDialogClose(false);
    } catch (error: any) {
      console.error('MFA Verification Error:', error);
      const errorMessage = getFirebaseAuthErrorMessage(error.code);
      setFormError(errorMessage);
      toast({ title: 'Verification Failed', description: errorMessage, variant: 'destructive' });
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Two-Factor Authentication</DialogTitle>
          <DialogDescription>
            Enter the 6-digit code from your authenticator app to complete sign-in.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <FormAlert title="Error" message={formError} variant="destructive" />
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="123456"
                      {...field}
                      disabled={isLoading}
                      autoComplete="one-time-code"
                      maxLength={6}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleDialogClose(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify & Sign In
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
