
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChangePasswordDialog } from '@/components/dashboard/settings/change-password-dialog';
import { ChangeEmailDialog } from '@/components/dashboard/settings/change-email-dialog'; // Ensure this path is correct
import { useToast } from '@/hooks/use-toast';
import { Lock, Mail } from 'lucide-react';

export function SecuritySettings() {
  const { toast } = useToast();
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false);
  const [isChangeEmailDialogOpen, setIsChangeEmailDialogOpen] = useState(false);

  return (
    <section>
      <h2 className="text-xl font-semibold font-headline text-primary mb-4 flex items-center">
        <Lock className="mr-2 h-5 w-5" /> Security
      </h2>
      <div className="space-y-3">
        <Button variant="outline" className="w-full justify-start" onClick={() => setIsChangePasswordDialogOpen(true)}>
          Change Password
        </Button>
        <Button variant="outline" className="w-full justify-start" onClick={() => setIsChangeEmailDialogOpen(true)}>
          <Mail className="mr-2 h-4 w-4" /> Change Email Address
        </Button>
        <Button variant="outline" className="w-full justify-start" onClick={() => toast({ title: 'Coming Soon', description: 'Two-Factor Authentication (2FA) will be added in a future update.' })}>
          Enable Two-Factor Authentication (2FA)
        </Button>
        <Button variant="link" className="text-primary p-0 h-auto" onClick={() => toast({ title: 'Coming Soon', description: 'Login history view will be added in a future update.' })}>
          View login history
        </Button>
      </div>
      <ChangePasswordDialog open={isChangePasswordDialogOpen} onOpenChange={setIsChangePasswordDialogOpen} />
      <ChangeEmailDialog open={isChangeEmailDialogOpen} onOpenChange={setIsChangeEmailDialogOpen} />
    </section>
  );
}
