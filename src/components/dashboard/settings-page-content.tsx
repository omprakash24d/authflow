
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import { ProfileInformationForm } from '@/components/dashboard/settings/profile-information-form';
import { SecuritySettings } from '@/components/dashboard/settings/security-settings';
import { NotificationPreferences } from '@/components/dashboard/settings/notification-preferences';
import { AppearanceSettings } from '@/components/dashboard/settings/appearance-settings';

import { useAuth } from '@/contexts/auth-context';
import { ChevronLeft, Loader2, AlertTriangle } from 'lucide-react';


export default function SettingsPageContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Alert variant="destructive" className="max-w-md text-center">
          <AlertTriangle className="h-5 w-5 mx-auto mb-2" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            You need to be signed in to access this page. Or your session might have expired.
          </AlertDescription>
          <Button onClick={() => router.push('/signin')} className="mt-4">
            Go to Sign In
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-2xl">
        <Button variant="outline" size="sm" asChild className="mb-6">
          <Link href="/dashboard">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        <Card className="w-full shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Account Settings</CardTitle>
            <CardDescription>Manage your profile, security, and other preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <ProfileInformationForm />
            <Separator />
            <SecuritySettings />
            <Separator />
            <NotificationPreferences />
            <Separator />
            <AppearanceSettings />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
