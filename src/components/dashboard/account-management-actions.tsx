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
import { ApiErrors, AuthErrors } from '@/lib/constants/messages'; // Centralized error messages
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
 * This component orchestrates the multi-step process for secure account deletion.
 * @param {AccountManagementActionsProps} props - The component's props.
 * @returns JSX.Element
 */
export function AccountManagementActions({ user, signOut }: AccountManagementActionsProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false); // State to manage loading during account deletion

  /**
   * Handles the account deletion process. This is a critical security-sensitive operation.
   * 1. Calls a secure API endpoint to delete user data from Firestore.
   * 2. If Firestore deletion is successful, proceeds to delete the user from Firebase Authentication.
   * 3. Explicitly clears the server-side session cookie.
   * 4. Redirects the user to the homepage.
   */
  const handleDeleteAccount = async () => {
    if (!user) return;
    setIsDeleting(true);

    try {
      // Step 1: Call the API route to delete user data from Firestore.
      const response = await fetch('/api/auth/delete-user-data', {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: ApiErrors.deleteUserDataFailed }));
        throw new Error(errorData.error);
      }
      
      // Step 2: After successfully deleting database records, delete the user from Firebase Authentication.
      // This also handles signing the user out on the client-side.
      await deleteUser(user);

      // Step 3: Explicitly clear the server-side session cookie.
      // This is crucial to ensure the server session is destroyed along with the account.
      await fetch('/api/auth/session-logout', { method: 'POST' });
      
      toast({
        title: "Account Deleted",
        description: "Your account and all associated data have been successfully deleted. You will now be redirected.",
      });
      
      // Step 4: Redirect to the homepage with a full page reload to clear all application state.
      window.location.assign('/');

    } catch (error: any) {
      console.error("Error deleting account:", error);
      let description = error.message || "An unexpected error occurred while deleting your account.";
      
      // Provide a more specific and helpful message for the common 'requires-recent-login' error.
      if (error.code === 'auth/requires-recent-login') {
        description = AuthErrors.requiresRecentLogin;
      }
      
      toast({
        title: "Error Deleting Account",
        description: description,
        variant: "destructive",
        duration: 7000, // Longer duration for important error messages
      });
      setIsDeleting(false); // Only set loading to false on error, as success triggers a redirect.
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
              account and remove all your associated data (profile information, 
              username, etc.) from our servers.
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
