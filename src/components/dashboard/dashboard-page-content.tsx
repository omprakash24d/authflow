
'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import LoadingComponent from '@/app/loading'; // Import the global loading component

import { DashboardHeader } from './dashboard-header';
import { UserProfileSummary } from './user-profile-summary';
import { LoginActivitySummary } from './login-activity-summary';
import { AccountManagementActions } from './account-management-actions';

export default function DashboardPageContent() {
  const { user, signOut, loading: authLoading } = useAuth();

  if (authLoading) {
    return <LoadingComponent />; // Use the global loading component
  }
  
  // This case should ideally be handled by ProtectedRoute redirecting,
  // but as a fallback, prevent rendering dashboard content if user is null after loading.
  // Or, if not loading and user is null, ProtectedRoute will handle redirect.
  if (!user) { 
    // ProtectedRoute will handle the redirect, this return is a fallback or during transition.
    return <LoadingComponent />; // Show loader while redirecting
  }

  return (
    <ProtectedRoute>
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
    </ProtectedRoute>
  );
}
