// src/components/dashboard/settings/security-settings.tsx
// This component provides UI elements for managing account security settings,
// such as changing password, changing email, and enabling Two-Factor Authentication (2FA).

'use client'; // Client component due to state for dialog visibility.

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ChangePasswordDialog } from '@/components/dashboard/settings/change-password-dialog'; // Dialog for password change
import { ChangeEmailDialog } from '@/components/dashboard/settings/change-email-dialog'; // Dialog for email change
import { MfaEnrollmentDialog } from '@/components/dashboard/settings/mfa-enrollment-dialog';
import { MfaUnenrollDialog } from '@/components/dashboard/settings/mfa-unenroll-dialog';
import { useToast } from '@/hooks/use-toast'; // For "Coming Soon" messages
import { useAuth } from '@/contexts/auth-context';
import { ShieldCheck, ShieldOff } from 'lucide-react';

/**
 * SecuritySettings component.
 * Renders buttons to trigger dialogs for changing password and email.
 * Includes placeholder buttons for 2FA and login history (marked as "Coming Soon").
 * @returns JSX.Element
 */
export function SecuritySettings() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  // State to control visibility of the dialogs
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false);
  const [isChangeEmailDialogOpen, setIsChangeEmailDialogOpen] = useState(false);
  const [isMfaEnrollDialogOpen, setIsMfaEnrollDialogOpen] = useState(false);
  const [isMfaUnenrollDialogOpen, setIsMfaUnenrollDialogOpen] = useState(false);

  // Memoize the MFA status to avoid re-calculating on every render
  const isMfaEnabled = useMemo(() => {
    if (authLoading || !user) return false;
    return user.multiFactor?.enrolledFactors?.length > 0;
  }, [user, authLoading]);

  // Handler to refresh user token to get latest MFA state
  const refreshUserMfaState = async () => {
    await user?.getIdToken(true);
    // The onAuthStateChanged listener in AuthContext will update the user object automatically
  };

  const handleMfaEnrollSuccess = () => {
    refreshUserMfaState();
    setIsMfaEnrollDialogOpen(false);
  };
  
  const handleMfaUnenrollSuccess = () => {
    refreshUserMfaState();
    setIsMfaUnenrollDialogOpen(false);
  };

  // Do not render buttons if auth state is loading
  if (authLoading) {
    return <p className="text-sm text-muted-foreground">Loading security settings...</p>;
  }

  return (
    <div className="space-y-3">
      {/* Button to open Change Password Dialog */}
      <Button variant="outline" className="w-full justify-start" onClick={() => setIsChangePasswordDialogOpen(true)}>
        Change Password
      </Button>
      
      {/* Button to open Change Email Dialog */}
      <Button variant="outline" className="w-full justify-start" onClick={() => setIsChangeEmailDialogOpen(true)}>
        Change Email Address
      </Button>
      
      {/* 2FA Management */}
      {isMfaEnabled ? (
        <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive" onClick={() => setIsMfaUnenrollDialogOpen(true)}>
          <ShieldOff className="mr-2 h-4 w-4" />
          Disable Two-Factor Authentication
        </Button>
      ) : (
        <Button variant="outline" className="w-full justify-start" onClick={() => setIsMfaEnrollDialogOpen(true)}>
          <ShieldCheck className="mr-2 h-4 w-4" />
          Enable Two-Factor Authentication (2FA)
        </Button>
      )}
      
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
      <MfaEnrollmentDialog
        open={isMfaEnrollDialogOpen}
        onOpenChange={setIsMfaEnrollDialogOpen}
        onSuccess={handleMfaEnrollSuccess}
      />
      <MfaUnenrollDialog
        open={isMfaUnenrollDialogOpen}
        onOpenChange={setIsMfaUnenrollDialogOpen}
        onSuccess={handleMfaUnenrollSuccess}
      />
    </div>
  );
}
