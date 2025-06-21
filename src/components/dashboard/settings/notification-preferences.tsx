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
      title: 'Preference Updated (Demo)',
      description: `Email notifications ${checked ? 'enabled' : 'disabled'}. In a real app, this would be saved to your profile.`,
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
      title: 'Preference Updated (Demo)',
      description: `SMS notifications ${checked ? 'enabled' : 'disabled'}. In a real app, this would be saved to your profile.`,
    });
    // In a real application, you would call an API here to save this preference,
    // potentially after verifying the user's phone number if enabling for the first time.
  };

  return (
    <div className="space-y-4">
      {/* Email Notifications Setting */}
      <div className="flex items-center justify-between space-x-2">
        <div className="flex-grow">
          <Label htmlFor="email-notifications" className="font-medium">
            Email Notifications
          </Label>
          <p className="text-xs text-muted-foreground">
            Receive important account updates and newsletters.
          </p>
        </div>
        <Switch
          id="email-notifications"
          checked={emailNotificationsEnabled}
          onCheckedChange={handleEmailNotificationChange}
          aria-label="Toggle email notifications"
        />
      </div>

      {/* SMS Notifications Setting */}
      <div className="flex items-center justify-between space-x-2">
        <div className="flex-grow">
          <Label htmlFor="sms-notifications" className="font-medium">
            SMS Notifications
          </Label>
           <p className="text-xs text-muted-foreground">
            Get critical alerts via text. (Requires phone setup)
          </p>
        </div>
        <Switch
          id="sms-notifications"
          checked={smsNotificationsEnabled}
          onCheckedChange={handleSmsNotificationChange}
          aria-label="Toggle SMS notifications"
        />
      </div>
    </div>
  );
}
