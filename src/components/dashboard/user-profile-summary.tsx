// src/components/dashboard/user-profile-summary.tsx
// This component displays a summary of the authenticated user's profile information.
// It is a "dumb" or presentational component that receives all its data via props
// from its parent (`DashboardPageContent`).

'use client'; // Client component due to state for copy-to-clipboard functionality.

import { useState } from 'react';
import type { User as FirebaseUser } from 'firebase/auth'; // Firebase User type
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User as UserIcon, CheckCircle, XCircle, Copy, Check, AlertTriangle } from 'lucide-react'; // Icons
import type { UserProfileData } from './dashboard-page-content'; // Import shared type

/**
 * Props for the UserProfileSummary component.
 * @property user - The currently authenticated Firebase user object.
 * @property profileData - The fetched profile data (first/last name) from Firestore.
 * @property loadingProfile - Boolean indicating if the profile data is still being loaded.
 * @property profileError - An error message string if fetching the profile data failed.
 */
interface UserProfileSummaryProps {
  user: FirebaseUser;
  profileData: UserProfileData | null;
  loadingProfile: boolean;
  profileError: string | null;
}

/**
 * UserProfileSummary component.
 * Renders key details from the user's Firebase Auth profile and additional
 * details (first/last name) from their Firestore profile document.
 * @param {UserProfileSummaryProps} props - The component's props.
 * @returns JSX.Element
 */
export function UserProfileSummary({ user, profileData, loadingProfile, profileError }: UserProfileSummaryProps) {
  const { toast } = useToast();
  const [isUidCopied, setIsUidCopied] = useState(false);

  /**
   * Handles copying the user's UID to the clipboard.
   * Provides feedback via toast notifications.
   */
  const handleCopyUid = () => {
    navigator.clipboard.writeText(user.uid).then(() => {
        toast({ title: "Copied!", description: "User ID has been copied to your clipboard." });
        setIsUidCopied(true);
        setTimeout(() => setIsUidCopied(false), 2000); // Reset icon after 2 seconds
    }, (err) => {
        toast({ title: "Failed to Copy", description: "Could not copy User ID.", variant: "destructive" });
        console.error('Failed to copy text: ', err);
    });
  };

  /**
   * Helper function to render the value of a profile field.
   * It handles loading and error states for a clean UI.
   * @param {string | null} value - The value of the profile field (e.g., first name).
   * @returns JSX.Element
   */
  const renderProfileValue = (value: string | null) => {
    if (loadingProfile) return <Loader2 className="inline-block h-4 w-4 animate-spin" />;
    if (profileError) {
      return (
        <span className="text-destructive text-xs flex items-center gap-1" aria-live="polite">
          <AlertTriangle className="h-3 w-3" />
          Error loading
        </span>
      );
    }
    return value || <span className="text-muted-foreground">Not set</span>;
  };

  return (
    <div className="space-y-4"> {/* Container with vertical spacing */}
      <h3 className="text-lg font-semibold font-headline text-primary flex items-center">
        <UserIcon className="mr-2 h-5 w-5" /> Account Information
      </h3>
      <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
        {/* Username */}
        <div className="space-y-1">
          <dt className="font-medium text-muted-foreground">Username</dt>
          <dd>{user.displayName || <span className="text-muted-foreground">Not set</span>}</dd>
        </div>
        
        {/* First Name */}
        <div className="space-y-1">
          <dt className="font-medium text-muted-foreground">First Name</dt>
          <dd>{renderProfileValue(profileData?.firstName ?? null)}</dd>
        </div>

        {/* Last Name */}
        <div className="space-y-1">
          <dt className="font-medium text-muted-foreground">Last Name</dt>
          <dd>{renderProfileValue(profileData?.lastName ?? null)}</dd>
        </div>
        
        {/* Email */}
        <div className="space-y-1">
          <dt className="font-medium text-muted-foreground">Email</dt>
          <dd className="truncate">{user.email || 'N/A'}</dd>
        </div>

        {/* Email Verification Status */}
        <div className="space-y-1">
          <dt className="font-medium text-muted-foreground">Email Verified</dt>
          <dd className="flex items-center gap-2">
              {user.emailVerified ? (
                  <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-green-600 dark:text-green-400 font-medium">Yes</span>
                  </>
              ) : (
                  <>
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-red-600 dark:text-red-400 font-medium">No</span>
                  </>
              )}
          </dd>
        </div>

        {/* User ID (UID) */}
        <div className="space-y-1">
          <dt className="font-medium text-muted-foreground">User ID (UID)</dt>
          <dd className="flex items-center gap-2">
            <span className="truncate font-mono text-xs">{user.uid}</span>
            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={handleCopyUid} aria-label="Copy User ID">
                 {isUidCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </dd>
        </div>
      </dl>
    </div>
  );
}
