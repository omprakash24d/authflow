// src/components/dashboard/settings/profile-information-form.tsx
// This component provides a form for users to update their profile information,
// such as first name, last name, and username.
// It interacts with Firebase Auth for updating the main profile (displayName)
// and Firestore for storing/updating additional details and username uniqueness.

'use client'; // Client component due to form handling, state, and Firebase interactions.

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  doc, getDoc, writeBatch, serverTimestamp, 
  type WriteBatch, type Firestore, type DocumentReference, type DocumentData 
} from 'firebase/firestore';
import { auth, firestore } from '@/lib/firebase/config'; // Firebase auth and firestore instances
import { updateProfile, type User as FirebaseUser } from 'firebase/auth'; // Firebase Auth update function
import Image from 'next/image'; // Next.js Image component for optimized images
import { ProfileSettingsSchema, type ProfileSettingsFormValues } from '@/lib/validators/auth'; // Zod schema for validation
import { getFirebaseAuthErrorMessage } from '@/lib/firebase/error-mapping'; // Maps Firebase errors to messages

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FormAlert } from '@/components/ui/form-alert'; // For displaying form-level errors
import { useAuth } from '@/contexts/auth-context'; // Hook to access authenticated user
import { useToast } from '@/hooks/use-toast'; // Hook for toast notifications
import { Loader2, Image as ImageIcon } from 'lucide-react'; // Icons

/**
 * Prepares Firestore batch operations for updating or creating username documents.
 * Checks for username availability and handles deletion of old username document if changed.
 * @param newUsername - The new username to be set.
 * @param currentUsername - The user's current username (if any).
 * @param userId - The UID of the user.
 * @param userEmail - The user's email address.
 * @param db - The non-null Firestore instance.
 * @returns An object indicating success, error message, whether username changed, and batch operations.
 */
async function prepareUsernameUpdates(
  newUsername: string,
  currentUsername: string | null,
  userId: string,
  userEmail: string | null,
  db: Firestore // Expects a non-null Firestore instance
): Promise<{ success: boolean; error?: string; usernameChanged: boolean; batchOperations?: (batch: WriteBatch) => void }> {
  const newUsernameLower = newUsername.toLowerCase();
  const currentUsernameLower = currentUsername?.toLowerCase();

  // If username hasn't changed (case-insensitively), no Firestore username update needed.
  if (newUsernameLower === currentUsernameLower) {
    return { success: true, usernameChanged: false };
  }

  try {
    // Check if the new username is already taken by another user.
    const newUsernameRef = doc(db, 'usernames', newUsernameLower);
    const newUsernameSnap = await getDoc(newUsernameRef);
    if (newUsernameSnap.exists() && newUsernameSnap.data()?.uid !== userId) {
      return { success: false, error: `Username "${newUsername}" is already taken.`, usernameChanged: true };
    }
  } catch (error: any) {
    console.error("Error checking username availability:", error);
    return { success: false, error: "Failed to verify username availability. Please try again.", usernameChanged: true };
  }

  // If username is available or belongs to the current user, prepare batch operations.
  return {
    success: true,
    usernameChanged: true,
    batchOperations: (batch: WriteBatch) => {
      // If there was an old username and it's different, delete the old username document.
      if (currentUsernameLower && currentUsernameLower !== newUsernameLower) {
        const oldUsernameRef = doc(db, 'usernames', currentUsernameLower);
        batch.delete(oldUsernameRef);
      }
      // Set the new username document.
      const newUsernameDocRef = doc(db, 'usernames', newUsernameLower);
      batch.set(newUsernameDocRef, {
        uid: userId,
        email: userEmail,
        username: newUsername, // Store cased username
        updatedAt: serverTimestamp(),
      });
    },
  };
}

/**
 * ProfileInformationForm component.
 * Allows users to update their first name, last name, and username.
 * @returns JSX.Element
 */
