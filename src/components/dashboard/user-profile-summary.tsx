
'use client';

import { useState, useEffect } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { firestore } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { Loader2, User as UserIcon } from 'lucide-react';

interface UserProfileSummaryProps {
  user: FirebaseUser;
}

export function UserProfileSummary({ user }: UserProfileSummaryProps) {
  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState<boolean>(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      if (firestore) {
        const fetchUserProfile = async () => {
          setProfileLoading(true);
          setProfileError(null);
          try {
            const userProfileRef = doc(firestore, 'users', user.uid);
            const docSnap = await getDoc(userProfileRef);
            if (docSnap.exists()) {
              const profileData = docSnap.data();
              setFirstName(profileData.firstName || null);
              setLastName(profileData.lastName || null);
            } else {
              console.warn(`User profile document not found for UID: ${user.uid}`);
              setFirstName(null); // Explicitly set to null if not found
              setLastName(null);
            }
          } catch (error: any) {
            console.error("Error fetching user profile:", error);
            setProfileError("Could not load profile information from database.");
          } finally {
            setProfileLoading(false);
          }
        };
        fetchUserProfile();
      } else {
        // Firestore is not available
        setProfileLoading(false);
        setProfileError("Database service is not available for profile information.");
        setFirstName(null); 
        setLastName(null);
      }
    } else { // No user
      setFirstName(null);
      setLastName(null);
      setProfileLoading(false);
      setProfileError(null);
    }
  }, [user]);

  return (
    <div className="space-y-3 text-sm">
      <h3 className="text-lg font-semibold font-headline text-primary flex items-center">
        <UserIcon className="mr-2 h-5 w-5" /> Account Information
      </h3>
      <p><strong>Username:</strong> {user.displayName || 'Not set'}</p>
      <p>
        <strong>First Name:</strong>{' '}
        {profileLoading ? (
          <Loader2 className="inline-block h-4 w-4 animate-spin" />
        ) : profileError ? (
          <span className="text-destructive">{profileError}</span>
        ) : firstName ? (
          firstName
        ) : (
          <span className="text-muted-foreground">Not set</span>
        )}
      </p>
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
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Email Verified:</strong> {user.emailVerified ? 
        <span className="text-green-600 dark:text-green-400 font-medium">Yes</span> : 
        <span className="text-red-600 dark:text-red-400 font-medium">No</span>}
      </p>
      <p><strong>User ID:</strong> <span className="text-xs">{user.uid}</span></p>
    </div>
  );
}
