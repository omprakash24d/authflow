
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { doc, getDoc, writeBatch, serverTimestamp, type WriteBatch, type Firestore } from 'firebase/firestore';
import { auth, firestore } from '@/lib/firebase/config';
import { updateProfile, type User as FirebaseUser } from 'firebase/auth';
import { ProfileSettingsSchema, type ProfileSettingsFormValues } from '@/lib/validators/auth';
import { getFirebaseAuthErrorMessage } from '@/lib/firebase/error-mapping';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FormAlert } from '@/components/ui/form-alert'; // New import
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { User as UserIcon, Loader2, Image as ImageIcon } from 'lucide-react'; // Removed AlertTriangle

async function prepareUsernameUpdates(
  newUsername: string,
  currentUsername: string | null,
  userId: string,
  userEmail: string | null, 
  db: Firestore
): Promise<{ success: boolean; error?: string; usernameChanged: boolean; batchOperations?: (batch: WriteBatch) => void }> {
  const newUsernameLower = newUsername.toLowerCase();
  const currentUsernameLower = currentUsername?.toLowerCase();

  if (newUsernameLower === currentUsernameLower) {
    return { success: true, usernameChanged: false };
  }

  try {
    const newUsernameRef = doc(db, 'usernames', newUsernameLower);
    const newUsernameSnap = await getDoc(newUsernameRef);
    if (newUsernameSnap.exists() && newUsernameSnap.data()?.uid !== userId) {
      return { success: false, error: `Username "${newUsername}" is already taken.`, usernameChanged: true };
    }
  } catch (error: any) {
    console.error("Error checking username availability:", error);
    return { success: false, error: "Failed to verify username availability. Please try again.", usernameChanged: true };
  }

  return {
    success: true,
    usernameChanged: true,
    batchOperations: (batch: WriteBatch) => {
      if (currentUsernameLower && currentUsernameLower !== newUsernameLower) {
        const oldUsernameRef = doc(db, 'usernames', currentUsernameLower);
        batch.delete(oldUsernameRef);
      }
      const newUsernameDocRef = doc(db, 'usernames', newUsernameLower);
      batch.set(newUsernameDocRef, {
        uid: userId,
        email: userEmail,
        username: newUsername, 
        updatedAt: serverTimestamp(),
      });
    },
  };
}


export function ProfileInformationForm() {
  const { user } = useAuth();
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
    } else if (!firestore && user) {
        setProfileError("Firestore is not available. Profile data cannot be loaded or saved.");
        toast({ title: "Configuration Error", description: "Firestore is not available.", variant: "destructive" });
    }
  }, [user, profileForm, toast]);

  async function onSubmitProfile(values: ProfileSettingsFormValues) {
    if (!user || !auth?.currentUser) { 
      setProfileError("User not authenticated. Please sign in again.");
      toast({ title: "Authentication Error", description: "User not authenticated.", variant: "destructive" });
      return;
    }
    if (!firestore) {
      setProfileError("Firestore is not available. Profile cannot be saved.");
      toast({ title: "Configuration Error", description: "Firestore is not available, cannot save profile.", variant: "destructive" });
      return;
    }

    setProfileSaving(true);
    setProfileError(null);

    const currentUser = auth.currentUser; 
    const newUsername = values.username.trim();
    let authDisplayNameUpdated = false;

    const usernameUpdateResult = await prepareUsernameUpdates(
      newUsername,
      initialUsername,
      currentUser.uid,
      currentUser.email,
      firestore
    );

    if (!usernameUpdateResult.success) {
      setProfileError(usernameUpdateResult.error || "Failed to process username change.");
      toast({ title: "Username Error", description: usernameUpdateResult.error || "Failed to process username change.", variant: "destructive" });
      setProfileSaving(false);
      return;
    }

    if (usernameUpdateResult.usernameChanged) {
      try {
        await updateProfile(currentUser, { displayName: newUsername });
        authDisplayNameUpdated = true;
      } catch (authError: any) {
        console.error("Error updating Firebase Auth displayName:", authError);
        const authErrorMessage = getFirebaseAuthErrorMessage(authError.code);
        setProfileError(`Failed to update display name in authentication: ${authErrorMessage}. Profile changes not saved.`);
        toast({ title: "Auth Update Error", description: `Failed to update display name: ${authErrorMessage}`, variant: "destructive" });
        setProfileSaving(false);
        return;
      }
    }

    try {
      const batch = writeBatch(firestore);
      const userProfileRef = doc(firestore, 'users', currentUser.uid);

      const profileUpdateData: any = {
        firstName: values.firstName,
        lastName: values.lastName,
        username: newUsername,
        email: currentUser.email, 
        updatedAt: serverTimestamp(),
      };
      batch.set(userProfileRef, profileUpdateData, { merge: true });

      if (usernameUpdateResult.batchOperations) {
        usernameUpdateResult.batchOperations(batch);
      }

      await batch.commit();

      if (usernameUpdateResult.usernameChanged) {
        setInitialUsername(newUsername); 
      }

      toast({
        title: 'Profile Updated',
        description: 'Your profile information has been successfully saved.',
      });

    } catch (firestoreError: any)
      {
      console.error("Error updating profile in Firestore:", firestoreError);
      let specificErrorMessage = "An error occurred while saving your profile to the database.";
      if (firestoreError.code === 'permission-denied' || (firestoreError.message && firestoreError.message.toLowerCase().includes('permission denied'))) {
        specificErrorMessage = `Saving profile details to the database failed due to permissions. (Details: ${firestoreError.message})`;
         if (authDisplayNameUpdated) { 
          specificErrorMessage = `Auth display name was updated to "${newUsername}", but ${specificErrorMessage}`;
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
    return <div className="flex justify-center items-center p-4"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }
   
  const isFirestoreUnavailableError = profileError && profileError.includes("Firestore is not available");

  return (
    <section>
      <h2 className="text-xl font-semibold font-headline text-primary mb-4 flex items-center">
        <UserIcon className="mr-2 h-5 w-5" /> Profile Information
      </h2>
      
      {isFirestoreUnavailableError ? (
         <FormAlert title="Configuration Error" message={profileError} variant="destructive" className="mb-4" />
      ) : (
         <FormAlert title="Profile Error" message={profileError} variant="destructive" className="mb-4" />
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
                    <Input placeholder="Your first name" {...field} disabled={profileSaving || !firestore} />
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
                    <Input placeholder="Your last name" {...field} disabled={profileSaving || !firestore} />
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
                  <Input placeholder="Your username" {...field} disabled={profileSaving || !firestore} />
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
                disabled={profileSaving || !firestore}
              >
                Upload Photo
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Profile photo upload is coming soon.</p>
          </div>
          <Button type="submit" disabled={profileSaving || !firestore}>
            {(profileSaving) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Profile Changes
          </Button>
        </form>
      </Form>
    </section>
  );
}
