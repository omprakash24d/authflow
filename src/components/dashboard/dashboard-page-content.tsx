// src/components/dashboard/dashboard-page-content.tsx
// This component renders the main content of the user dashboard page.
// It uses the `useAuth` hook to access authenticated user data and sign-out functionality.
// It's typically wrapped by `ProtectedRoute` at the page level.

'use client'; // Client component due to use of hooks like `useAuth`.

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context'; // Hook to access authentication state and functions
import { Card, CardContent } from '@/components/ui/card'; // ShadCN Card components for layout
import { firestore } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';

// Import child components that make up the dashboard sections
import { DashboardHeader } from './dashboard-header';
import { UserProfileSummary } from './user-profile-summary';
import { LoginActivitySummary } from './login-activity-summary';
import { AccountManagementActions } from './account-management-actions';
import { Separator } from '../ui/separator';

export type UserProfileData = {
  firstName: string | null;
  lastName: string | null;
};

/**
 * DashboardPageContent component.
 * Displays the main content for an authenticated user's dashboard, including profile summary,
 * login activity (mocked), and account management actions.
 * Assumes it's rendered within a context where `user` is guaranteed by `ProtectedRoute`.
 * @returns JSX.Element | null - Renders the dashboard content or null if user data is unexpectedly missing.
 */
export default function DashboardPageContent() {
  // `useAuth` provides the authenticated user object and signOut function.
  // The `loading` state from `useAuth` is typically handled by `ProtectedRoute` at the page level.
  const { user, signOut } = useAuth();
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user || !firestore) {
        setLoadingProfile(false);
        if (!firestore) setProfileError("Database service is not available.");
        return;
      }
      setLoadingProfile(true);
      setProfileError(null);
      try {
        const userProfileRef = doc(firestore, 'users', user.uid);
        const docSnap = await getDoc(userProfileRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfileData({
            firstName: data.firstName || null,
            lastName: data.lastName || null,
          });
        } else {
          setProfileData({ firstName: null, lastName: null });
        }
      } catch (error) {
        console.error("Error fetching user profile from Firestore:", error);
        setProfileError("Could not load profile data.");
        setProfileData(null); // Set to null on error
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  // Fallback: If `user` is somehow null despite `ProtectedRoute` (should not happen in normal flow).
  // `ProtectedRoute` is the primary guard and should redirect before this component renders with a null user.
  if (!user) {
      return null; // Or a minimal error/loader, but ProtectedRoute should prevent this.
  }

  return (
    // Main container for the dashboard page content.
    <div className="p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-2xl mx-auto shadow-lg">
        <CardContent className="p-6">
          <DashboardHeader user={user} profileData={profileData} loadingProfile={loadingProfile} />
          <Separator className="my-8" />
          <div className="space-y-8">
            <UserProfileSummary user={user} profileData={profileData} loadingProfile={loadingProfile} profileError={profileError} />
            <LoginActivitySummary user={user} />
            <AccountManagementActions user={user} signOut={signOut} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
