
'use client';

import { Bell } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function NotificationPreferences() {
  return (
    <section>
      <h2 className="text-xl font-semibold font-headline text-primary mb-4 flex items-center">
        <Bell className="mr-2 h-5 w-5" /> Notification Preferences
      </h2>
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Manage how you receive notifications from us. Full configuration options are coming soon.
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
              <TooltipProvider>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <Switch
                      id="email-notifications"
                      disabled
                      aria-label="Email notifications toggle (coming soon)"
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Configuration coming soon</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
              <TooltipProvider>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <Switch
                      id="sms-notifications"
                      disabled
                      aria-label="SMS notifications toggle (coming soon)"
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Configuration coming soon</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
