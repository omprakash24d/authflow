
import type { Metadata } from 'next';
import DashboardPageContent from '@/components/dashboard/dashboard-page-content';

export const metadata: Metadata = {
  title: 'User Dashboard | AuthFlow Account Management',
  description: 'Manage your AuthFlow account from your personalized dashboard. View profile details, update settings, and manage your authentication preferences securely.',
};

export default function DashboardPage() {
  return <DashboardPageContent />;
}
