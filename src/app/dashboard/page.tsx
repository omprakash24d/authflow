// src/app/dashboard/page.tsx
// This file defines the main Dashboard page, accessible only to authenticated users.
// Authentication is handled by the layout (`/dashboard/layout.tsx`).

import type { Metadata } from 'next';
import DashboardPageContent from '@/components/dashboard/dashboard-page-content';

/**
 * Metadata for the Dashboard page.
 * Provides title and description for SEO and browser tab.
 */
export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Manage your AuthFlow account from your personalized dashboard. View profile details, update settings, and manage your authentication preferences securely.',
};

/**
 * DashboardPage component.
 * Renders the main content of the dashboard.
 * @returns JSX.Element
 */
export default function DashboardPage() {
  // The `ProtectedRoute` wrapper is now in the layout file for this route group,
  // so it doesn't need to be here.
  return <DashboardPageContent />;
}
