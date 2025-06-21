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
 */
interface DashboardHeaderProps {
  user: FirebaseUser | null;
  profileData: UserProfileData | null;
  loadingProfile: boolean;
}

/**
 * Generates initials from a user's display name or email.
 * Used as a fallback for the Avatar if no image is available.
 * @param name - The user's display name (string), or null/undefined.
 * @param email - The user's email (string), or null/undefined, used as a fallback.
 * @returns A string of initials (e.g., "JD" for "John Doe"), or "??" if name is unavailable.
 */
const getInitials = (firstName: string | null, displayName: string | null, email: string | null): string => {
  const name = firstName || displayName;
  if (name) {
    const nameParts = name.split(' ');
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
  if (email) {
    return email[0].toUpperCase();
  }
  return '??';
};

/**
 * DashboardHeader component.
 * Displays a personalized header for the user dashboard.
 * @param {DashboardHeaderProps} props - The component's props.
 * @returns JSX.Element | null - Renders the header or null if no user is provided.
 */
export function DashboardHeader({ user, profileData, loadingProfile }: DashboardHeaderProps) {
  if (!user) return null;

  const getDisplayName = () => {
    if (profileData?.firstName) return profileData.firstName;
    if (user.displayName) return user.displayName.split(' ')[0]; // Use first part of display name
    if (user.email) return user.email.split('@')[0]; // Fallback to email prefix
    return "User";
  };

  const displayName = getDisplayName();

  return (
    <div className="flex flex-col items-center text-center space-y-4 pt-4">
      <Avatar className="h-24 w-24 border-2 border-primary/10 shadow-sm">
        <AvatarImage src={user.photoURL || undefined} alt={displayName} data-ai-hint="person avatar" />
        <AvatarFallback className="text-3xl">
          {getInitials(profileData?.firstName || null, user.displayName, user.email)}
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
