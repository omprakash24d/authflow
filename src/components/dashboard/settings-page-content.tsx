
'use client';

import Link from 'next/link';
// useRouter is no longer needed here for redirection if user is null
// import { useRouter } from 'next/navigation'; 

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
// Alert related components are no longer needed here for auth checks
// import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import { ProfileInformationForm } from '@/components/dashboard/settings/profile-information-form';
import { SecuritySettings } from '@/components/dashboard/settings/security-settings';
import { NotificationPreferences } from '@/components/dashboard/settings/notification-preferences';
import { AppearanceSettings } from '@/components/dashboard/settings/appearance-settings';

// useAuth is still needed if child components rely on it or if user object is directly used.
// For now, it's used by ProfileInformationForm implicitly.
import { useAuth } from '@/contexts/auth-context'; 
import { ChevronLeft } from 'lucide-react';
// Loader2 and AlertTriangle for auth checks are removed as ProtectedRoute handles this.
// import { Loader2, AlertTriangle } from 'lucide-react';


export default function SettingsPageContent() {
  // authLoading and user checks are now handled by ProtectedRoute at the page level.
  // const { user, loading: authLoading } = useAuth(); // No longer need authLoading here.
  // const router = useRouter(); // No longer needed for redirect logic here.

  // If this component renders, ProtectedRoute has ensured user exists and auth is not loading.
  // The ProfileInformationForm and other sub-components might use useAuth() internally.

  return (
    <div className="flex min-h-screen flex-col items-center bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-2xl">
        <Button variant="outline" size="sm" asChild className="mb-6">
          <Link href="/dashboard">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        <Card className="w-full shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Account Settings</CardTitle>
            <CardDescription>Manage your profile, security, and other preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <ProfileInformationForm />
            <Separator />
            <SecuritySettings />
            <Separator />
            <NotificationPreferences />
            <Separator />
            <AppearanceSettings />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