export function ProfileInformationForm() {
  const { user } = useAuth(); // Current authenticated user from context
  const { toast } = useToast();

  // State variables
  const [profileSaving, setProfileSaving] = useState(false); // Loading state for profile save
  const [profileError, setProfileError] = useState<string | null>(null); // Form-level error messages
  const [initialUsername, setInitialUsername] = useState<string | null>(null); // Stores username on load to check for changes
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null); // Data URL for photo preview
  const [isFirestoreAvailable, setIsFirestoreAvailable] = useState(false); // Tracks if Firestore service is up
  const [initialDataLoaded, setInitialDataLoaded] = useState(false); // Tracks if initial profile data has loaded

  // Initialize react-hook-form
  const profileForm = useForm<ProfileSettingsFormValues>({
    resolver: zodResolver(ProfileSettingsSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
    },
  });

  const { formState, trigger, reset } = profileForm;

  // useEffect to fetch and populate user profile data when the component mounts or user/firestore changes.
  useEffect(() => {
    const fetchUserProfile = async (fs: Firestore, currentFirebaseUser: FirebaseUser) => {
      try {
        if (currentFirebaseUser.photoURL) {
          setProfilePhotoPreview(currentFirebaseUser.photoURL);
        }
        const userProfileRef = doc(fs, 'users', currentFirebaseUser.uid);
        const docSnap = await getDoc(userProfileRef);
        let fetchedUsername = currentFirebaseUser.displayName || '';

        if (docSnap.exists()) {
          const profileData = docSnap.data();
          reset({
            firstName: profileData.firstName || '',
            lastName: profileData.lastName || '',
            username: profileData.username || currentFirebaseUser.displayName || '',
          });
          fetchedUsername = profileData.username || currentFirebaseUser.displayName || '';
          if (profileData.photoURL && profileData.photoURL !== currentFirebaseUser.photoURL) {
             setProfilePhotoPreview(profileData.photoURL);
          }
        } else {
          reset({
            firstName: '',
            lastName: '',
            username: currentFirebaseUser.displayName || '',
          });
          }
        setInitialUsername(fetchedUsername);
      } catch (error: any) {
        console.error("Error fetching user profile for settings:", error);
        setProfileError("Could not load your profile data from the database.");
      } finally {
        setInitialDataLoaded(true);
      }
    };

    if (!user) {
      setInitialDataLoaded(true);
      return;
    }

    if (!firestore) {
      setIsFirestoreAvailable(false);
      setProfileError("Database service is not available. Profile data cannot be loaded or saved.");
      setInitialDataLoaded(true);
      return;
    }

    setIsFirestoreAvailable(true);
    if (profileError === "Database service is not available. Profile data cannot be loaded or saved.") {
      setProfileError(null);
    }
    
    fetchUserProfile(firestore, user);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, firestore]);

  /**
   * Handles submission of the profile information form.
   * Updates Firebase Auth profile and Firestore documents.
   * @param {ProfileSettingsFormValues} values - The validated form values.
   */
  async function onSubmitProfile(values: ProfileSettingsFormValues) {
    if (!user || !auth?.currentUser) {
      setProfileError("User not authenticated. Please sign in again.");
      toast({ title: "Authentication Error", description: "User not authenticated.", variant: "destructive" });
      return;
    }
    if (!firestore) {
      setProfileError("Database service is not available. Profile cannot be saved.");
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

    try {
      await updateProfile(currentUser, { displayName: newUsername });
      authDisplayNameUpdated = true;

      const batch = writeBatch(firestore);
      const userProfileRef = doc(firestore, 'users', currentUser.uid) as DocumentReference<DocumentData>;
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
      reset(values);

    } catch (error: any) {
      console.error("Error updating profile:", error);
      let specificErrorMessage = "An error occurred while saving your profile to the database.";
      if (error.code === 'permission-denied') {
        specificErrorMessage = `Saving profile details to the database failed due to permissions. (Details: ${error.message})`;
      } else {
        specificErrorMessage = getFirebaseAuthErrorMessage(error.code) || specificErrorMessage;
      }
      
      // *** ATOMIC REVERT on error ***
      // If Auth displayName was updated but Firestore failed, revert the Auth update.
      if (authDisplayNameUpdated && initialUsername) {
        specificErrorMessage = `Your profile could not be saved to the database. Reverting changes. Details: ${error.message}`;
        await updateProfile(currentUser, { displayName: initialUsername });
      }
      
      setProfileError(specificErrorMessage);
      toast({
        title: "Profile Update Failed",
        description: specificErrorMessage,
        variant: "destructive"
      })
    } finally {
      setProfileSaving(false);
    }
  }

  if (!initialDataLoaded) {
    return (
      <div className="flex justify-center items-center p-4"><Loader2 className="h-6 w-6 animate-spin text-primary" /> Loading profile...</div>
    );
  }

  return (
    <>
      <FormAlert title="Profile Error" message={profileError} variant="destructive" className="mb-4" />
      {!isFirestoreAvailable && !profileError && (
         <FormAlert title="Configuration Error" message="Database service is not available. Profile data cannot be loaded or saved." variant="destructive" className="mb-4" />
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
                    <Input placeholder="Your first name" {...field} disabled={profileSaving || !isFirestoreAvailable} />
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
                      <Input placeholder="Your last name" {...field} disabled={profileSaving || !isFirestoreAvailable} />
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
                    <Input placeholder="Your username" {...field} disabled={profileSaving || !isFirestoreAvailable} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div>
            <FormLabel>Email Address</FormLabel>
            <Input type="email" value={user?.email || 'N/A'} disabled className="mt-2 bg-muted/50" />
            <p className="text-xs text-muted-foreground mt-1">
              Your email address is managed in the Security section.
            </p>
          </div>
          <div className="space-y-2">
            <FormLabel>Profile Photo</FormLabel>
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center text-muted-foreground overflow-hidden">
                {profilePhotoPreview ? (
                  <Image
                    src={profilePhotoPreview}
                    alt="Profile preview"
                    width={80}
                    height={80}
                    className="object-cover h-full w-full"
                    data-ai-hint="person avatar"
                  />
                ) : (
                  <ImageIcon size={32} />
                )}
              </div>
            </div>
             <p className="text-xs text-muted-foreground">
                Profile photo upload is not implemented in this version.
            </p>
          </div>
          <Button type="submit" disabled={profileSaving || !isFirestoreAvailable || !user || !formState.isDirty}>
            {(profileSaving) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Profile Changes
          </Button>
        </form>
      </Form>
    </>
  );
}
