// src/components/dashboard/dashboard-header.tsx
// This component renders the header section of the user dashboard.
// It typically displays the user's avatar, a welcome message, and their name/email.

'use client'; // Client component as it might interact with user data passed as props.

import type { User as FirebaseUser } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import type { UserProfileData } from './dashboard-page-content';

/**
 * Props for the DashboardHeader component.
 * @property user - The currently authenticated Firebase user object, or null if not available.
 * @property profileData - The fetched profile data (first/last name) from Firestore.
 * @property loadingProfile - Boolean indicating if the profile data is still being loaded.
 */
interface DashboardHeaderProps {
  user: FirebaseUser | null;
  profileData: UserProfileData | null;
  loadingProfile: boolean;
}

/**
 * Generates initials from a user's name or email.
 * This is used as a fallback for the Avatar if no profile image is available.
 * @param firstName - The user's first name from Firestore, if available.
 * @param displayName - The user's displayName from Firebase Auth profile, as a fallback.
 * @param email - The user's email, as a final fallback.
 * @returns A string of initials (e.g., "JD"), or "??" if no name info is available.
 */
const getInitials = (firstName: string | null, displayName: string | null, email: string | null): string => {
  const name = firstName || displayName;
  if (name) {
    const nameParts = name.split(' ');
    // Handle cases with middle names by taking first and last initial.
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
    }
    // Handle single names.
    return name.substring(0, 2).toUpperCase();
  }
  // Fallback to the first letter of the email.
  if (email) {
    return email[0].toUpperCase();
  }
  // Ultimate fallback if no data is present.
  return '??';
};

/**
 * DashboardHeader component.
 * Displays a personalized header for the user dashboard, with loading states.
 * @param {DashboardHeaderProps} props - The component's props.
 * @returns JSX.Element | null - Renders the header or null if no user is provided.
 */
export function DashboardHeader({ user, profileData, loadingProfile }: DashboardHeaderProps) {
  if (!user) return null;

  /**
   * Gets the user's display name for the welcome message, with fallbacks.
   * This logic is self-contained and simple, so it doesn't need to be extracted.
   * In a more complex scenario, this could be a shared utility function.
   * @returns The name to display in the header greeting.
   */
  const getDisplayName = () => {
    if (profileData?.firstName) return profileData.firstName;
    if (user.displayName) return user.displayName.split(' ')[0]; // Use first part of display name
    if (user.email) return user.email.split('@')[0]; // Fallback to email prefix
    return "User"; // Generic fallback
  };

  const displayName = getDisplayName();
  const avatarInitials = getInitials(profileData?.firstName || null, user.displayName, user.email);

  return (
    <div className="flex flex-col items-center text-center space-y-4 pt-4">
      <Avatar className="h-24 w-24 border-2 border-primary/10 shadow-sm">
        <AvatarImage src={user.photoURL || undefined} alt={displayName} data-ai-hint="person avatar" />
        <AvatarFallback className="text-3xl">
          {avatarInitials}
        </AvatarFallback>
      </Avatar>
      <div>
        {loadingProfile ? (
          <Skeleton className="h-8 w-48 mt-1" />
        ) : (
          <h2 className="text-3xl font-bold font-headline">
            Welcome back, {displayName}!
          </h2>
        )}
        <p className="text-md text-muted-foreground mt-2">
          This is your personalized dashboard.
        </p>
      </div>
    </div>
  );
}
