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

  const settingsSections = [
    {
      title: "Profile Information",
      description: "Update your personal details.",
      component: <ProfileInformationForm />,
    },
    {
      title: "Security",
      description: "Change your password and manage other security settings.",
      component: <SecuritySettings />,
    },
    {
      title: "Notification Preferences",
      description: "Manage how you receive notifications from us.",
      component: <NotificationPreferences />,
    },
    {
      title: "Appearance",
      description: "Choose how AuthFlow looks to you.",
      component: <AppearanceSettings />,
    },
  ];

  return (
    <div className="container mx-auto max-w-3xl py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold font-headline">Account Settings</h1>
        {/* Back button to navigate to the main dashboard */}
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <Card className="w-full shadow-lg">
        <CardContent className="divide-y divide-border p-0">
          {settingsSections.map((section, index) => (
            <div key={index} className="p-6 grid grid-cols-1 md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1 mb-4 md:mb-0">
                <h3 className="text-lg font-medium text-foreground">{section.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
              </div>
              <div className="md:col-span-2">
                {section.component}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
