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
  doc, getDoc, writeBatch, serverTimestamp, setDoc,
  type WriteBatch, type Firestore, type DocumentReference, type DocumentData 
} from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'; // Photo upload
import { auth, firestore, storage } from '@/lib/firebase/config'; // Firebase auth and firestore instances
import { updateProfile, type User as FirebaseUser } from 'firebase/auth'; // Firebase Auth update function
import Image from 'next/image'; // Next.js Image component for optimized images
import { ProfileSettingsSchema, type ProfileSettingsFormValues } from '@/lib/validators/auth'; // Zod schema for validation
import { getFirebaseAuthErrorMessage } from '@/lib/firebase/error-mapping'; // Maps Firebase errors to messages
import { AuthErrors, ProfileErrors } from '@/lib/constants/messages'; // Centralized error messages

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FormAlert } from '@/components/ui/form-alert'; // For displaying form-level errors
import { useAuth } from '@/contexts/auth-context'; // Hook to access authenticated user
import { useToast } from '@/hooks/use-toast'; // Hook for toast notifications
import { Loader2, Image as ImageIcon } from 'lucide-react'; // Icons

/**
 * Prepares Firestore batch operations for updating or creating username documents.
 * This helper function centralizes the logic for username uniqueness checks.
 * @param newUsername - The new username to be set.
 * @param currentUsername - The user's current username (if any).
 * @param userId - The UID of the user.
 * @param userEmail - The user's email address.
 * @param db - The non-null Firestore instance.
 * @returns An object indicating success, error message, whether username changed, and the batch operations to perform.
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

  // If username hasn't changed (case-insensitively), no Firestore username update is needed.
  if (newUsernameLower === currentUsernameLower) {
    return { success: true, usernameChanged: false };
  }

  try {
    // Check if the new username is already taken by another user.
    const newUsernameRef = doc(db, 'usernames', newUsernameLower);
    const newUsernameSnap = await getDoc(newUsernameRef);
    if (newUsernameSnap.exists() && newUsernameSnap.data()?.uid !== userId) {
      return { success: false, error: ProfileErrors.usernameTaken(newUsername), usernameChanged: true };
    }
  } catch (error: any) {
    console.error("Error checking username availability:", error);
    return { success: false, error: ProfileErrors.verifyUsernameError, usernameChanged: true };
  }

  // If username is available or belongs to the current user, prepare batch operations.
  return {
    success: true,
    usernameChanged: true,
    // Return a function that applies the necessary operations to a Firestore WriteBatch.
    batchOperations: (batch: WriteBatch) => {
      // If there was an old username and it's different, delete the old username document.
      if (currentUsernameLower && currentUsernameLower !== newUsernameLower) {
        const oldUsernameRef = doc(db, 'usernames', currentUsernameLower);
        batch.delete(oldUsernameRef);
      }
      // Create or update the new username document.
      const newUsernameDocRef = doc(db, 'usernames', newUsernameLower);
      batch.set(newUsernameDocRef, {
        uid: userId,
        email: userEmail,
        username: newUsername, // Store cased username for display
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
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for hidden file input

  // State variables
  const [isSaving, setIsSaving] = useState(false); // Unified loading state for any save operation
  const [profileError, setProfileError] = useState<string | null>(null); // Form-level error messages
  const [initialUsername, setInitialUsername] = useState<string | null>(null); // Stores username on load to check for changes
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null); // Data URL for photo preview
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // For selected photo

  // Initialize react-hook-form
  const form = useForm<ProfileSettingsFormValues>({
    resolver: zodResolver(ProfileSettingsSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
    },
  });
  const { formState, reset } = form;

  // useEffect to fetch and populate user profile data when the component mounts or user/firestore changes.
  useEffect(() => {
    const fetchUserProfile = async (fs: Firestore, currentFirebaseUser: FirebaseUser) => {
      try {
        // Always prioritize the photo URL from the main Auth object, as it's the most current source.
        setProfilePhotoPreview(currentFirebaseUser.photoURL || null);

        const userProfileRef = doc(fs, 'users', currentFirebaseUser.uid);
        const docSnap = await getDoc(userProfileRef);
        let fetchedUsername = currentFirebaseUser.displayName || '';

        if (docSnap.exists()) {
          const profileData = docSnap.data();
          const defaultValues = {
            firstName: profileData.firstName || '',
            lastName: profileData.lastName || '',
            username: profileData.username || currentFirebaseUser.displayName || '',
          };
          reset(defaultValues);
          fetchedUsername = defaultValues.username;
        } else {
          // If no profile doc, use Auth profile as default
          reset({
            firstName: '',
            lastName: '',
            username: currentFirebaseUser.displayName || '',
          });
        }
        setInitialUsername(fetchedUsername);
      } catch (error: any) {
        console.error("Error fetching user profile for settings:", error);
        setProfileError(ProfileErrors.loadProfileError);
      }
    };

    if (user && firestore) {
      if (profileError) setProfileError(null);
      fetchUserProfile(firestore, user);
    } else if (!firestore) {
      setProfileError(ProfileErrors.dbServiceUnavailable);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, firestore, reset]);

  // Effect to clean up the object URL created for the photo preview to prevent memory leaks.
  useEffect(() => {
    const currentPreview = profilePhotoPreview;
    // This effect runs whenever profilePhotoPreview changes.
    // The cleanup function will be called before the effect runs again,
    // revoking the *previous* object URL.
    return () => {
      if (currentPreview && currentPreview.startsWith('blob:')) {
        URL.revokeObjectURL(currentPreview);
      }
    };
  }, [profilePhotoPreview]);


  // Handles file selection from the hidden input.
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setProfilePhotoPreview(previewUrl);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };


  /**
   * Handles submission of the profile information form.
   * Updates Firebase Auth profile and Firestore documents.
   * @param {ProfileSettingsFormValues} values - The validated form values.
   */
  async function onSubmitProfile(values: ProfileSettingsFormValues) {
    if (!user || !auth?.currentUser) {
      setProfileError(AuthErrors.userNotAuthenticated);
      return;
    }
    if (!firestore) {
      setProfileError(ProfileErrors.dbServiceUnavailable);
      return;
    }

    setIsSaving(true);
    setProfileError(null);

    const currentUser = auth.currentUser;
    let newPhotoURL: string | null = null;
    let authDisplayNameUpdated = false;

    try {
       // Step 1: Handle photo upload if a new file is selected.
      if (selectedFile) {
        if (!storage) {
          throw new Error(AuthErrors.photoUploadPrereqsNotMet);
        }
        const photoPath = `profile_photos/${user.uid}/${selectedFile.name.replace(/\s/g, '_')}`;
        const photoStorageRef = storageRef(storage, photoPath);
        const uploadResult = await uploadBytes(photoStorageRef, selectedFile);
        newPhotoURL = await getDownloadURL(uploadResult.ref);
      }

      // Step 2: Prepare username updates
      const newUsername = values.username.trim();
      const usernameUpdateResult = await prepareUsernameUpdates(newUsername, initialUsername, currentUser.uid, currentUser.email, firestore);
      if (!usernameUpdateResult.success) {
        throw new Error(usernameUpdateResult.error || "Failed to process username change.");
      }

      // Step 3: Update Firebase Auth Profile (displayName and new photoURL if available)
      const authProfileUpdate: { displayName: string; photoURL?: string } = {
        displayName: newUsername,
      };
      if (newPhotoURL) {
        authProfileUpdate.photoURL = newPhotoURL;
      } else { // Keep existing photo if no new one is uploaded
        authProfileUpdate.photoURL = currentUser.photoURL ?? undefined;
      }
      await updateProfile(currentUser, authProfileUpdate);
      authDisplayNameUpdated = true;

      // Step 4: Prepare and commit Firestore batch update
      const batch = writeBatch(firestore);
      const userProfileRef = doc(firestore, 'users', currentUser.uid) as DocumentReference<DocumentData>;
      const firestoreUpdateData: any = {
        firstName: values.firstName,
        lastName: values.lastName,
        username: newUsername,
        updatedAt: serverTimestamp(),
      };
      if (newPhotoURL) {
        firestoreUpdateData.photoURL = newPhotoURL;
      }
      batch.set(userProfileRef, firestoreUpdateData, { merge: true });

      if (usernameUpdateResult.batchOperations) {
        usernameUpdateResult.batchOperations(batch);
      }
      await batch.commit();

      // Step 5: Update local state and provide user feedback
      if (usernameUpdateResult.usernameChanged) {
        setInitialUsername(newUsername);
      }
      if(newPhotoURL) {
        setProfilePhotoPreview(newPhotoURL);
        setSelectedFile(null); // Clear staged file
      }

      toast({ title: 'Profile Updated', description: 'Your profile information has been successfully saved.' });
      reset(values); // Reset form with new defaults, marking it as "not dirty".

    } catch (error: any) {
      console.error("Error updating profile:", error);
      let specificErrorMessage = error.code ? getFirebaseAuthErrorMessage(error.code) : error.message || ProfileErrors.saveProfileError;
      
      if (authDisplayNameUpdated && initialUsername) {
        // Attempt to revert Auth profile if Firestore fails
        await updateProfile(currentUser, { displayName: initialUsername });
        specificErrorMessage = ProfileErrors.revertChangesError(error.message);
      }
      
      setProfileError(specificErrorMessage);
      toast({ title: "Profile Update Failed", description: specificErrorMessage, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }

  // Determine if the form can be submitted.
  const canSubmit = isSaving || !user || !firestore || (!formState.isDirty && !selectedFile);

  return (
    <>
      <FormAlert title="Profile Error" message={profileError} variant="destructive" className="mb-4" />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmitProfile)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your first name" {...field} disabled={isSaving} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                      <Input placeholder="Your last name" {...field} disabled={isSaving} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                    <Input placeholder="Your username" {...field} disabled={isSaving} />
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
              <div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleUploadClick}
                    disabled={isSaving}
                  >
                    <ImageIcon className="mr-2 h-4 w-4" />
                    {selectedFile ? 'Change Photo' : 'Choose Photo'}
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/png, image/jpeg, image/gif"
                  />
                </div>
            </div>
            {selectedFile ? (
              <p className="text-xs text-muted-foreground">
                New photo selected: <strong>{selectedFile.name}</strong>. Click "Save Changes" to upload it.
              </p>
            ) : (
               <p className="text-xs text-muted-foreground">
                For best results, upload a square image.
              </p>
            )}
          </div>
          <Button type="submit" disabled={canSubmit}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </form>
      </Form>
    </>
  );
}
