
'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { doc, getDoc, writeBatch, serverTimestamp, type WriteBatch, type Firestore, type DocumentReference, type DocumentData } from 'firebase/firestore';
import { auth, firestore } from '@/lib/firebase/config';
import { updateProfile, type User as FirebaseUser } from 'firebase/auth';
import Image from 'next/image';
import { ProfileSettingsSchema, type ProfileSettingsFormValues } from '@/lib/validators/auth';
import { getFirebaseAuthErrorMessage } from '@/lib/firebase/error-mapping';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FormAlert } from '@/components/ui/form-alert';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { User as UserIcon, Loader2, Image as ImageIcon, UploadCloud } from 'lucide-react';

async function prepareUsernameUpdates(
  newUsername: string,
  currentUsername: string | null,
  userId: string,
  userEmail: string | null,
  db: Firestore // Expects a non-null Firestore instance
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
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFirestoreAvailable, setIsFirestoreAvailable] = useState(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);


  const profileForm = useForm<ProfileSettingsFormValues>({
    resolver: zodResolver(ProfileSettingsSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
    },
  });

  useEffect(() => {
    // Define the async function to fetch profile data, accepting non-null Firestore and User
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
          profileForm.reset({
            firstName: profileData.firstName || '',
            lastName: profileData.lastName || '',
            username: profileData.username || currentFirebaseUser.displayName || '',
          });
          fetchedUsername = profileData.username || currentFirebaseUser.displayName || '';
          if (profileData.photoURL && profileData.photoURL !== currentFirebaseUser.photoURL) {
             setProfilePhotoPreview(profileData.photoURL);
          }
        } else {
          // If no profile doc, reset form with Auth display name or empty
          profileForm.reset({
            firstName: '', // Or attempt to derive from displayName if desired
            lastName: '',  // Or attempt to derive from displayName if desired
            username: currentFirebaseUser.displayName || '',
          });
        }
        setInitialUsername(fetchedUsername);
      } catch (error: any) {
        console.error("Error fetching user profile for settings:", error);
        setProfileError("Could not load your profile data.");
        toast({ title: "Error", description: "Could not load your profile data.", variant: "destructive" });
      } finally {
        setInitialDataLoaded(true);
      }
    };

    if (!user) {
      setInitialDataLoaded(true); // User is null, no data to load
      return;
    }

    if (!firestore) {
      setIsFirestoreAvailable(false);
      setProfileError("Database service is not available. Profile data cannot be loaded or saved.");
      // toast({ title: "Configuration Error", description: "Database service is not available, cannot load profile.", variant: "destructive" }); // Removed redundant toast
      setInitialDataLoaded(true);
      return;
    }

    // Firestore is available
    setIsFirestoreAvailable(true);
    // Clear previous "service unavailable" error if it was set
    if (profileError === "Database service is not available. Profile data cannot be loaded or saved.") {
      setProfileError(null);
    }
    
    // Call fetchUserProfile with the confirmed non-null user and firestore
    fetchUserProfile(firestore, user);

  }, [user, firestore, profileForm, toast, profileError]); // profileError added to allow clearing it


  const handlePhotoUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid File Type',
          description: 'Please select an image file (e.g., PNG, JPG, GIF).',
          variant: 'destructive',
        });
        return;
      }
      setProfilePhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      toast({
        title: 'Image Selected for Preview',
        description: 'Image preview updated. Backend upload functionality is currently commented out.',
      });
    }
  };


  async function onSubmitProfile(values: ProfileSettingsFormValues) {
    if (!user || !auth?.currentUser) {
      setProfileError("User not authenticated. Please sign in again.");
      toast({ title: "Authentication Error", description: "User not authenticated.", variant: "destructive" });
      return;
    }
    if (!firestore) {
      setProfileError("Database service is not available. Profile cannot be saved.");
      toast({ title: "Configuration Error", description: "Database service is not available, cannot save profile.", variant: "destructive" });
      setProfileSaving(false);
      return;
    }

    setProfileSaving(true);
    setProfileError(null);

    const currentUser = auth.currentUser;
    const newUsername = values.username.trim();
    let authDisplayNameUpdated = false;

    // --- Firebase Storage Upload Logic - Currently Commented Out ---
    // let newPhotoURL = currentUser.photoURL; 
    // if (profilePhotoFile) {
    //   toast({
    //       title: "Profile Photo (Upload Skipped)",
    //       description: "Profile photo upload to Firebase Storage is not yet implemented. This save will not include photo changes.",
    //       duration: 7000,
    //   });
    //   // console.log("Profile photo selected, actual upload to Firebase Storage needs implementation.", profilePhotoFile.name);
    //   // try {
    //   //   // const storage = getStorage(firebaseApp); // Assuming firebaseApp is your initialized app
    //   //   // const photoRef = storageRef(storage, `profilePhotos/${currentUser.uid}/${profilePhotoFile.name}`);
    //   //   // const snapshot = await uploadBytes(photoRef, profilePhotoFile);
    //   //   // newPhotoURL = await getDownloadURL(snapshot.ref);
    //   //   // toast({ title: "Photo Uploaded", description: "Your new profile photo has been uploaded." });
    //   // } catch (storageError: any) {
    //   //   console.error("Error uploading profile photo to Firebase Storage:", storageError);
    //   //   const storageErrorMessage = getFirebaseAuthErrorMessage(storageError.code); // Or a custom mapping for storage errors
    //   //   setProfileError(`Failed to upload photo: ${storageErrorMessage}. Profile text changes might still be saved.`);
    //   //   toast({ title: "Photo Upload Error", description: `Failed to upload photo: ${storageErrorMessage}`, variant: "destructive" });
    //   //   // Decide if you want to stop or continue with text updates
    //   //   // setProfileSaving(false); // Optionally stop here
    //   //   // return; 
    //   // }
    // }
    // --- End of Firebase Storage Upload Logic ---


    const usernameUpdateResult = await prepareUsernameUpdates(
      newUsername,
      initialUsername,
      currentUser.uid,
      currentUser.email,
      firestore // Firestore is confirmed non-null here
    );

    if (!usernameUpdateResult.success) {
      setProfileError(usernameUpdateResult.error || "Failed to process username change.");
      toast({ title: "Username Error", description: usernameUpdateResult.error || "Failed to process username change.", variant: "destructive" });
      setProfileSaving(false);
      return;
    }

    try {
      await updateProfile(currentUser, {
          displayName: newUsername,
          // photoURL: newPhotoURL, // Add this back when storage upload is implemented
      });
      authDisplayNameUpdated = true;
    } catch (authError: any) {
      console.error("Error updating Firebase Auth profile:", authError);
      const authErrorMessage = getFirebaseAuthErrorMessage(authError.code);
      setProfileError(`Failed to update profile in authentication: ${authErrorMessage}.`);
      toast({ title: "Auth Update Error", description: `Failed to update profile: ${authErrorMessage}`, variant: "destructive" });
      setProfileSaving(false);
      return;
    }


    try {
      const batch = writeBatch(firestore); // firestore is confirmed non-null
      const userProfileRef = doc(firestore, 'users', currentUser.uid) as DocumentReference<DocumentData>;


      const profileUpdateData: any = {
        firstName: values.firstName,
        lastName: values.lastName,
        username: newUsername,
        email: currentUser.email,
        // photoURL: newPhotoURL, // Add this back when storage upload is implemented
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

  if (!initialDataLoaded) {
    return (
      <section className="space-y-4">
         <h2 className="text-xl font-semibold font-headline text-primary mb-4 flex items-center">
            <UserIcon className="mr-2 h-5 w-5" /> Profile Information
        </h2>
        <div className="flex justify-center items-center p-4"><Loader2 className="h-6 w-6 animate-spin text-primary" /> Loading profile...</div>
      </section>
    );
  }


  return (
    <section>
      <h2 className="text-xl font-semibold font-headline text-primary mb-4 flex items-center">
        <UserIcon className="mr-2 h-5 w-5" /> Profile Information
      </h2>

      <FormAlert title="Profile Error" message={profileError} variant="destructive" className="mb-4" />

      {!isFirestoreAvailable && !profileError && ( // Only show this if profileError isn't already showing the same message
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
            <Label htmlFor="emailDisplay">Email Address</Label>
            <Input id="emailDisplay" type="email" value={user?.email || 'N/A'} disabled className="bg-muted/50" />
            <p className="text-xs text-muted-foreground mt-1">
              Your email address is managed in the Security section.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Profile Photo</Label>
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
              <Button
                type="button"
                variant="outline"
                onClick={handlePhotoUploadClick}
                disabled={profileSaving || !isFirestoreAvailable}
              >
                <UploadCloud className="mr-2 h-4 w-4" />
                {profilePhotoPreview ? 'Change Photo' : 'Upload Photo'}
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/gif"
                className="hidden"
                aria-label="Upload profile photo"
              />
            </div>
            <p className="text-xs text-muted-foreground">
                {profilePhotoFile ? `Selected: ${profilePhotoFile.name}` : "Select a PNG, JPG, or GIF."}
                 <br/>Actual upload to server requires backend implementation. Click save to update text fields.
            </p>
          </div>

          <Button type="submit" disabled={profileSaving || !isFirestoreAvailable || !user}>
            {(profileSaving) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Profile Changes
          </Button>
        </form>
      </Form>
    </section>
  );
}

