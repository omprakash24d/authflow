// src/components/dashboard/settings-page-content.tsx
// This component renders the main content for the Account Settings page.
// It structures various settings sections like Profile Information, Security, etc.
// Assumes it's rendered within a `ProtectedRoute` which handles auth checks.

'use client'; // Client component as it might use client-side hooks or state (though currently minimal).

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator'; // For visual separation between sections

// Import child components for different settings categories
import { ProfileInformationForm } from '@/components/dashboard/settings/profile-information-form';
import { SecuritySettings } from '@/components/dashboard/settings/security-settings';
import { NotificationPreferences } from '@/components/dashboard/settings/notification-preferences';
import { AppearanceSettings } from '@/components/dashboard/settings/appearance-settings';

// `useAuth` might be implicitly used by child components like ProfileInformationForm,
// so it's good to be aware of its context, though not directly used here for auth checks.
// import { useAuth } from '@/contexts/auth-context'; 
import { ChevronLeft } from 'lucide-react'; // Icon for back button

/**
 * SettingsPageContent component.
 * Displays the structure for the account settings page, organizing different
 * settings forms and components into sections.
 * @returns JSX.Element
 */
export default function SettingsPageContent() {
  // Authentication checks (user presence, loading state) are primarily handled by
  // the `ProtectedRoute` component that wraps this page's route in `src/app/dashboard/settings/page.tsx`.
  // Thus, if this component renders, the user is assumed to be authenticated.

  return (
    <div className="flex min-h-screen flex-col items-center bg-background p-4 sm:p-6 lg:p-8">
      {/* Container to constrain the width of the settings content */}
      <div className="w-full max-w-2xl">
        {/* Back button to navigate to the main dashboard */}
        <Button variant="outline" size="sm" asChild className="mb-6">
          <Link href="/dashboard">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        {/* Main card containing all settings sections */}
        <Card className="w-full shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Account Settings</CardTitle>
            <CardDescription>Manage your profile, security, and other preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8"> {/* Vertical spacing between settings sections */}
            {/* Profile Information Section */}
            <ProfileInformationForm />
            <Separator /> {/* Visual separator */}
            
            {/* Security Settings Section */}
            <SecuritySettings />
            <Separator />
            
            {/* Notification Preferences Section */}
            <NotificationPreferences />
            <Separator />
            
            {/* Appearance Settings Section */}
            <AppearanceSettings />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
