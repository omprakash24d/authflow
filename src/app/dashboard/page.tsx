// src/app/dashboard/page.tsx
// This file defines the main Dashboard page, accessible only to authenticated users.
// It uses `ProtectedRoute` to ensure authentication before rendering content.

import type { Metadata } from 'next';
import DashboardPageContent from '@/components/dashboard/dashboard-page-content';
import { ProtectedRoute } from '@/components/protected-route'; // Component to handle route protection

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
 * This page is protected and requires user authentication.
 * It wraps `DashboardPageContent` with `ProtectedRoute` to enforce this.
 * @returns JSX.Element
 */
export default function DashboardPage() {
  return (
    // ProtectedRoute ensures that only authenticated users can access DashboardPageContent.
    // If the user is not authenticated, ProtectedRoute will handle redirection (e.g., to /signin).
    <ProtectedRoute>
      <DashboardPageContent />
    </ProtectedRoute>
  );
}
