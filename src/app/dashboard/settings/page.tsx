
import type { Metadata } from 'next';
import SettingsPageContent from '@/components/dashboard/settings-page-content';

// export const metadata: Metadata = {
//   title: 'Account Settings | AuthFlow Profile Management',
//   description: 'Update your AuthFlow profile information, manage security settings like password changes, and customize your notification preferences from the account settings page.',
// };

export default function SettingsPage() {
  return (
    <SettingsPageContent />
  );
}
