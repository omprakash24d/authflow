
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
// Form, FormControl, FormField, FormItem, FormLabel, FormMessage are not used for profile fields currently
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
// import { getFirebaseAuthErrorMessage } from '@/lib/firebase/error-mapping'; // Not used for profile update now
import { ChevronLeft, User, Mail, Shield, Bell, Palette, Lock, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

// Simplified schema: no profile fields to validate for now
const ProfileSettingsSchema = z.object({});

type ProfileSettingsFormValues = z.infer<typeof ProfileSettingsSchema>;

export default function SettingsPageContent() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  // const [isLoading, setIsLoading] = useState(false); // Not used for profile submission now
  // const [formError, setFormError] = useState<string | null>(null); // Not used for profile submission
  // const [formSuccess, setFormSuccess] = useState<string | null>(null); // Not used for profile submission

  const form = useForm<ProfileSettingsFormValues>({
    resolver: zodResolver(ProfileSettingsSchema),
    defaultValues: {},
  });
  
  // useEffect for form population is not needed as we are not editing profile fields in this simplified version
  // useEffect(() => {
  //   if (user) {
  //     form.reset({
  //       // No fields to reset for now
  //     });
  //   }
  // }, [user, form.reset]);


  // async function onSubmitProfile(values: ProfileSettingsFormValues) {
  //   // Functionality removed/simplified for now
  //   if (!user) return;
  //   setIsLoading(true);
  //   setFormError(null);
  //   setFormSuccess(null);
  //   try {
  //     setFormSuccess('Profile update (First/Last Name) is pending Firestore integration.');
  //     toast({ title: 'Profile Update (Simulated)', description: 'First/Last Name fields will be editable with Firestore.' });
  //   } catch (error: any) {
  //     console.error('Error updating profile:', error);
  //     const errorMessage = getFirebaseAuthErrorMessage(error.code) || 'Failed to update profile.';
  //     setFormError(errorMessage);
  //     toast({ title: 'Update Failed', description: errorMessage, variant: 'destructive' });
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }

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
            <CardDescription>Manage your profile, security, and notification preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold font-headline text-primary mb-4 flex items-center">
                <User className="mr-2 h-5 w-5" /> Profile Information
              </h2>
              {/* Simplified: No form for profile info edits for now */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="usernameDisplay">Username</Label>
                  <Input id="usernameDisplay" type="text" value={user.displayName || 'N/A'} disabled />
                </div>
                <div>
                  <Label htmlFor="emailDisplay">Email Address</Label>
                  <Input id="emailDisplay" type="email" value={user.email || 'N/A'} disabled />
                </div>
                <div>
                  <Label htmlFor="profilePhoto">Profile Photo</Label>
                  <Input id="profilePhoto" type="file" accept="image/*" disabled={true} />
                  <p className="text-xs text-muted-foreground mt-1">Upload a new profile picture. (Functionality not yet implemented)</p>
                </div>
                {/* 
                <Button type="submit" className="mt-2" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Profile Changes (Simulated)
                </Button> 
                */}
              </div>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-semibold font-headline text-primary mb-4 flex items-center">
                <Lock className="mr-2 h-5 w-5" /> Security
              </h2>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={() => toast({ title: 'Coming Soon', description: 'Change password functionality will be added soon.'})}>
                  <Shield className="mr-2 h-4 w-4" /> Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => toast({ title: 'Coming Soon', description: 'Two-Factor Authentication (2FA) will be added soon.'})}>
                  <Shield className="mr-2 h-4 w-4" /> Enable Two-Factor Authentication (2FA)
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
    
