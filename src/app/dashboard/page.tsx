// src/app/dashboard/page.tsx
// This file defines the main Dashboard page, which is the default landing page
// for authenticated users.

import type { Metadata } from 'next';
import DashboardPageContent from '@/components/dashboard/dashboard-page-content';

/**
 * Metadata for the Dashboard page.
 * Provides title and description for SEO and browser tab identification.
 */
export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Manage your AuthFlow account from your personalized dashboard. View profile details, update settings, and manage your authentication preferences securely.',
};

/**
 * DashboardPage component.
 * This is the entry point for the `/dashboard` route. It renders the main content
 * of the dashboard. The overall layout, including the sidebar and route protection,
 * is handled by the `src/app/dashboard/layout.tsx` file.
 * 
 * @returns JSX.Element
 */
export default function DashboardPage() {
  // Renders the component containing the actual dashboard UI.
  // This separation of concerns keeps the page file clean and focused on routing and metadata.
  return <DashboardPageContent />;
}
