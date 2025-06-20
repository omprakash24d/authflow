
'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

export function NotificationPreferences() {
  const { toast } = useToast();
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(false);
  const [smsNotificationsEnabled, setSmsNotificationsEnabled] = useState(false);

  const handleEmailNotificationChange = (checked: boolean) => {
    setEmailNotificationsEnabled(checked);
    toast({
      title: 'Notification Preference Updated',
      description: `Email notifications ${checked ? 'enabled' : 'disabled'}. (Simulated save)`,
    });
  };

  const handleSmsNotificationChange = (checked: boolean) => {
    setSmsNotificationsEnabled(checked);
    toast({
      title: 'Notification Preference Updated',
      description: `SMS notifications ${checked ? 'enabled' : 'disabled'}. (Simulated save)`,
    });
  };

  return (
    <section>
      <h2 className="text-xl font-semibold font-headline text-primary mb-4 flex items-center">
        <Bell className="mr-2 h-5 w-5" /> Notification Preferences
      </h2>
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Manage how you receive notifications from us.
        </p>

        <div className="space-y-4">
          {/* Email Notifications Setting */}
          <div>
            <Label htmlFor="email-notifications" className="text-base font-medium">
              Email Notifications
            </Label>
            <div className="flex items-center justify-between mt-2">
              <p className="text-sm text-muted-foreground max-w-md">
                Receive important account updates, newsletters, and promotional emails.
              </p>
              <Switch
                id="email-notifications"
                checked={emailNotificationsEnabled}
                onCheckedChange={handleEmailNotificationChange}
                aria-label="Toggle email notifications"
              />
            </div>
          </div>

          {/* SMS Notifications Setting */}
          <div>
            <Label htmlFor="sms-notifications" className="text-base font-medium">
              SMS Notifications
            </Label>
            <div className="flex items-center justify-between mt-2">
              <p className="text-sm text-muted-foreground max-w-md">
                Receive critical alerts and verification codes via text message.
              </p>
              <Switch
                id="sms-notifications"
                checked={smsNotificationsEnabled}
                onCheckedChange={handleSmsNotificationChange}
                aria-label="Toggle SMS notifications"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

