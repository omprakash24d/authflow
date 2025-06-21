// src/app/dashboard/settings/page.tsx
// This file defines the Account Settings page within the dashboard.
// Authentication is handled by the layout (`/dashboard/layout.tsx`).

import type { Metadata } from 'next';
import SettingsPageContent from '@/components/dashboard/settings-page-content';

/**
 * Metadata for the Account Settings page.
 * Provides title and description for SEO and browser tab.
 */
export const metadata: Metadata = {
  title: 'Account Settings',
  description: 'Manage your AuthFlow account settings, profile, security, and notification preferences.',
};

/**
 * SettingsPage component.
 * Renders the main content of the settings page.
 * @returns JSX.Element
 */
export default function SettingsPage() {
  // The `ProtectedRoute` wrapper is now in the layout file for this route group,
  // so it doesn't need to be here.
  return <SettingsPageContent />;
}
