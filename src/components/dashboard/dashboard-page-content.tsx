
'use client';

import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
// LoadingComponent is no longer needed here as ProtectedRoute handles it
// import LoadingComponent from '@/app/loading'; 

import { DashboardHeader } from './dashboard-header';
import { UserProfileSummary } from './user-profile-summary';
import { LoginActivitySummary } from './login-activity-summary';
import { AccountManagementActions } from './account-management-actions';

export default function DashboardPageContent() {
  // authLoading check is now handled by ProtectedRoute at the page level.
  // user object will be available if this component renders.
  const { user, signOut } = useAuth(); 

  // Fallback if somehow user is null despite ProtectedRoute (should not happen in normal flow)
  if (!user) {
      // ProtectedRoute should have redirected, but as a safe fallback, render nothing or a minimal loader/error.
      // For simplicity, returning null as ProtectedRoute is the primary guard.
      return null; 
  }

  return (
    // The ProtectedRoute wrapper is removed from here as it's now at the page level
    <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-background">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center">
          <DashboardHeader user={user} />
        </CardHeader>
        <CardContent className="space-y-6">
          <UserProfileSummary user={user} />
          <LoginActivitySummary user={user} />
          <AccountManagementActions user={user} signOut={signOut} />
        </CardContent>
      </Card>
    </div>
  );
}
