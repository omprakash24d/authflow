// src/app/layout.tsx
// This file defines the root layout for the entire application.
// It wraps all pages and includes global providers like AuthProvider and ThemeProvider.

import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google'; // Import next/font
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/auth-context';
import { ThemeProvider } from '@/components/theme-provider';
import type { PropsWithChildren } from 'react';

// Configure the Inter font from Google Fonts using next/font
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

/**
 * Metadata for the root layout.
 * Provides a default title and a template for page-specific titles.
 */
export const metadata: Metadata = {
  title: {
    default: 'AuthFlow', // Default title for the application
    template: '%s | AuthFlow', // Template for titles on other pages
  },
  description: 'Comprehensive User and Authentication System by Firebase Studio',
};

/**
 * Viewport configuration for the application.
 * Sets the theme color for the browser UI.
 */
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

/**
 * RootLayout component.
 * This component sets up the basic HTML structure and wraps its children with
 * necessary context providers and applies the optimized font.
 * @param {PropsWithChildren<{}>} props - Props containing children elements.
 * @returns JSX.Element
 */
export default function RootLayout({ children }: PropsWithChildren<{}>) {
  return (
    // `suppressHydrationWarning` is used with next-themes to prevent warnings.
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* next/font handles font optimization, so manual <link> tags are no longer needed. */}
      </head>
      {/* Apply the font class from next/font and enable anti-aliasing. */}
      <body className={`${inter.className} antialiased`}>
        {/* ThemeProvider manages dark/light mode switching. */}
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
