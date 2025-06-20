
import type { Metadata } from 'next';
import HomePageContent from '@/components/home/home-page-content';

export const metadata: Metadata = {
  title: 'AuthFlow: Secure & Scalable User Authentication System',
  description: 'Discover AuthFlow, a comprehensive user authentication solution built with Firebase and Next.js. Features email/password auth, social logins, MFA, and robust security for your applications.',
};

export default function Page() {
  return <HomePageContent />;
}
