// src/components/theme-provider.tsx
// This component wraps the application to provide theme (dark/light mode) management
// using the `next-themes` library.

'use client'; // This component uses client-side context from `next-themes`.

import type { PropsWithChildren } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes'; // The actual provider from the library

/**
 * ThemeProvider component.
 * Sets up the `next-themes` provider to enable theme switching (light, dark, system)
 * throughout the application.
 * @param {PropsWithChildren} props - Props containing the children to be wrapped by the provider.
 * @returns JSX.Element
 */
export function ThemeProvider({ children }: PropsWithChildren) {
  return (
    <NextThemesProvider
      attribute="class" // The HTML attribute to update (e.g., <html class="dark">)
      defaultTheme="system" // Default theme to use (can be 'light', 'dark', or 'system')
      enableSystem // Allows syncing with the user's operating system theme preference
      disableTransitionOnChange // Disables CSS transitions during theme switching to prevent flashes
    >
      {children} {/* Renders the rest of the application within the theme context */}
    </NextThemesProvider>
  );
}
