// src/components/dashboard/settings/appearance-settings.tsx
// This component allows users to manage the appearance settings of the application,
// specifically choosing between light, dark, or system theme.
// It uses `next-themes` library for theme management.

'use client'; // Client component due to theme context and state.

import { useTheme } from 'next-themes'; // Hook from next-themes for theme management
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'; // ShadCN RadioGroup for theme selection
import { Label } from '@/components/ui/label';
import { Palette, Sun, Moon, MonitorSmartphone } from 'lucide-react'; // Icons for theme options
import { useEffect, useState } from 'react'; // React hooks for managing mounted state

/**
 * AppearanceSettings component.
 * Renders options for the user to select their preferred theme (Light, Dark, System).
 * Displays the currently active resolved theme.
 * @returns JSX.Element
 */
export function AppearanceSettings() {
  const { theme, setTheme, resolvedTheme } = useTheme(); // `theme` is the stored preference, `resolvedTheme` is what's active
  const [mounted, setMounted] = useState(false); // State to track if the component has mounted

  // useEffect to set `mounted` to true after the initial render.
  // This helps avoid hydration mismatches with `next-themes` which relies on client-side localStorage.
  useEffect(() => {
    setMounted(true);
  }, []);

  // If the component hasn't mounted yet, render a skeleton/placeholder.
  // This prevents UI inconsistencies or errors before `next-themes` has initialized on the client.
  if (!mounted) {
    return (
      <section>
        <h2 className="text-xl font-semibold font-headline text-primary mb-4 flex items-center">
          <Palette className="mr-2 h-5 w-5" /> Appearance
        </h2>
        <div className="space-y-2">
          <p className="text-sm mb-4">
            Customizing theme...
          </p>
          {/* Skeleton UI for theme options */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 h-[108px]">
                <div className="mb-3 h-6 w-6 bg-muted rounded-full animate-pulse" />
                <div className="h-4 w-16 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // The current theme preference (could be 'system', 'light', or 'dark').
  // Fallback to 'system' if `theme` is somehow undefined after mount.
  const currentTheme = theme || 'system';

  return (
    <section>
      <h2 className="text-xl font-semibold font-headline text-primary mb-4 flex items-center">
        <Palette className="mr-2 h-5 w-5" /> Appearance
      </h2>
      <div className="space-y-2">
        <p className="text-sm mb-4">
          Choose how AuthFlow looks to you. Select a single theme, or sync with your system.
          Your current active theme is: <span className="font-semibold capitalize">{resolvedTheme}</span>.
        </p>
        {/* RadioGroup for selecting the theme */}
        <RadioGroup
          value={currentTheme} // Current selected theme preference
          onValueChange={(value) => setTheme(value)} // Update theme preference on change
          className="grid grid-cols-1 sm:grid-cols-3 gap-4" // Layout for theme options
        >
          {/* Light Theme Option */}
          <Label
            htmlFor="theme-light"
            className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer transition-colors"
          >
            <RadioGroupItem value="light" id="theme-light" className="sr-only" />
            <Sun className="mb-3 h-6 w-6" />
            Light
          </Label>

          {/* Dark Theme Option */}
          <Label
            htmlFor="theme-dark"
            className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer transition-colors"
          >
            <RadioGroupItem value="dark" id="theme-dark" className="sr-only" />
            <Moon className="mb-3 h-6 w-6" />
            Dark
          </Label>

          {/* System Theme Option */}
          <Label
            htmlFor="theme-system"
            className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer transition-colors"
          >
            <RadioGroupItem value="system" id="theme-system" className="sr-only" />
            <MonitorSmartphone className="mb-3 h-6 w-6" />
            System
          </Label>
        </RadioGroup>
      </div>
    </section>
  );
}
