// src/components/dashboard/user-profile-summary.tsx
// This component displays a summary of the authenticated user's profile information,
// such as username, first name, last name, email, and verification status.
// It fetches first/last name from Firestore if available.

'use client'; // Client component due to useEffect for data fetching and state.

import { useState, useEffect } from 'react';
import type { User as FirebaseUser } from 'firebase/auth'; // Firebase User type
import { firestore } from '@/lib/firebase/config'; // Firestore instance
import { doc, getDoc } from 'firebase/firestore'; // Firestore functions
import { Loader2, User as UserIcon } from 'lucide-react'; // Icons

/**
 * Props for the UserProfileSummary component.
 * @property user - The currently authenticated Firebase user object.
 */
interface UserProfileSummaryProps {
  user: FirebaseUser;
}

/**
 * UserProfileSummary component.
 * Shows key details from the user's Firebase Auth profile and additional
 * details (first/last name) fetched from their Firestore profile document.
 * @param {UserProfileSummaryProps} props - The component's props.
 * @returns JSX.Element
 */
export function UserProfileSummary({ user }: UserProfileSummaryProps) {
  // State for first name and last name, fetched from Firestore
  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState<boolean>(true); // Loading state for Firestore fetch
  const [profileError, setProfileError] = useState<string | null>(null); // Error state for Firestore fetch

  // useEffect to fetch additional profile details (first/last name) from Firestore
  // when the component mounts or the user/firestore objects change.
  useEffect(() => {
    if (user) { // Only proceed if user object is available
      if (firestore) { // Check if Firestore service instance is available
        const fetchUserProfile = async () => {
          setProfileLoading(true);
          setProfileError(null);
          try {
            // Reference to the user's profile document in the 'users' collection
            const userProfileRef = doc(firestore, 'users', user.uid);
            const docSnap = await getDoc(userProfileRef);
            if (docSnap.exists()) {
              // If document exists, extract data
              const profileData = docSnap.data();
              setFirstName(profileData.firstName || null); // Set first name, fallback to null
              setLastName(profileData.lastName || null);   // Set last name, fallback to null
            } else {
              // Document doesn't exist (e.g., user signed up via social login before profile creation, or data missing)
              console.warn(`User profile document not found for UID: ${user.uid} in Firestore.`);
              setFirstName(null); 
              setLastName(null);
            }
          } catch (error: any) {
            console.error("Error fetching user profile from Firestore:", error);
            setProfileError("Could not load profile information from database.");
          } finally {
            setProfileLoading(false); // Finished loading (success or error)
          }
        };
        fetchUserProfile();
      } else {
        // Firestore service is not available (e.g., config issue)
        setProfileLoading(false);
        setProfileError("Database service is not available for profile information.");
        setFirstName(null); 
        setLastName(null);
      }
    } else { // No user object provided (should not happen if called correctly)
      setFirstName(null);
      setLastName(null);
      setProfileLoading(false);
      setProfileError(null);
    }
  }, [user, firestore]); // Dependencies: re-run if user or firestore instance changes

  return (
    <div className="space-y-3 text-sm"> {/* Container with vertical spacing */}
      <h3 className="text-lg font-semibold font-headline text-primary flex items-center">
        <UserIcon className="mr-2 h-5 w-5" /> Account Information
      </h3>
      <p><strong>Username:</strong> {user.displayName || 'Not set'}</p>
      
      {/* Display First Name with loading/error/fallback states */}
      <p>
        <strong>First Name:</strong>{' '}
        {profileLoading ? (
          <Loader2 className="inline-block h-4 w-4 animate-spin" /> // Loading spinner
        ) : profileError ? (
          <span className="text-destructive">{profileError}</span> // Error message
        ) : firstName ? (
          firstName // Display first name
        ) : (
          <span className="text-muted-foreground">Not set</span> // Fallback if not set
        )}
      </p>

      {/* Display Last Name with loading/error/fallback states */}
      <p>
        <strong>Last Name:</strong>{' '}
        {profileLoading ? (
          <Loader2 className="inline-block h-4 w-4 animate-spin" />
        ) : profileError ? (
          <span className="text-destructive">{profileError}</span>
        ) : lastName ? (
          lastName
        ) : (
          <span className="text-muted-foreground">Not set</span>
        )}
      </p>
      <p><strong>Email:</strong> {user.email || 'N/A'}</p>
      <p>
        <strong>Email Verified:</strong> {user.emailVerified ? 
          <span className="text-green-600 dark:text-green-400 font-medium">Yes</span> : 
          <span className="text-red-600 dark:text-red-400 font-medium">No</span>
        }
      </p>
      <p><strong>User ID (UID):</strong> <span className="text-xs">{user.uid}</span></p>
    </div>
  );
}
