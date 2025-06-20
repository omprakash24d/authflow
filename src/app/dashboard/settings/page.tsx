
import type { Metadata } from 'next';
import SettingsPageContent from '@/components/dashboard/settings-page-content';
import { ProtectedRoute } from '@/components/protected-route';

export const metadata: Metadata = {
  title: 'Account Settings | AuthFlow',
  description: 'Manage your AuthFlow account settings, profile, security, and notification preferences.',
};

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsPageContent />
    </ProtectedRoute>
  );
}
