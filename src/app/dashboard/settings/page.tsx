
// import type { Metadata } from 'next'; // Keep commented out for now
import SettingsPageContent from '@/components/dashboard/settings-page-content';
// import { ProtectedRoute } from '@/components/protected-route'; // Keep commented out for now

// export const metadata: Metadata = { // Keep commented out for now
//   title: 'Account Settings | AuthFlow',
//   description: 'Manage your AuthFlow account settings, profile, security, and notification preferences.',
// };

export default function SettingsPage() {
  // return ( // Keep ProtectedRoute commented out for now
  //   <ProtectedRoute>
  //     <SettingsPageContent />
  //   </ProtectedRoute>
  // );
  return <SettingsPageContent />;
}
