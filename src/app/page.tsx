// src/app/page.tsx
// This file defines the main landing page (homepage) of the application.
// It typically displays content for unauthenticated users, guiding them to sign up or sign in.

import type { Metadata } from 'next';
import HomePageContent from '@/components/home/home-page-content';

/**
 * Metadata for the Home page.
 * Provides title and description for SEO and browser tab.
 */
export const metadata: Metadata = {
  title: 'Secure & Scalable User Authentication System',
  description: 'Discover AuthFlow, a comprehensive user authentication solution built with Firebase and Next.js. Features email/password auth, social logins, MFA, and robust security for your applications.',
};

/**
 * Page component for the root route ('/').
 * Renders the `HomePageContent` component, which contains the actual UI for the landing page.
 * @returns JSX.Element
 */
export default function Page() {
  return <HomePageContent />;
}
