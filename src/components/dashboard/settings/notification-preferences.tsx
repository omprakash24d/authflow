// src/components/dashboard/settings/notification-preferences.tsx
// This component allows users to manage their notification preferences,
// such as enabling or disabling email and SMS notifications.
// Currently, this is a UI-only demonstration; actual backend integration for saving
// these preferences is not implemented.

'use client'; // Client component due to state for switch controls.

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch'; // ShadCN Switch component
import { useToast } from '@/hooks/use-toast'; // For feedback on changes

/**
 * NotificationPreferences component.
 * Renders switches for users to toggle email and SMS notification settings.
 * Saves are simulated with toast messages.
 * @returns JSX.Element
 */
export function NotificationPreferences() {
  const { toast } = useToast();
  // State for email notification preference (defaulted to false for demo)
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(false);
  // State for SMS notification preference (defaulted to false for demo)
  const [smsNotificationsEnabled, setSmsNotificationsEnabled] = useState(false);

  /**
   * Handles changes to the email notification switch.
   * Updates local state and shows a toast message (simulating a save).
   * @param {boolean} checked - The new state of the switch.
   */
  const handleEmailNotificationChange = (checked: boolean) => {
    setEmailNotificationsEnabled(checked);
    toast({
      title: 'Notification Preference Updated',
      description: `Email notifications ${checked ? 'enabled' : 'disabled'}. (Simulated save)`,
    });
    // In a real application, you would call an API here to save this preference.
  };

  /**
   * Handles changes to the SMS notification switch.
   * Updates local state and shows a toast message (simulating a save).
   * @param {boolean} checked - The new state of the switch.
   */
  const handleSmsNotificationChange = (checked: boolean) => {
    setSmsNotificationsEnabled(checked);
    toast({
      title: 'Notification Preference Updated',
      description: `SMS notifications ${checked ? 'enabled' : 'disabled'}. (Simulated save)`,
    });
    // In a real application, you would call an API here to save this preference,
    // potentially after verifying the user's phone number if enabling for the first time.
  };

  return (
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
            Receive critical alerts and verification codes via text message. (Requires phone number setup)
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
  );
}
