// src/components/auth/email-verification-alert.tsx
// This component displays an alert message prompting the user to verify their email.
// It includes an option to resend the verification email.

'use client'; // This component involves client-side state and interactions.

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Send, AlertTriangle } from 'lucide-react'; // Icons for visual feedback

/**
 * Props for the EmailVerificationAlert component.
 * @property message - The main message to display in the alert.
 * @property onResend - Callback function triggered when the "Resend" button is clicked.
 * @property isResending - Boolean indicating if the resend operation is currently in progress (to show a loader).
 * @property showResendButton - Boolean to control the visibility of the "Resend" button.
 */
interface EmailVerificationAlertProps {
  message: string;
  onResend: () => void;
  isResending: boolean;
  showResendButton: boolean;
}

/**
 * EmailVerificationAlert component.
 * An alert box that informs the user about email verification status and allows resending the verification email.
 * @param {EmailVerificationAlertProps} props - The component's props.
 * @returns JSX.Element
 */
export function EmailVerificationAlert({
  message,
  onResend,
  isResending,
  showResendButton,
}: EmailVerificationAlertProps) {
  return (
    <Alert variant="destructive"> {/* Uses the 'destructive' variant for emphasis */}
      <AlertTriangle className="h-4 w-4" /> {/* Icon for the alert */}
      <AlertTitle>Email Not Verified</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
      {showResendButton && ( // Conditionally render the resend button
        <Button
          type="button"
          variant="outline"
          className="w-full mt-4 border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={onResend}
          disabled={isResending} // Disable button while resending
        >
          {isResending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> // Show loader if resending
          ) : (
            <Send className="mr-2 h-4 w-4" /> // Show send icon otherwise
          )}
          Resend Verification Email
        </Button>
      )}
    </Alert>
  );
}
