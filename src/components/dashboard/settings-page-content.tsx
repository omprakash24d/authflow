
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { doc, getDoc, setDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { auth, firestore } from '@/lib/firebase/config';
import { updateProfile, EmailAuthProvider, reauthenticateWithCredential, verifyBeforeUpdateEmail, type User as FirebaseUser } from 'firebase/auth';
import { ProfileSettingsSchema, type ProfileSettingsFormValues, ChangeEmailSchema, type ChangeEmailFormValues } from '@/lib/validators/auth';
import { getFirebaseAuthErrorMessage } from '@/lib/firebase/error-mapping';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ChangePasswordDialog } from '@/components/dashboard/settings/change-password-dialog';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, User, Lock, Bell, Palette, AlertTriangle, Loader2, Image as ImageIcon, Mail, Eye, EyeOff } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';


export default function SettingsPageContent() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false);
  const [isChangeEmailDialogOpen, setIsChangeEmailDialogOpen] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [initialUsername, setInitialUsername] = useState<string | null>(null);

  const [emailChangeLoading, setEmailChangeLoading] = useState(false);
  const [emailChangeFormError, setEmailChangeFormError] = useState<string | null>(null);
  const [showCurrentPasswordForEmail, setShowCurrentPasswordForEmail] = useState(false);


  const profileForm = useForm<ProfileSettingsFormValues>({
    resolver: zodResolver(ProfileSettingsSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
    },
  });

  const emailChangeForm = useForm<ChangeEmailFormValues>({
    resolver: zodResolver(ChangeEmailSchema),
    defaultValues: {
      currentPassword: '',
      newEmail: '',
    },
  });

  useEffect(() => {
    if (user && firestore) {
      const fetchUserProfile = async () => {
        try {
          const userProfileRef = doc(firestore, 'users', user.uid);
          const docSnap = await getDoc(userProfileRef);
          let fetchedUsername = user.displayName || ''; // Fallback to auth displayName
          if (docSnap.exists()) {
            const profileData = docSnap.data();
            profileForm.reset({
              firstName: profileData.firstName || '',
              lastName: profileData.lastName || '',
              username: profileData.username || user.displayName || '',
            });
            fetchedUsername = profileData.username || user.displayName || '';
          } else {
            profileForm.reset({
              firstName: '',
              lastName: '',
              username: user.displayName || '',
            });
          }
          setInitialUsername(fetchedUsername);
        } catch (error: any) {
          console.error("Error fetching user profile for settings:", error);
          setProfileError("Could not load your profile data.");
          toast({ title: "Error", description: "Could not load your profile data.", variant: "destructive" });
        }
      };
      fetchUserProfile();
    }
  }, [user, profileForm.reset, toast]);


  async function onSubmitProfile(values: ProfileSettingsFormValues) {
    if (!user || !auth.currentUser) {
      setProfileError("User not authenticated. Please sign in again.");
      toast({ title: "Authentication Error", description: "User not authenticated.", variant: "destructive" });
      return;
    }
    setProfileSaving(true);
    setProfileError(null);

    const currentUser = auth.currentUser;
    const newUsername = values.username.trim();
    let usernameChanged = false;

    // Check if username has actually changed (case-insensitive check for desired state)
    if (newUsername.toLowerCase() !== (initialUsername || '').toLowerCase()) {
      usernameChanged = true;
      // Client-side check for new username availability
      const newUsernameRef = doc(firestore, 'usernames', newUsername.toLowerCase());
      try {
        const newUsernameSnap = await getDoc(newUsernameRef);
        if (newUsernameSnap.exists()) {
          const usernameData = newUsernameSnap.data();
          if (usernameData.uid !== currentUser.uid) { // Allow if it's the user's own existing record (e.g. case change)
            setProfileError(`Username "${newUsername}" is already taken. Please choose another.`);
            toast({ title: "Username Taken", description: `Username "${newUsername}" is already taken.`, variant: "destructive" });
            setProfileSaving(false);
            return;
          }
        }
      } catch (error: any) {
        console.error("Error checking username availability:", error);
        setProfileError("Failed to verify username availability. Please try again.");
        toast({ title: "Error", description: "Failed to verify username. Please try again.", variant: "destructive" });
        setProfileSaving(false);
        return;
      }
    }

    // Attempt to update Firebase Auth displayName first if username changed
    if (usernameChanged) {
      try {
        await updateProfile(currentUser, { displayName: newUsername });
        // Successfully updated Auth displayName, now reflect this in initialUsername for Firestore logic
        // This helps if Firestore batch fails, Auth part is done.
      } catch (authError: any) {
        console.error("Error updating Firebase Auth displayName:", authError);
        const authErrorMessage = getFirebaseAuthErrorMessage(authError.code);
        setProfileError(`Failed to update display name in authentication: ${authErrorMessage}`);
        toast({ title: "Auth Update Error", description: `Failed to update display name: ${authErrorMessage}`, variant: "destructive" });
        setProfileSaving(false);
        return; // Stop if Auth update fails
      }
    }

    // Proceed with Firestore updates
    const batch = writeBatch(firestore);
    const userProfileRef = doc(firestore, 'users', currentUser.uid);

    try {
      const profileUpdateData: any = {
        firstName: values.firstName,
        lastName: values.lastName,
        username: newUsername, // Always set the username in the user's profile to the new one
        updatedAt: serverTimestamp(),
      };
      batch.set(userProfileRef, profileUpdateData, { merge: true });

      if (usernameChanged && initialUsername && initialUsername.toLowerCase() !== newUsername.toLowerCase()) {
        // Only delete the old username record if initialUsername was non-empty and different
        const oldUsernameRef = doc(firestore, 'usernames', initialUsername.toLowerCase());
        batch.delete(oldUsernameRef);
      }
      
      if (usernameChanged) {
        // Create/Update new username document in 'usernames' collection
        const newUsernameRefForWrite = doc(firestore, 'usernames', newUsername.toLowerCase());
        batch.set(newUsernameRefForWrite, {
          uid: currentUser.uid,
          email: currentUser.email,
          username: newUsername, // Store the exact case chosen by user
          updatedAt: serverTimestamp(),
        });
      }

      await batch.commit();

      if (usernameChanged) {
          setInitialUsername(newUsername); // Update local state to reflect successful full change
      }

      toast({
        title: 'Profile Updated',
        description: 'Your profile information has been successfully saved.',
      });

    } catch (firestoreError: any) {
      console.error("Error updating profile in Firestore:", firestoreError);
      let specificErrorMessage = "An error occurred while saving your profile to the database.";
      if (firestoreError.code === 'permission-denied' || (firestoreError.message && firestoreError.message.toLowerCase().includes('permission denied'))) {
        specificErrorMessage = `Your Firebase Auth display name may have been updated to "${newUsername}", but saving username details to the database failed due to permissions. Please check Firestore security rules for 'users' and 'usernames' collections or contact support. (Details: ${firestoreError.message})`;
      } else {
        specificErrorMessage = getFirebaseAuthErrorMessage(firestoreError.code) || specificErrorMessage;
      }
      setProfileError(specificErrorMessage);
      toast({
        title: 'Firestore Update Error',
        description: specificErrorMessage,
        variant: 'destructive',
      });
    } finally {
      setProfileSaving(false);
    }
  }

  async function onSubmitEmailChange(values: ChangeEmailFormValues) {
    if (!user || !user.email) {
      setEmailChangeFormError('User not found or email is missing.');
      return;
    }
    setEmailChangeLoading(true);
    setEmailChangeFormError(null);

    try {
      const credential = EmailAuthProvider.credential(user.email, values.currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // User re-authenticated, now verify and update email
      await verifyBeforeUpdateEmail(user, values.newEmail);

      toast({
        title: 'Verification Email Sent',
        description: `A verification email has been sent to ${values.newEmail}. Please verify to complete the email change. Your current email remains active until then.`,
      });

      // Optionally, update the email in Firestore `users/{uid}` document with a pending status
      // or wait for a Cloud Function triggered by Auth email change event.
      // For now, we'll just inform the user.
      // const userProfileRef = doc(firestore, 'users', user.uid);
      // await setDoc(userProfileRef, { email: values.newEmail, emailVerified: false, emailChangePending: true }, { merge: true });


      emailChangeForm.reset();
      setIsChangeEmailDialogOpen(false);
    } catch (error: any) {
      console.error('Change Email Error:', error);
      const errorMessage = getFirebaseAuthErrorMessage(error.code);
      setEmailChangeFormError(errorMessage);
      toast({
        title: 'Error Changing Email',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setEmailChangeLoading(false);
    }
  }

  const handleEmailDialogClose = (isOpen: boolean) => {
    if (!isOpen) {
      emailChangeForm.reset();
      setEmailChangeFormError(null);
      setEmailChangeLoading(false);
      setShowCurrentPasswordForEmail(false);
    }
    setIsChangeEmailDialogOpen(isOpen);
  };


  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Alert variant="destructive" className="max-w-md text-center">
          <AlertTriangle className="h-5 w-5 mx-auto mb-2" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            You need to be signed in to access this page. Or your session might have expired.
          </AlertDescription>
          <Button onClick={() => router.push('/signin')} className="mt-4">
            Go to Sign In
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-screen flex-col items-center bg-background p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-2xl">
          <Button variant="outline" size="sm" asChild className="mb-6">
            <Link href="/dashboard">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>

          <Card className="w-full shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-headline">Account Settings</CardTitle>
              <CardDescription>Manage your profile, security, and other preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold font-headline text-primary mb-4 flex items-center">
                  <User className="mr-2 h-5 w-5" /> Profile Information
                </h2>
                {profileError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Profile Error</AlertTitle>
                    <AlertDescription>{profileError}</AlertDescription>
                  </Alert>
                )}
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={profileForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your first name" {...field} disabled={profileSaving} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your last name" {...field} disabled={profileSaving} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                     <FormField
                        control={profileForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Your username" {...field} disabled={profileSaving} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    <div>
                      <Label htmlFor="emailDisplay">Email Address</Label>
                      <Input id="emailDisplay" type="email" value={user.email || 'N/A'} disabled className="bg-muted/50"/>
                       <p className="text-xs text-muted-foreground mt-1">
                         To change your email, use the "Change Email" option in the Security section.
                       </p>
                    </div>
                     <div className="space-y-2">
                        <Label>Profile Photo</Label>
                        <div className="flex items-center gap-4">
                            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                                <ImageIcon size={32} />
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => toast({ title: 'Coming Soon', description: 'Profile photo upload will be implemented in a future update.'})}
                                disabled={profileSaving}
                            >
                                Upload Photo
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">Profile photo upload is coming soon.</p>
                    </div>
                    <Button type="submit" disabled={profileSaving}>
                      {profileSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Profile Changes
                    </Button>
                  </form>
                </Form>
              </section>

              <Separator />

              <section>
                <h2 className="text-xl font-semibold font-headline text-primary mb-4 flex items-center">
                  <Lock className="mr-2 h-5 w-5" /> Security
                </h2>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" onClick={() => setIsChangePasswordDialogOpen(true)}>
                    Change Password
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setIsChangeEmailDialogOpen(true)}>
                    <Mail className="mr-2 h-4 w-4" /> Change Email Address
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => toast({ title: 'Coming Soon', description: 'Two-Factor Authentication (2FA) will be added in a future update.'})}>
                    Enable Two-Factor Authentication (2FA)
                  </Button>
                  <Button variant="link" className="text-primary p-0 h-auto" onClick={() => toast({ title: 'Coming Soon', description: 'Login history view will be added in a future update.'})}>View login history</Button>
                </div>
              </section>

              <Separator />

              <section>
                <h2 className="text-xl font-semibold font-headline text-primary mb-4 flex items-center">
                  <Bell className="mr-2 h-5 w-5" /> Notification Preferences
                </h2>
                <div className="space-y-2">
                  <p className="text-sm">Manage how you receive notifications from us (coming soon).</p>
                  <Button variant="outline" className="w-full justify-start" onClick={() => toast({ title: 'Coming Soon', description: 'Email notification settings will be added in a future update.'})}>
                    Configure Email Notifications
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => toast({ title: 'Coming Soon', description: 'SMS notification settings will be added in a future update.'})}>
                    Configure SMS Notifications
                  </Button>
                </div>
              </section>

              <Separator />

              <section>
                <h2 className="text-xl font-semibold font-headline text-primary mb-4 flex items-center">
                  <Palette className="mr-2 h-5 w-5" /> Appearance
                </h2>
                <div className="space-y-2">
                  <p className="text-sm">Customize the look and feel of the application (coming soon).</p>
                  <Button variant="outline" className="w-full justify-start" onClick={() => toast({ title: 'Coming Soon', description: 'Dark/Light mode toggle will be added in a future update.'})}>
                    Toggle Dark/Light Mode
                  </Button>
                </div>
              </section>

            </CardContent>
          </Card>
        </div>
      </div>
      <ChangePasswordDialog open={isChangePasswordDialogOpen} onOpenChange={setIsChangePasswordDialogOpen} />
      
      {/* Change Email Dialog */}
      <Dialog open={isChangeEmailDialogOpen} onOpenChange={handleEmailDialogClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Email Address</DialogTitle>
            <DialogDescription>
              Enter your current password and your new email address. A verification link will be sent to your new email.
            </DialogDescription>
          </DialogHeader>
          <Form {...emailChangeForm}>
            <form onSubmit={emailChangeForm.handleSubmit(onSubmitEmailChange)} className="space-y-6 py-4">
              {emailChangeFormError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{emailChangeFormError}</AlertDescription>
                </Alert>
              )}
              <FormField
                control={emailChangeForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showCurrentPasswordForEmail ? 'text' : 'password'}
                          placeholder="••••••••"
                          {...field}
                          disabled={emailChangeLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowCurrentPasswordForEmail(!showCurrentPasswordForEmail)}
                          aria-label={showCurrentPasswordForEmail ? "Hide password" : "Show password"}
                          disabled={emailChangeLoading}
                        >
                          {showCurrentPasswordForEmail ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={emailChangeForm.control}
                name="newEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Email Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input type="email" placeholder="new.email@example.com" className="pl-10" {...field} disabled={emailChangeLoading} />
                        </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={emailChangeLoading}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={emailChangeLoading}>
                  {emailChangeLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Verification Email
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
