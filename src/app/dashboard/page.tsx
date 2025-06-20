
import type { Metadata } from 'next';
import DashboardPageContent from '@/components/dashboard/dashboard-page-content';
import { ProtectedRoute } from '@/components/protected-route'; // Import ProtectedRoute

export const metadata: Metadata = {
  title: 'User Dashboard | AuthFlow Account Management',
  description: 'Manage your AuthFlow account from your personalized dashboard. View profile details, update settings, and manage your authentication preferences securely.',
};

export default function DashboardPage() {
  return (
    <ProtectedRoute> {/* Wrap DashboardPageContent with ProtectedRoute */}
      <DashboardPageContent />
    </ProtectedRoute>
  );
}
