// src/components/dashboard/dashboard-header.tsx
// This component renders the header section of the user dashboard.
// It typically displays the user's avatar, a welcome message, and their name/email.

'use client'; // Client component as it might interact with user data passed as props.

import type { User as FirebaseUser } from 'firebase/auth'; // Firebase User type
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // ShadCN Avatar components
import { CardDescription, CardTitle } from '@/components/ui/card'; // ShadCN Card components for text styling

/**
 * Props for the DashboardHeader component.
 * @property user - The currently authenticated Firebase user object, or null if not available.
 */
interface DashboardHeaderProps {
  user: FirebaseUser | null;
}

/**
 * Generates initials from a user's display name.
 * Used as a fallback for the Avatar if no image is available.
 * @param name - The user's display name (string), or null/undefined.
 * @returns A string of initials (e.g., "JD" for "John Doe"), or "??" if name is unavailable.
 */
const getInitials = (name: string | null | undefined): string => {
  if (!name) return '??';
  const names = name.split(' ');
  if (names.length === 1 && name.length > 0) return name.substring(0, 2).toUpperCase(); // For single names
  if (names.length > 1 && names[0].length > 0 && names[names.length - 1].length > 0) {
    return (names[0][0] + names[names.length - 1][0]).toUpperCase(); // First and last initial
  }
  return name.substring(0,1).toUpperCase() || '??'; // Fallback to first letter or ??
};

/**
 * DashboardHeader component.
 * Displays a personalized header for the user dashboard.
 * @param {DashboardHeaderProps} props - The component's props.
 * @returns JSX.Element | null - Renders the header or null if no user is provided.
 */
export function DashboardHeader({ user }: DashboardHeaderProps) {
  if (!user) return null; // Don't render if no user data

  const displayName = user.displayName || user.email || "User"; // Fallback display name

  return (
    <>
      {/* User Avatar */}
      <div className="flex justify-center mb-4">
        <Avatar className="h-24 w-24"> {/* Large avatar */}
          {/* AvatarImage attempts to load user.photoURL. If it fails or is null, AvatarFallback is shown. */}
          <AvatarImage src={user.photoURL || undefined} alt={displayName} />
          <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
        </Avatar>
      </div>
      {/* Welcome Message */}
      <CardTitle className="text-3xl font-headline">Welcome to AuthFlow, {getInitials(displayName)}!</CardTitle>
      <CardDescription>This is your personalized dashboard.</CardDescription>
    </>
  );
}
