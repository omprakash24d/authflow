// src/components/dashboard/settings-page-content.tsx
// This component renders the main content for the Account Settings page.
// It structures various settings sections like Profile Information, Security, etc.
// Assumes it's rendered within a `ProtectedRoute` which handles auth checks via layout.

'use client'; // Client component as it might use client-side hooks or state.

import { Card, CardContent } from '@/components/ui/card';

// Import child components for different settings categories
import { ProfileInformationForm } from '@/components/dashboard/settings/profile-information-form';
import { SecuritySettings } from '@/components/dashboard/settings/security-settings';
import { NotificationPreferences } from '@/components/dashboard/settings/notification-preferences';
import { AppearanceSettings } from '@/components/dashboard/settings/appearance-settings';

/**
 * SettingsPageContent component.
 * Displays the structure for the account settings page, organizing different
 * settings forms and components into sections.
 * @returns JSX.Element
 */
export default function SettingsPageContent() {
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Account Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your account settings and set e-mail preferences.
        </p>
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
