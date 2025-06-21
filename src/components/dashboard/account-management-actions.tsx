// src/components/dashboard/account-management-actions.tsx
// This component provides actions related to account management for an authenticated user,
// such as navigating to settings, deleting their account, and signing out.

'use client'; // Client component due to state management and user interactions.

import { useState } from 'react';
import type { User as FirebaseUser } from 'firebase/auth'; // Firebase User type
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast'; // For displaying notifications
import { deleteUser } from 'firebase/auth'; // Firebase function to delete a user
import { LogOut, Settings, Trash2, Loader2 } from 'lucide-react'; // Icons
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"; // Confirmation dialog for destructive actions

/**
 * Props for the AccountManagementActions component.
 * @property user - The currently authenticated Firebase user object.
 * @property signOut - The sign-out function provided by the AuthContext.
 */
interface AccountManagementActionsProps {
  user: FirebaseUser;
  signOut: () => Promise<void>;
}

/**
 * AccountManagementActions component.
 * Renders a set of buttons for account settings, account deletion (with confirmation), and sign out.
 * @param {AccountManagementActionsProps} props - The component's props.
 * @returns JSX.Element
 */
export function AccountManagementActions({ user, signOut }: AccountManagementActionsProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false); // State to manage loading during account deletion

  /**
   * Handles the account deletion process.
   * Prompts for confirmation and then attempts to delete the user's Firebase account.
   */
  const handleDeleteAccount = async () => {
    if (!user) return; // Should not happen if this component is rendered for an authenticated user
    setIsDeleting(true);
    try {
      // Attempt to delete the user from Firebase Authentication
      await deleteUser(user);
      toast({
        title: "Account Deleted",
        description: "Your account has been successfully deleted. Redirecting...",
      });
      // Explicitly call signOut to handle session cleanup and redirection to homepage.
      await signOut();
    } catch (error: any) {
      console.error("Error deleting account:", error);
      let description = "Failed to delete your account. You may need to sign in again recently to perform this operation.";
      // Firebase often requires recent re-authentication for sensitive operations like account deletion.
      if (error.code === 'auth/requires-recent-login') {
        description = "This operation is sensitive and requires recent authentication. Please sign out and sign back in, then try again.";
      }
      toast({
        title: "Error Deleting Account",
        description: description,
        variant: "destructive",
      });
      setIsDeleting(false); // Only set loading to false on error, as success redirects.
    }
  };

  return (
    <div className="space-y-3"> {/* Vertical spacing for buttons */}
       <h3 className="text-lg font-semibold font-headline text-primary flex items-center">
        <Settings className="mr-2 h-5 w-5" /> Account Management
      </h3>
      {/* Button to navigate to Account Settings page */}
      <Button variant="outline" className="w-full" asChild>
        <Link href="/dashboard/settings">
          <Settings className="mr-2 h-4 w-4" /> Account Settings
        </Link>
      </Button>

      {/* Account Deletion: Trigger for an AlertDialog */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" className="w-full">
            <Trash2 className="mr-2 h-4 w-4" /> Delete Account
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent> {/* Content of the confirmation dialog */}
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAccount} 
              className="bg-destructive hover:bg-destructive/90" // Destructive styling for the action
              disabled={isDeleting} // Disable while deletion is in progress
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {/* Loading spinner */}
              Yes, delete account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Sign Out Button */}
      <Button onClick={signOut} className="w-full">
        <LogOut className="mr-2 h-4 w-4" /> Sign Out
      </Button>
    </div>
  );
}
