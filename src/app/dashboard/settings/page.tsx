// src/app/dashboard/settings/page.tsx
// This file defines the Account Settings page within the dashboard,
// accessible only to authenticated users.
// It uses `ProtectedRoute` to ensure authentication.

import type { Metadata } from 'next';
import SettingsPageContent from '@/components/dashboard/settings-page-content';
import { ProtectedRoute } from '@/components/protected-route'; // Component for route protection

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
 * This page is protected and requires user authentication.
 * It wraps `SettingsPageContent` with `ProtectedRoute`.
 * @returns JSX.Element
 */
export default function SettingsPage() {
  return (
    // ProtectedRoute ensures that only authenticated users can access SettingsPageContent.
    // If unauthenticated, the user will be redirected (e.g., to /signin).
    <ProtectedRoute>
      <SettingsPageContent />
    </ProtectedRoute>
  );
}
