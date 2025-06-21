// src/components/dashboard/settings-page-content.tsx
// This component renders the main content for the Account Settings page.
// It uses a tabbed layout to organize various settings sections.
// Assumes it's rendered within a `ProtectedRoute` which handles auth checks via layout.

'use client'; // Client component as it uses client-side hooks and state for tabs.

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Import child components for different settings categories
import { ProfileInformationForm } from '@/components/dashboard/settings/profile-information-form';
import { SecuritySettings } from '@/components/dashboard/settings/security-settings';
import { NotificationPreferences } from '@/components/dashboard/settings/notification-preferences';
import { AppearanceSettings } from '@/components/dashboard/settings/appearance-settings';

/**
 * SettingsPageContent component.
 * Displays the structure for the account settings page, organizing different
 * settings forms and components into a user-friendly tabbed interface.
 * The use of tabs makes the UI cleaner and more scalable as new settings are added.
 * @returns JSX.Element
 */
export default function SettingsPageContent() {
  // Define the sections for the settings page. Each object corresponds to a tab.
  const settingsSections = [
    {
      value: "profile",
      title: "Profile Information",
      description: "Update your personal details and profile picture.",
      component: <ProfileInformationForm />,
    },
    {
      value: "security",
      title: "Security",
      description: "Change your password, email, and manage other security settings.",
      component: <SecuritySettings />,
    },
    {
      value: "notifications",
      title: "Notification Preferences",
      description: "Manage how you receive notifications from us.",
      component: <NotificationPreferences />,
    },
    {
      value: "appearance",
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
          Manage your account settings, profile, and preferences.
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        {/* Tab triggers for each section, responsive grid layout */}
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          {settingsSections.map((section) => (
            <TabsTrigger key={section.value} value={section.value}>
              {section.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Tab content panels for each section */}
        {settingsSections.map((section) => (
          <TabsContent key={section.value} value={section.value} className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {section.component}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
