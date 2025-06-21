// src/components/dashboard/dashboard-page-content.tsx
// This component renders the main content of the user dashboard page.
// It uses the `useAuth` hook to access authenticated user data and sign-out functionality.
// It's typically wrapped by `ProtectedRoute` at the page level.

'use client'; // Client component due to use of hooks like `useAuth`.

import { useAuth } from '@/contexts/auth-context'; // Hook to access authentication state and functions
import { Card, CardContent } from '@/components/ui/card'; // ShadCN Card components for layout

// Import child components that make up the dashboard sections
import { DashboardHeader } from './dashboard-header';
import { UserProfileSummary } from './user-profile-summary';
import { LoginActivitySummary } from './login-activity-summary';
import { AccountManagementActions } from './account-management-actions';
import { Separator } from '../ui/separator';

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

  // Fallback: If `user` is somehow null despite `ProtectedRoute` (should not happen in normal flow).
  // `ProtectedRoute` is the primary guard and should redirect before this component renders with a null user.
  if (!user) {
      return null; // Or a minimal error/loader, but ProtectedRoute should prevent this.
  }

  return (
    // Main container for the dashboard page content, centered and with padding.
    <div className="container mx-auto max-w-2xl py-8 px-4">
        <Card className="w-full shadow-lg">
            <CardContent className="p-6 space-y-6">
                <DashboardHeader user={user} />
                <Separator />
                <UserProfileSummary user={user} />
                <Separator />
                <LoginActivitySummary user={user} />
                <Separator />
                <AccountManagementActions user={user} signOut={signOut} />
            </CardContent>
        </Card>
    </div>
  );
}
