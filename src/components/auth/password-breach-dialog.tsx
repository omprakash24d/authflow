
'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from 'lucide-react';

interface PasswordBreachDialogProps {
  isOpen: boolean;
  breachCount: number;
  onProceed: () => void;
  onChooseNew: () => void;
  onOpenChange: (open: boolean) => void;
}

export function PasswordBreachDialog({
  isOpen,
  breachCount,
  onProceed,
  onChooseNew,
  onOpenChange,
}: PasswordBreachDialogProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <AlertDialogTitle>Compromised Password Warning</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            The password you entered has been found in {breachCount} known data breaches.
            Using this password significantly increases the risk of your account being compromised.
            We strongly recommend choosing a different, unique password.
            <br /><br />
            Do you want to proceed with this password anyway?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onChooseNew}>
            Choose a New Password
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onProceed}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            Proceed Anyway
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
