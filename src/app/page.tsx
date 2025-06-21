// src/app/page.tsx
// This file defines the main landing page (homepage) of the application.
// It serves as the entry point for the root URL ('/').

import type { Metadata } from 'next';
import HomePageContent from '@/components/home/home-page-content';

/**
 * Metadata for the Home page.
 * Provides title and description for SEO and browser tab identification.
 */
export const metadata: Metadata = {
  title: 'Secure & Scalable User Authentication System',
  description: 'Discover AuthFlow, a comprehensive user authentication solution built with Firebase and Next.js. Features email/password auth, social logins, MFA, and robust security for your applications.',
};

/**
 * Page component for the root route ('/').
 * This component's primary role is to render the `HomePageContent`, which contains
 * the actual UI for the landing page. This separation of concerns keeps the page
 * file clean and focused on its purpose within the routing structure.
 * 
 * @returns JSX.Element
 */
export default function Page() {
  return <HomePageContent />;
}
