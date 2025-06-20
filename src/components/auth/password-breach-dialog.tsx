// src/components/auth/password-breach-dialog.tsx
// This component displays an alert dialog to warn users if the password they've chosen
// has been found in known data breaches (via HaveIBeenPwned or similar service).
// It gives the user an option to proceed with the breached password or choose a new one.

'use client'; // Client component due to state and user interaction.

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"; // ShadCN UI Alert Dialog components
import { AlertTriangle } from 'lucide-react'; // Icon for warning

/**
 * Props for the PasswordBreachDialog component.
 * @property isOpen - Boolean to control the visibility of the dialog.
 * @property breachCount - The number of times the password has been found in breaches.
 * @property onProceed - Callback function executed if the user chooses to proceed with the breached password.
 * @property onChooseNew - Callback function executed if the user chooses to select a new password.
 * @property onOpenChange - Callback function to handle changes in the dialog's open state (e.g., when closed via overlay click or Esc key).
 */
interface PasswordBreachDialogProps {
  isOpen: boolean;
  breachCount: number;
  onProceed: () => void;
  onChooseNew: () => void;
  onOpenChange: (open: boolean) => void;
}

/**
 * PasswordBreachDialog component.
 * A modal dialog that warns users about using a compromised password.
 * @param {PasswordBreachDialogProps} props - The component's props.
 * @returns JSX.Element | null - Renders the dialog or null if not open.
 */
export function PasswordBreachDialog({
  isOpen,
  breachCount,
  onProceed,
  onChooseNew,
  onOpenChange,
}: PasswordBreachDialogProps) {
  // Do not render anything if the dialog is not supposed to be open.
  if (!isOpen) {
    return null;
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center space-x-2"> {/* For icon and title alignment */}
            <AlertTriangle className="h-6 w-6 text-destructive" /> {/* Warning icon */}
            <AlertDialogTitle>Compromised Password Warning</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            The password you entered has been found in {breachCount} known data {breachCount === 1 ? 'breach' : 'breaches'}.
            Using this password significantly increases the risk of your account being compromised.
            We strongly recommend choosing a different, unique password.
            <br /><br />
            Do you want to proceed with this password anyway?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {/* Action to choose a new password (typically cancels the current submission flow) */}
          <AlertDialogCancel onClick={onChooseNew}>
            Choose a New Password
          </AlertDialogCancel>
          {/* Action to proceed with the current, breached password */}
          <AlertDialogAction
            onClick={onProceed}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground" // Destructive styling for emphasis
          >
            Proceed Anyway
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
