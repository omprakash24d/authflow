// src/app/layout.tsx
// This file defines the root layout for the entire application.
// It's the top-level component that wraps all pages and includes global providers
// like AuthProvider and ThemeProvider, ensuring they are available everywhere.

import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google'; // Import next/font for font optimization
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/auth-context';
import { ThemeProvider } from '@/components/theme-provider';
import type { PropsWithChildren } from 'react';

// Configure the Inter font from Google Fonts using next/font.
// This handles font optimization automatically (e.g., self-hosting, removing unused glyphs).
// Exporting it as a CSS variable allows for more flexible use within Tailwind CSS.
const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // 'swap' ensures text is visible with a fallback font while Inter loads.
  variable: '--font-inter', // Defines a CSS variable for the font family.
});

/**
 * Root metadata for the application.
 * This provides a default title and a template for page-specific titles,
 * which is beneficial for SEO and browser tab clarity.
 */
export const metadata: Metadata = {
  title: {
    default: 'AuthFlow', // Default title for the application (e.g., on the homepage).
    template: '%s | AuthFlow', // Template for titles on other pages (e.g., "Sign In | AuthFlow").
  },
  description: 'A comprehensive, secure, and feature-rich user authentication system built with Next.js, Firebase, and Tailwind CSS.',
};

/**
 * Viewport configuration for the application.
 * Sets the theme color for the browser UI, which can adapt to light/dark mode.
 */
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

/**
 * RootLayout component.
 * This is the main layout component that structures the entire HTML document.
 * It sets up the basic HTML structure, applies the application's font, and
 * wraps all child components (pages) with necessary global context providers.
 *
 * @param {PropsWithChildren<{}>} props - Props object.
 * @param {React.ReactNode} props.children - The active page component being rendered by Next.js.
 * @returns JSX.Element
 */
export default function RootLayout({ children }: PropsWithChildren<{}>) {
  return (
    // `suppressHydrationWarning` is used with next-themes to prevent warnings
    // caused by the server rendering a different theme than the client's initial render.
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Additional head tags like favicons can be placed here. */}
        {/* next/font handles font optimization, so manual <link> tags are not needed for Google Fonts. */}
      </head>
      {/* Apply the font variable to the body and default to font-sans. `antialiased` provides smoother text rendering. */}
      <body className={`${inter.variable} font-sans antialiased`}>
        {/* ThemeProvider manages dark/light mode switching across the app. */}
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {/* AuthProvider manages user authentication state globally. */}
          <AuthProvider>
            {children} {/* Renders the active page content here. */}
            <Toaster /> {/* Renders toast notifications, available globally. */}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
