'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Settings, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { deleteUser } from 'firebase/auth';
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
} from "@/components/ui/alert-dialog"

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '??';
    const names = name.split(' ');
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    try {
      await deleteUser(user);
      toast({
        title: "Account Deleted",
        description: "Your account has been successfully deleted.",
      });
      // signOut will redirect to /signin
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
    }
  };


  if (!user) {
    // This should be handled by ProtectedRoute, but as a fallback:
    return <div className="flex min-h-screen items-center justify-center">Redirecting...</div>;
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-background">
        <Card className="w-full max-w-lg shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-3xl font-headline">Welcome to AuthFlow!</CardTitle>
            <CardDescription>This is your protected dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2 text-sm">
              <p><strong>Display Name:</strong> {user.displayName || 'Not set'}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Email Verified:</strong> {user.emailVerified ? 'Yes' : 'No'}</p>
              <p><strong>User ID:</strong> {user.uid}</p>
            </div>
            
            <div className="space-y-3">
              <Button variant="outline" className="w-full" onClick={() => alert('Account Settings (not implemented)')}>
                <Settings className="mr-2 h-4 w-4" /> Account Settings
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
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">
                      Yes, delete account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button onClick={signOut} className="w-full">
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
