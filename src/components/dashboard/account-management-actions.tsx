
'use client';

import { useState } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { deleteUser } from 'firebase/auth';
import { LogOut, Settings, Trash2, Loader2 } from 'lucide-react';
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
} from "@/components/ui/alert-dialog";

interface AccountManagementActionsProps {
  user: FirebaseUser;
  signOut: () => Promise<void>;
}

export function AccountManagementActions({ user, signOut }: AccountManagementActionsProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (!user) return;
    setIsDeleting(true);
    try {
      await deleteUser(user);
      toast({
        title: "Account Deleted",
        description: "Your account has been successfully deleted.",
      });
      // signOut will redirect via AuthContext
    } catch (error: any) {
      console.error("Error deleting account:", error);
      let description = "Failed to delete your account. You may need to sign in again recently to perform this operation.";
      if (error.code === 'auth/requires-recent-login') {
        description = "This operation is sensitive and requires recent authentication. Please sign out and sign back in, then try again.";
      }
      toast({
        title: "Error Deleting Account",
        description: description,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-3">
       <h3 className="text-lg font-semibold font-headline text-primary flex items-center">
        <Settings className="mr-2 h-5 w-5" /> Account Management
      </h3>
      <Button variant="outline" className="w-full" asChild>
        <Link href="/dashboard/settings">
          <Settings className="mr-2 h-4 w-4" /> Account Settings
        </Link>
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" className="w-full">
            <Trash2 className="mr-2 h-4 w-4" /> Delete Account
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
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
              className="bg-destructive hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Yes, delete account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Button onClick={signOut} className="w-full">
        <LogOut className="mr-2 h-4 w-4" /> Sign Out
      </Button>
    </div>
  );
}
