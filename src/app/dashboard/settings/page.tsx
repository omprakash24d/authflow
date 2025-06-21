// src/app/dashboard/settings/page.tsx
// This file defines the Account Settings page within the dashboard.
// It serves as the entry point for the `/dashboard/settings` route.

import type { Metadata } from 'next';
import SettingsPageContent from '@/components/dashboard/settings-page-content';

/**
 * Metadata for the Account Settings page.
 * Provides title and description for SEO and browser tab identification.
 */
export const metadata: Metadata = {
  title: 'Account Settings',
  description: 'Manage your AuthFlow account settings, profile, security, and notification preferences.',
};

/**
 * SettingsPage component.
 * This component renders the main content of the settings page. The overall layout,
 * including the sidebar and route protection, is handled by the `src/app/dashboard/layout.tsx` file.
 * 
 * @returns JSX.Element
 */
export default function SettingsPage() {
  // Renders the component containing the tabbed interface for various settings.
  // This keeps the page component simple and focused on its primary role.
  return <SettingsPageContent />;
}
