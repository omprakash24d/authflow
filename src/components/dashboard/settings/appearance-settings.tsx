
'use client';

import { useTheme } from 'next-themes';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Palette, Sun, Moon, MonitorSmartphone } from 'lucide-react';
import { useEffect, useState } from 'react';

export function AppearanceSettings() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render a skeleton or placeholder to avoid hydration mismatch and layout shift
    return (
      <section>
        <h2 className="text-xl font-semibold font-headline text-primary mb-4 flex items-center">
          <Palette className="mr-2 h-5 w-5" /> Appearance
        </h2>
        <div className="space-y-2">
          <p className="text-sm mb-4">
            Customizing theme...
          </p>
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
        <RadioGroup
          value={currentTheme}
          onValueChange={(value) => setTheme(value)}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <Label
            htmlFor="theme-light"
            className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer transition-colors"
          >
            <RadioGroupItem value="light" id="theme-light" className="sr-only" />
            <Sun className="mb-3 h-6 w-6" />
            Light
          </Label>

          <Label
            htmlFor="theme-dark"
            className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer transition-colors"
          >
            <RadioGroupItem value="dark" id="theme-dark" className="sr-only" />
            <Moon className="mb-3 h-6 w-6" />
            Dark
          </Label>

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
