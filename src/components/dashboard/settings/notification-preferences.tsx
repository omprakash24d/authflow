
'use client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Bell } from 'lucide-react';

export function NotificationPreferences() {
  const { toast } = useToast();

  return (
    <section>
      <h2 className="text-xl font-semibold font-headline text-primary mb-4 flex items-center">
        <Bell className="mr-2 h-5 w-5" /> Notification Preferences
      </h2>
      <div className="space-y-2">
        <p className="text-sm">Manage how you receive notifications from us (coming soon).</p>
        <Button variant="outline" className="w-full justify-start" onClick={() => toast({ title: 'Coming Soon', description: 'Email notification settings will be added in a future update.' })}>
          Configure Email Notifications
        </Button>
        <Button variant="outline" className="w-full justify-start" onClick={() => toast({ title: 'Coming Soon', description: 'SMS notification settings will be added in a future update.' })}>
          Configure SMS Notifications
        </Button>
      </div>
    </section>
  );
}
