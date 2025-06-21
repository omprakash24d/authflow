// src/app/layout.tsx
// This file defines the root layout for the entire application.
// It wraps all pages and includes global providers like AuthProvider and ThemeProvider.

import type { Metadata } from 'next';
import './globals.css'; // Imports global styles, including Tailwind CSS base and theme variables.
import { Toaster } from '@/components/ui/toaster'; // Component for displaying toast notifications.
import { AuthProvider } from '@/contexts/auth-context'; // Provides authentication state to the app.
import { ThemeProvider } from '@/components/theme-provider'; // Manages light/dark theme.
import type { PropsWithChildren } from 'react';

/**
 * Metadata for the root layout.
 * This is the default metadata for the application unless overridden by specific pages.
 */
export const metadata: Metadata = {
  title: 'AuthFlow', // Default title for the application
  description: 'Comprehensive User and Authentication System by Firebase Studio', // Default description
  manifest: '/site.webmanifest', // Link to the webmanifest file
  themeColor: [ // Theme color for browsers and PWA
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
  icons: {
    icon: '/images/favicon.ico',
    shortcut: '/images/favicon-16x16.png',
    apple: '/images/apple-touch-icon.png',
  },
};

/**
 * RootLayout component.
 * This component sets up the basic HTML structure (html, head, body) and
 * wraps its children with necessary context providers.
 * @param {PropsWithChildren<{}>} props - Props containing children elements.
 * @returns JSX.Element
 */
export default function RootLayout({ children }: PropsWithChildren<{}>) {
  return (
    // `suppressHydrationWarning` is often used with next-themes to prevent warnings
    // related to server-rendered class names for themes differing from client-side.
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to Google Fonts for performance. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Link to the Inter font stylesheet. */}
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        {/* Other head elements like favicons, meta tags can be added here or in page-specific metadata. */}
      </head>
      <body className="font-body antialiased"> {/* Sets default font and enables anti-aliasing. */}
        {/* ThemeProvider manages dark/light mode switching. Default is now 'light'. */}
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {/* AuthProvider manages user authentication state across the app. */}
          <AuthProvider>
            {children} {/* Renders the active page content. */}
            <Toaster /> {/* Renders toast notifications. */}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
