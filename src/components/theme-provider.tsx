// src/components/theme-provider.tsx
// This component wraps the application to provide theme (dark/light mode) management
// using the `next-themes` library.

'use client'; // This component uses client-side context from `next-themes`.

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ThemeProviderProps } from 'next-themes/dist/types'; // Import the props type from the library

/**
 * ThemeProvider component.
 * A wrapper around the `NextThemesProvider` from the `next-themes` library. It passes all props
 * through, allowing theme configuration to be set where the provider is used (e.g., in `src/app/layout.tsx`).
 *
 * This component makes it easy to manage light mode, dark mode, and system theme preferences
 * throughout the application.
 *
 * @param {ThemeProviderProps} props - Props accepted by `next-themes`'s `ThemeProvider`.
 *   Common props include:
 *   - `children`: The child components to be wrapped by the provider.
 *   - `attribute`: The HTML attribute to modify (e.g., 'class' for Tailwind CSS).
 *   - `defaultTheme`: The theme to use on the first visit or if no preference is stored (e.g., 'system', 'light', 'dark').
 *   - `enableSystem`: Whether to enable the 'system' theme option.
 *   - `disableTransitionOnChange`: Prevents theme-change transitions to avoid flashes of unstyled content.
 * @returns JSX.Element
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
