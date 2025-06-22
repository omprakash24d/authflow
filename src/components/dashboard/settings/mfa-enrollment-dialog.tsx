// src/components/dashboard/settings/mfa-enrollment-dialog.tsx
// This component provides a dialog for users to enroll in Two-Factor Authentication (2FA/MFA)
// using a TOTP (Time-based One-Time Password) authenticator app.

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import QRCode from 'qrcode';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TotpMultiFactorGenerator, type TotpSecret } from 'firebase/auth';

import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { MfaVerificationSchema, type MfaVerificationFormValues } from '@/lib/validators/auth';
import { getFirebaseAuthErrorMessage } from '@/lib/firebase/error-mapping';
import { AuthErrors } from '@/lib/constants/messages';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FormAlert } from '@/components/ui/form-alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Copy, Check } from 'lucide-react';

interface MfaEnrollmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function MfaEnrollmentDialog({ open, onOpenChange, onSuccess }: MfaEnrollmentDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [totpSecret, setTotpSecret] = useState<TotpSecret | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [isKeyCopied, setIsKeyCopied] = useState(false);

  const form = useForm<MfaVerificationFormValues>({
    resolver: zodResolver(MfaVerificationSchema),
    defaultValues: { code: '' },
  });

  useEffect(() => {
    const generateSecretAndQrCode = async () => {
      if (open && user) {
        setIsLoading(true);
        setFormError(null);

        // FIX: Check if user.multiFactor is available before using it.
        if (!user.multiFactor) {
          setFormError("MFA is not available for this account. This might be a temporary issue or a configuration problem.");
          console.error("MFA Error: user.multiFactor is undefined. Ensure MFA is enabled in your Firebase project.");
          setIsLoading(false);
          return;
        }

        try {
          const multiFactorSession = await user.multiFactor.getSession();
          const secret = await TotpMultiFactorGenerator.generateSecret(multiFactorSession);
          setTotpSecret(secret);
          const qrCode = await QRCode.toDataURL(secret.qrCodeUrl);
          setQrCodeDataUrl(qrCode);
        } catch (error: any) {
          console.error("MFA secret generation error:", error);
          const errorMessage = getFirebaseAuthErrorMessage(error.code);
          setFormError(errorMessage);
        } finally {
          setIsLoading(false);
        }
      }
    };
    generateSecretAndQrCode();
  }, [open, user]);

  const onSubmit = async (values: MfaVerificationFormValues) => {
    if (!user || !totpSecret) {
      setFormError(AuthErrors.mfaSetupFailed);
      return;
    }

    setIsLoading(true);
    setFormError(null);

    try {
      const multiFactorAssertion = TotpMultiFactorGenerator.assertionForEnrollment(totpSecret, values.code);
      await user.multiFactor.enroll(multiFactorAssertion, `Authenticator App`);

      toast({
        title: '2FA Enabled!',
        description: 'Your account is now protected with Two-Factor Authentication.',
      });
      onSuccess();
      handleDialogClose(false);
    } catch (error: any) {
      console.error('MFA Enrollment Error:', error);
      const errorMessage = getFirebaseAuthErrorMessage(error.code);
      setFormError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCopyKey = () => {
    if (!totpSecret?.secretKey) return;
    navigator.clipboard.writeText(totpSecret.secretKey).then(() => {
      toast({ title: "Copied!", description: "Secret key copied to clipboard." });
      setIsKeyCopied(true);
      setTimeout(() => setIsKeyCopied(false), 2000);
    }, (err) => {
      toast({ title: "Failed to Copy", description: "Could not copy secret key.", variant: "destructive" });
    });
  };

  const handleDialogClose = (isOpen: boolean) => {
    if (!isOpen) {
      form.reset();
      setFormError(null);
      setIsLoading(false);
      setTotpSecret(null);
      setQrCodeDataUrl(null);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enable Two-Factor Authentication (2FA)</DialogTitle>
          <DialogDescription>
            Scan the QR code with your authenticator app (e.g., Google Authenticator, Authy), then enter the 6-digit code to verify.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <FormAlert title="Error" message={formError} variant="destructive" />
          
          <div className="flex flex-col items-center justify-center space-y-4">
            {isLoading && !qrCodeDataUrl ? (
              <Skeleton className="h-48 w-48" />
            ) : qrCodeDataUrl ? (
              <Image src={qrCodeDataUrl} alt="2FA QR Code" width={192} height={192} data-ai-hint="qr code" />
            ) : (
              <div className="h-48 w-48 bg-muted rounded-md flex items-center justify-center text-center text-sm text-muted-foreground p-4">
                Could not load QR code. Please try again.
              </div>
            )}
            
            <p className="text-sm text-muted-foreground">Can't scan? Enter this key manually:</p>
            <div className="flex items-center gap-2 p-2 rounded-md bg-muted text-sm">
              <span className="font-mono">{totpSecret?.secretKey || 'Loading...'}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopyKey} disabled={!totpSecret}>
                {isKeyCopied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                        disabled={isLoading || !qrCodeDataUrl}
                        autoComplete="one-time-code"
                        maxLength={6}
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
                <Button type="submit" disabled={isLoading || !qrCodeDataUrl}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verify & Enable
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
