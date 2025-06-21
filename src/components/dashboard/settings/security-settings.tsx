// src/components/dashboard/settings/security-settings.tsx
// This component provides UI elements for managing account security settings,
// such as changing password, changing email, and enabling Two-Factor Authentication (2FA).

'use client'; // Client component due to state for dialog visibility.

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChangePasswordDialog } from '@/components/dashboard/settings/change-password-dialog'; // Dialog for password change
import { ChangeEmailDialog } from '@/components/dashboard/settings/change-email-dialog'; // Dialog for email change
import { useToast } from '@/hooks/use-toast'; // For "Coming Soon" messages

/**
 * SecuritySettings component.
 * Renders buttons to trigger dialogs for changing password and email.
 * Includes placeholder buttons for 2FA and login history (marked as "Coming Soon").
 * @returns JSX.Element
 */
export function SecuritySettings() {
  const { toast } = useToast();
  // State to control visibility of the Change Password dialog
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false);
  // State to control visibility of the Change Email dialog
  const [isChangeEmailDialogOpen, setIsChangeEmailDialogOpen] = useState(false);

  return (
    <div className="space-y-3"> {/* Vertical spacing for buttons */}
      {/* Button to open Change Password Dialog */}
      <Button variant="outline" className="w-full justify-start" onClick={() => setIsChangePasswordDialogOpen(true)}>
        Change Password
      </Button>
      
      {/* Button to open Change Email Dialog */}
      <Button variant="outline" className="w-full justify-start" onClick={() => setIsChangeEmailDialogOpen(true)}>
        Change Email Address
      </Button>
      
      {/* Placeholder for Two-Factor Authentication */}
      <Button 
        variant="outline" 
        className="w-full justify-start" 
        onClick={() => toast({ title: 'Coming Soon', description: 'Two-Factor Authentication (2FA) will be added in a future update.' })}
      >
        Enable Two-Factor Authentication (2FA)
      </Button>
      
      {/* Placeholder for viewing login history */}
      <Button 
        variant="outline" 
        className="w-full justify-start" 
        onClick={() => toast({ title: 'Coming Soon', description: 'Login history view will be added in a future update.' })}
      >
        View login history
      </Button>

      {/* Dialog components (rendered but hidden until `open` prop is true) */}
      <ChangePasswordDialog 
        open={isChangePasswordDialogOpen} 
        onOpenChange={setIsChangePasswordDialogOpen} 
      />
      <ChangeEmailDialog 
        open={isChangeEmailDialogOpen} 
        onOpenChange={setIsChangeEmailDialogOpen} 
      />
    </div>
  );
}
