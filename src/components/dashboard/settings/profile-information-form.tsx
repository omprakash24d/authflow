
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { doc, getDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { auth, firestore } from '@/lib/firebase/config';
import { updateProfile, type User as FirebaseUser } from 'firebase/auth';
import { ProfileSettingsSchema, type ProfileSettingsFormValues } from '@/lib/validators/auth';
import { getFirebaseAuthErrorMessage } from '@/lib/firebase/error-mapping';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { User as UserIcon, AlertTriangle, Loader2, Image as ImageIcon } from 'lucide-react';

export function ProfileInformationForm() {
  const { user } = useAuth(); // Assuming useAuth provides the currently authenticated FirebaseUser
  const { toast } = useToast();

  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [initialUsername, setInitialUsername] = useState<string | null>(null);

  const profileForm = useForm<ProfileSettingsFormValues>({
    resolver: zodResolver(ProfileSettingsSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
    },
  });

  useEffect(() => {
    if (user && firestore) {
      const fetchUserProfile = async () => {
        try {
          const userProfileRef = doc(firestore, 'users', user.uid);
          const docSnap = await getDoc(userProfileRef);
          let fetchedUsername = user.displayName || '';

          if (docSnap.exists()) {
            const profileData = docSnap.data();
            profileForm.reset({
              firstName: profileData.firstName || '',
              lastName: profileData.lastName || '',
              username: profileData.username || user.displayName || '',
            });
            fetchedUsername = profileData.username || user.displayName || '';
          } else {
             console.warn(`User profile document not found for UID: ${user.uid}. Initializing form with Auth display name.`);
            profileForm.reset({
              firstName: '', // No first name in Firestore
              lastName: '',  // No last name in Firestore
              username: user.displayName || '', // Fallback to auth displayName
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
  }, [user, profileForm, toast]); // profileForm.reset is stable

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

    if (newUsername.toLowerCase() !== (initialUsername || '').toLowerCase()) {
      usernameChanged = true;
      const newUsernameRef = doc(firestore, 'usernames', newUsername.toLowerCase());
      try {
        const newUsernameSnap = await getDoc(newUsernameRef);
        if (newUsernameSnap.exists()) {
          const usernameData = newUsernameSnap.data();
          if (usernameData.uid !== currentUser.uid) {
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

    let authDisplayNameUpdated = false;
    if (usernameChanged) {
      try {
        await updateProfile(currentUser, { displayName: newUsername });
        authDisplayNameUpdated = true;
      } catch (authError: any) {
        console.error("Error updating Firebase Auth displayName:", authError);
        const authErrorMessage = getFirebaseAuthErrorMessage(authError.code);
        setProfileError(`Failed to update display name in authentication: ${authErrorMessage}. Your profile in the database was not updated.`);
        toast({ title: "Auth Update Error", description: `Failed to update display name: ${authErrorMessage}`, variant: "destructive" });
        setProfileSaving(false);
        return;
      }
    }

    const batch = writeBatch(firestore);
    const userProfileRef = doc(firestore, 'users', currentUser.uid);

    try {
      const profileUpdateData: any = {
        firstName: values.firstName,
        lastName: values.lastName,
        username: newUsername,
        updatedAt: serverTimestamp(),
      };
      if (currentUser.email) { // Ensure email is part of the update if available
        profileUpdateData.email = currentUser.email;
      }
      batch.set(userProfileRef, profileUpdateData, { merge: true });

      if (usernameChanged && initialUsername && initialUsername.toLowerCase() !== newUsername.toLowerCase()) {
        const oldUsernameRef = doc(firestore, 'usernames', initialUsername.toLowerCase());
        batch.delete(oldUsernameRef);
      }
      
      if (usernameChanged) {
        const newUsernameRefForWrite = doc(firestore, 'usernames', newUsername.toLowerCase());
        batch.set(newUsernameRefForWrite, {
          uid: currentUser.uid,
          email: currentUser.email,
          username: newUsername, // Store the exact case chosen by user
          createdAt: serverTimestamp(), // Use createdAt for new doc, or updatedAt
          updatedAt: serverTimestamp(),
        });
      }

      await batch.commit();

      if (usernameChanged) {
        setInitialUsername(newUsername);
      }

      toast({
        title: 'Profile Updated',
        description: 'Your profile information has been successfully saved.',
      });

    } catch (firestoreError: any) {
      console.error("Error updating profile in Firestore:", firestoreError);
      let specificErrorMessage = "An error occurred while saving your profile to the database.";
      if (firestoreError.code === 'permission-denied' || (firestoreError.message && firestoreError.message.toLowerCase().includes('permission denied'))) {
        specificErrorMessage = `Saving profile details to the database failed due to permissions. Please check Firestore security rules. (Details: ${firestoreError.message})`;
         if (authDisplayNameUpdated) {
          specificErrorMessage = `Your Auth display name was updated to "${newUsername}", but ${specificErrorMessage}`;
        }
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

  if (!user) {
    return <Loader2 className="h-6 w-6 animate-spin text-primary" />;
  }

  return (
    <section>
      <h2 className="text-xl font-semibold font-headline text-primary mb-4 flex items-center">
        <UserIcon className="mr-2 h-5 w-5" /> Profile Information
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
            <Input id="emailDisplay" type="email" value={user.email || 'N/A'} disabled className="bg-muted/50" />
            <p className="text-xs text-muted-foreground mt-1">
              Your email address is managed in the Security section.
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
                onClick={() => toast({ title: 'Coming Soon', description: 'Profile photo upload will be implemented in a future update.' })}
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
  );
}
