// src/components/theme-provider.tsx
// This component wraps the application to provide theme (dark/light mode) management
// using the `next-themes` library.

'use client'; // This component uses client-side context from `next-themes`.

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ThemeProviderProps } from 'next-themes/dist/types'; // Import the props type from the library

/**
 * ThemeProvider component.
 * A wrapper around the `NextThemesProvider` that passes all props through.
 * This allows theme configuration (like defaultTheme) to be set at the usage site (e.g., in layout.tsx).
 * @param {ThemeProviderProps} props - Props from `next-themes`, including `children`.
 * @returns JSX.Element
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
