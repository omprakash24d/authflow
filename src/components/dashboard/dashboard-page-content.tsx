
'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

import { DashboardHeader } from './dashboard-header';
import { UserProfileSummary } from './user-profile-summary';
import { LoginActivitySummary } from './login-activity-summary';
import { AccountManagementActions } from './account-management-actions';

export default function DashboardPageContent() {
  const { user, signOut, loading: authLoading } = useAuth();

  if (authLoading || (!user && !authLoading)) {
     return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }
  
  // This case should ideally be handled by ProtectedRoute redirecting,
  // but as a fallback, prevent rendering dashboard content if user is null after loading.
  if (!user) { 
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p>Redirecting to sign-in...</p>
        <Loader2 className="ml-2 h-8 w-8 animate-spin text-primary" />
      </div>
    );
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
