
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Corrected import
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, User, Lock, Bell, Palette, AlertTriangle, Loader2 } from 'lucide-react';

export default function SettingsPageContent() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    // This case should ideally be handled by ProtectedRoute, but as a fallback:
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

  // If execution reaches here, user is authenticated and auth is not loading.
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
            <CardDescription>Manage your profile, security, and notification preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold font-headline text-primary mb-4 flex items-center">
                <User className="mr-2 h-5 w-5" /> Profile Information (Simplified)
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="usernameDisplay">Username</Label>
                  <Input id="usernameDisplay" type="text" value={user.displayName || 'N/A'} disabled />
                </div>
                <div>
                  <Label htmlFor="emailDisplay">Email Address</Label>
                  <Input id="emailDisplay" type="email" value={user.email || 'N/A'} disabled />
                </div>
                 <p className="text-xs text-muted-foreground mt-1">
                    First Name, Last Name, and Profile Photo editing will be available soon.
                 </p>
              </div>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-semibold font-headline text-primary mb-4 flex items-center">
                <Lock className="mr-2 h-5 w-5" /> Security
              </h2>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={() => toast({ title: 'Coming Soon', description: 'Change password functionality will be added soon.'})}>
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => toast({ title: 'Coming Soon', description: 'Two-Factor Authentication (2FA) will be added soon.'})}>
                  Enable Two-Factor Authentication (2FA)
                </Button>
                <Button variant="link" className="text-primary p-0 h-auto" onClick={() => toast({ title: 'Coming Soon', description: 'Login history view will be added soon.'})}>View login history</Button>
              </div>
            </section>
            
            <Separator />

            <section>
               <h2 className="text-xl font-semibold font-headline text-primary mb-4 flex items-center">
                <Bell className="mr-2 h-5 w-5" /> Notification Preferences
              </h2>
              <div className="space-y-2">
                <p className="text-sm">Manage how you receive notifications from us.</p>
                <Button variant="outline" className="w-full justify-start" onClick={() => toast({ title: 'Coming Soon', description: 'Email notification settings will be added soon.'})}>
                  Configure Email Notifications
                </Button>
                 <Button variant="outline" className="w-full justify-start" onClick={() => toast({ title: 'Coming Soon', description: 'SMS notification settings will be added soon.'})}>
                  Configure SMS Notifications
                </Button>
              </div>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-semibold font-headline text-primary mb-4 flex items-center">
                <Palette className="mr-2 h-5 w-5" /> Appearance
              </h2>
               <div className="space-y-2">
                <p className="text-sm">Customize the look and feel of the application.</p>
                <Button variant="outline" className="w-full justify-start" onClick={() => toast({ title: 'Coming Soon', description: 'Dark/Light mode toggle will be added soon.'})}>
                  Toggle Dark/Light Mode
                </Button>
              </div>
            </section>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
