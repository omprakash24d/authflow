// src/components/dashboard/settings/profile-information-form.tsx
// This component provides a form for users to update their profile information,
// such as first name, last name, and username.
// It interacts with Firebase Auth for updating the main profile (displayName)
// and Firestore for storing/updating additional details and username uniqueness.

'use client'; // Client component due to form handling, state, and Firebase interactions.

import { useState, useEffect, useRef } from 'react';
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
import { Label } from '@/components/ui/label';
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

  const { formState } = profileForm;

  // useEffect to fetch and populate user profile data when the component mounts or user/firestore changes.
  useEffect(() => {
    // Defines an async function to fetch profile data.
    // Accepts non-null Firestore and FirebaseUser instances as arguments to satisfy TypeScript.
    const fetchUserProfile = async (fs: Firestore, currentFirebaseUser: FirebaseUser) => {
      try {
        // Set initial photo preview from Firebase Auth user profile if available.
        if (currentFirebaseUser.photoURL) {
          setProfilePhotoPreview(currentFirebaseUser.photoURL);
        }
        // Fetch detailed profile from 'users' collection in Firestore.
        const userProfileRef = doc(fs, 'users', currentFirebaseUser.uid);
        const docSnap = await getDoc(userProfileRef);
        let fetchedUsername = currentFirebaseUser.displayName || ''; // Fallback to Auth display name

        if (docSnap.exists()) {
          const profileData = docSnap.data();
          // Reset form with fetched data.
          profileForm.reset({
            firstName: profileData.firstName || '',
            lastName: profileData.lastName || '',
            username: profileData.username || currentFirebaseUser.displayName || '',
          });
          fetchedUsername = profileData.username || currentFirebaseUser.displayName || '';
          // If Firestore has a different photoURL (e.g., from a previous custom upload), prefer it.
          if (profileData.photoURL && profileData.photoURL !== currentFirebaseUser.photoURL) {
             setProfilePhotoPreview(profileData.photoURL);
          }
        } else {
          // If no profile document in Firestore, reset form with Auth display name or empty.
          profileForm.reset({
            firstName: '', // Or attempt to derive from displayName if desired logic existed
            lastName: '',
            username: currentFirebaseUser.displayName || '',
          });
          }
        setInitialUsername(fetchedUsername); // Store initial username for change detection
      } catch (error: any) {
        console.error("Error fetching user profile for settings:", error);
        setProfileError("Could not load your profile data from the database.");
      } finally {
        setInitialDataLoaded(true); // Mark initial data loading as complete
      }
    };

    if (!user) { // If no authenticated user, nothing to load
      setInitialDataLoaded(true);
      return;
    }

    if (!firestore) { // If Firestore service is not available
      setIsFirestoreAvailable(false);
      setProfileError("Database service is not available. Profile data cannot be loaded or saved.");
      setInitialDataLoaded(true);
      return;
    }

    // Firestore is available
    setIsFirestoreAvailable(true);
    // Clear previous "service unavailable" error if it was set, now that Firestore is available.
    if (profileError === "Database service is not available. Profile data cannot be loaded or saved.") {
      setProfileError(null);
    }
    
    // Call fetchUserProfile with the confirmed non-null user and firestore instances.
    fetchUserProfile(firestore, user);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, firestore]); // Dependencies for useEffect

  /**
   * Handles submission of the profile information form.
   * Updates Firebase Auth profile and Firestore documents.
   * @param {ProfileSettingsFormValues} values - The validated form values.
   */
  async function onSubmitProfile(values: ProfileSettingsFormValues) {
    // Ensure user and auth service are available
    if (!user || !auth?.currentUser) {
      setProfileError("User not authenticated. Please sign in again.");
      toast({ title: "Authentication Error", description: "User not authenticated.", variant: "destructive" });
      return;
    }
    // Ensure Firestore service is available
    if (!firestore) {
      setProfileError("Database service is not available. Profile cannot be saved.");
      setProfileSaving(false); // Reset saving state if already true
      return;
    }

    setProfileSaving(true);
    setProfileError(null);

    const currentUser = auth.currentUser; // Get current user from Firebase Auth
    const newUsername = values.username.trim();
    let authDisplayNameUpdated = false; // Flag to track if Auth profile update was attempted/succeeded

    // Prepare username updates (checks availability, prepares Firestore batch ops)
    const usernameUpdateResult = await prepareUsernameUpdates(
      newUsername,
      initialUsername,
      currentUser.uid,
      currentUser.email,
      firestore // Firestore is confirmed non-null here
    );

    if (!usernameUpdateResult.success) { // If username check failed (e.g., taken)
      setProfileError(usernameUpdateResult.error || "Failed to process username change.");
      toast({ title: "Username Error", description: usernameUpdateResult.error || "Failed to process username change.", variant: "destructive" });
      setProfileSaving(false);
      return;
    }

    try {
      // Update Firebase Auth profile (displayName)
      await updateProfile(currentUser, {
          displayName: newUsername,
      });
      authDisplayNameUpdated = true; // Mark Auth profile as updated
    } catch (authError: any) {
      console.error("Error updating Firebase Auth profile:", authError);
      const authErrorMessage = getFirebaseAuthErrorMessage(authError.code);
      setProfileError(`Failed to update profile in authentication: ${authErrorMessage}. Other changes might be pending.`);
      toast({ title: "Auth Update Error", description: `Failed to update profile: ${authErrorMessage}`, variant: "destructive" });
      setProfileSaving(false);
      return; // Stop if core Auth profile update fails
    }

    // Proceed to update Firestore data
    try {
      const batch = writeBatch(firestore); // Create a Firestore batch
      const userProfileRef = doc(firestore, 'users', currentUser.uid) as DocumentReference<DocumentData>;

      // Data for the 'users' collection document
      const profileUpdateData: any = {
        firstName: values.firstName,
        lastName: values.lastName,
        username: newUsername,
        email: currentUser.email, // Keep email synced, though it's changed via Security section
        updatedAt: serverTimestamp(),
      };
      batch.set(userProfileRef, profileUpdateData, { merge: true }); // Merge to avoid overwriting unrelated fields

      // If username changed, add operations from `prepareUsernameUpdates` to the batch
      if (usernameUpdateResult.batchOperations) {
        usernameUpdateResult.batchOperations(batch);
      }

      await batch.commit(); // Commit all Firestore changes atomically

      // If username was successfully changed, update initialUsername for subsequent edits
      if (usernameUpdateResult.usernameChanged) {
        setInitialUsername(newUsername);
      }

      toast({
        title: 'Profile Updated',
        description: 'Your profile information has been successfully saved.',
      });
      profileForm.reset(values); // Reset form state to make it not "dirty"

    } catch (firestoreError: any) { // Handle Firestore update errors
      console.error("Error updating profile in Firestore:", firestoreError);
      let specificErrorMessage = "An error occurred while saving your profile to the database.";
      if (firestoreError.code === 'permission-denied' || (firestoreError.message && firestoreError.message.toLowerCase().includes('permission denied'))) {
        specificErrorMessage = `Saving profile details to the database failed due to permissions. (Details: ${firestoreError.message})`;
         // If Auth display name was updated but Firestore failed, inform the user
         if (authDisplayNameUpdated) {
          specificErrorMessage = `Auth display name was updated to "${newUsername}", but ${specificErrorMessage}`;
        }
      } else {
        specificErrorMessage = getFirebaseAuthErrorMessage(firestoreError.code) || specificErrorMessage;
      }
      setProfileError(specificErrorMessage);
    } finally {
      setProfileSaving(false); // Reset saving state
    }
  }

  // Display a loader while initial data is being fetched
  if (!initialDataLoaded) {
    return (
      <div className="flex justify-center items-center p-4"><Loader2 className="h-6 w-6 animate-spin text-primary" /> Loading profile...</div>
    );
  }

  return (
    <section>
      {/* Display general profile errors */}
      <FormAlert title="Profile Error" message={profileError} variant="destructive" className="mb-4" />

      {/* Display error if Firestore is unavailable and profileError isn't already showing it */}
      {!isFirestoreAvailable && !profileError && (
         <FormAlert title="Configuration Error" message="Database service is not available. Profile data cannot be loaded or saved." variant="destructive" className="mb-4" />
      )}

      <Form {...profileForm}>
        <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-4">
          {/* First Name and Last Name Fields */}
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
          {/* Username Field */}
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
          {/* Email Display (read-only) */}
          <div>
            <Label htmlFor="emailDisplay">Email Address</Label>
            <Input id="emailDisplay" type="email" value={user?.email || 'N/A'} disabled className="bg-muted/50" />
            <p className="text-xs text-muted-foreground mt-1">
              Your email address is managed in the Security section.
            </p>
          </div>

          {/* Profile Photo Upload Section */}
          <div className="space-y-2">
            <Label>Profile Photo</Label>
            <div className="flex items-center gap-4">
              {/* Photo Preview */}
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center text-muted-foreground overflow-hidden">
                {profilePhotoPreview ? (
                  <Image
                    src={profilePhotoPreview} // Can be data URL or existing photoURL
                    alt="Profile preview"
                    width={80}
                    height={80}
                    className="object-cover h-full w-full"
                    data-ai-hint="person avatar"
                  />
                ) : (
                  <ImageIcon size={32} /> // Placeholder icon
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
                Profile photo upload is not implemented in this version.
            </p>
          </div>

          {/* Save Button */}
          <Button type="submit" disabled={profileSaving || !isFirestoreAvailable || !user || !formState.isDirty}>
            {(profileSaving) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Profile Changes
          </Button>
        </form>
      </Form>
    </section>
  );
}
