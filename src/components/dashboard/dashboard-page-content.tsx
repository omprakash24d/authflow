// src/components/dashboard/dashboard-page-content.tsx
// This component renders the main content of the user dashboard page.
// It uses the `useAuth` hook to access authenticated user data and sign-out functionality.
// It also acts as a data-fetching container for the user's Firestore profile,
// passing down the data, loading, and error states to child components.

'use client'; // Client component due to use of hooks like `useAuth`, `useState`, `useEffect`.

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context'; // Hook to access authentication state and functions
import { Card, CardContent } from '@/components/ui/card'; // ShadCN Card components for layout
import { firestore } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { ProfileErrors } from '@/lib/constants/messages'; // Centralized messages

// Import child components that make up the dashboard sections
import { DashboardHeader } from './dashboard-header';
import { UserProfileSummary } from './user-profile-summary';
import { LoginActivitySummary } from './login-activity-summary';
import { AccountManagementActions } from './account-management-actions';
import { Separator } from '../ui/separator';
import { StatsCards } from './stats-cards';
import { RecentActivityChart } from './recent-activity-chart';

/**
 * Type definition for the user profile data fetched from Firestore.
 */
export type UserProfileData = {
  firstName: string | null;
  lastName: string | null;
  username: string | null;
};

/**
 * DashboardPageContent component.
 * Displays the main content for an authenticated user's dashboard, including profile summary,
 * login activity (mocked), and account management actions.
 * Assumes it's rendered within a context where `user` is guaranteed by `ProtectedRoute`.
 * @returns JSX.Element | null - Renders the dashboard content or null if user data is unexpectedly missing.
 */
export default function DashboardPageContent() {
  const { user, signOut } = useAuth();
  // State for Firestore profile data
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  /**
   * Effect to fetch the user's profile from Firestore upon component mount or when the user object changes.
   * This is the single source of truth for profile data in the dashboard.
   */
  useEffect(() => {
    const fetchUserProfile = async () => {
      // Guard clauses: ensure user and Firestore service are available.
      if (!user) {
        setLoadingProfile(false);
        return; // No user, no profile to fetch.
      }
       if (!firestore) {
        setLoadingProfile(false);
        setProfileError(ProfileErrors.dbServiceUnavailable);
        return; // Firestore not configured.
      }
      
      setLoadingProfile(true);
      setProfileError(null);
      try {
        const userProfileRef = doc(firestore, 'users', user.uid);
        const docSnap = await getDoc(userProfileRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Set the fetched profile data.
          setProfileData({
            firstName: data.firstName || null,
            lastName: data.lastName || null,
            username: data.username || null,
          });
        } else {
          // If no document exists, set profile data to nulls.
           console.warn(`No Firestore profile document found for user UID: ${user.uid}`);
          setProfileData({ firstName: null, lastName: null, username: null });
        }
      } catch (error) {
        console.error("Error fetching user profile from Firestore:", error);
        setProfileError(ProfileErrors.loadProfileError);
        setProfileData(null); // Ensure data is null on error.
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, [user]); // Re-run effect if the user object changes.

  // `ProtectedRoute` is the primary guard and should redirect before this component renders with a null user.
  // This check is a fallback.
  if (!user) {
      return null;
  }

  return (
    // Main container for the dashboard page content.
    <div className="p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-4xl mx-auto shadow-lg">
        <CardContent className="p-6">
          {/* Pass user object and profile loading/data states to the header. */}
          <DashboardHeader user={user} profileData={profileData} loadingProfile={loadingProfile} />
          <Separator className="my-8" />
          <div className="space-y-8">
            <StatsCards />
            <RecentActivityChart />
            {/* Pass all relevant states to the profile summary component. */}
            <UserProfileSummary user={user} profileData={profileData} loadingProfile={loadingProfile} profileError={profileError} />
            <LoginActivitySummary user={user} />
            <AccountManagementActions user={user} signOut={signOut} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
