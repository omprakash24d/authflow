
'use client';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Send, AlertTriangle } from 'lucide-react';

interface EmailVerificationAlertProps {
  message: string;
  onResend: () => void;
  isResending: boolean;
  showResendButton: boolean;
}

export function EmailVerificationAlert({
  message,
  onResend,
  isResending,
  showResendButton,
}: EmailVerificationAlertProps) {
  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Email Not Verified</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
      {showResendButton && (
        <Button
          type="button"
          variant="outline"
          className="w-full mt-4 border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={onResend}
          disabled={isResending}
        >
          {isResending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-2 h-4 w-4" />
          )}
          Resend Verification Email
        </Button>
      )}
    </Alert>
  );
}
