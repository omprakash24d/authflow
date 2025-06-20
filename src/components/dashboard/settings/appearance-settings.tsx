
'use client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Palette } from 'lucide-react';

export function AppearanceSettings() {
  const { toast } = useToast();
  
  return (
    <section>
      <h2 className="text-xl font-semibold font-headline text-primary mb-4 flex items-center">
        <Palette className="mr-2 h-5 w-5" /> Appearance
      </h2>
      <div className="space-y-2">
        <p className="text-sm">Customize the look and feel of the application (coming soon).</p>
        <Button variant="outline" className="w-full justify-start" onClick={() => toast({ title: 'Coming Soon', description: 'Dark/Light mode toggle will be added in a future update.' })}>
          Toggle Dark/Light Mode
        </Button>
      </div>
    </section>
  );
}
