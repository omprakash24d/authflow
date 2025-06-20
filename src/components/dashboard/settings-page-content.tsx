
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Added for potential redirection

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; // Label is used directly, not FormLabel here
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'; // FormLabel is used via FormField
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { getFirebaseAuthErrorMessage } from '@/lib/firebase/error-mapping';
import { ChevronLeft, User, Mail, Shield, Bell, Palette, Lock, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
// import { firestore } from '@/lib/firebase/config'; // For future Firestore profile updates
// import { doc, updateDoc } from 'firebase/firestore'; // For future Firestore profile updates


const ProfileSettingsSchema = z.object({
  firstName: z.string().max(64, 'First name must be 64 characters or less.').optional(), // Optional for now
  lastName: z.string().max(64, 'Last name must be 64 characters or less.').optional(), // Optional for now
});

type ProfileSettingsFormValues = z.infer<typeof ProfileSettingsSchema>;

export default function SettingsPageContent() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter(); // For potential programmatic navigation
  const [isLoading, setIsLoading] = useState(false); // For form submission
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const form = useForm<ProfileSettingsFormValues>({
    resolver: zodResolver(ProfileSettingsSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
    },
  });
  
  useEffect(() => {
    // This useEffect is primarily for resetting the form if the user context changes
    // (e.g. logs out and logs in as someone else while on this page, though unlikely).
    // Actual population with data from Firestore would happen here if implemented.
    if (user) {
      form.reset({
        firstName: '', // Placeholder: fetch actual first name from Firestore profile
        lastName: '',  // Placeholder: fetch actual last name from Firestore profile
      });
    }
  }, [user, form.reset]); // form.reset is stable


  async function onSubmitProfile(values: ProfileSettingsFormValues) {
    if (!user) return;
    setIsLoading(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      // NOTE: Firebase Auth user.displayName is now primarily the username.
      // Saving separate firstName and lastName requires Firestore integration.
      // The updateProfile call for displayName has been removed.
      
      // TODO: Implement update to Firestore for values.firstName, values.lastName
      // Example:
      // if (firestore) {
      //   const userProfileRef = doc(firestore, 'users', user.uid);
      //   await updateDoc(userProfileRef, {
      //     firstName: values.firstName,
      //     lastName: values.lastName,
      //   });
      //   setFormSuccess('Profile first/last name updated in Firestore (Simulated).');
      //   toast({ title: 'Profile Updated (Simulated)', description: 'First/Last name saved to Firestore.' });
      // } else {
      //   setFormSuccess('Profile settings (first/last name) would be updated here. Firestore not available.');
      //   toast({ title: 'Profile Update (Simulated)', description: 'First/Last name update requires Firestore integration.' });
      // }

      setFormSuccess('Profile update for First/Last Name is simulated. Backend integration (Firestore) is needed to persist these changes.');
      toast({ title: 'Profile Update (Simulated)', description: 'First/Last Name fields are for display and future integration.' });

    } catch (error: any) {
      console.error('Error updating profile:', error);
      const errorMessage = getFirebaseAuthErrorMessage(error.code) || 'Failed to update profile.';
      setFormError(errorMessage);
      toast({ title: 'Update Failed', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }

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
            You need to be signed in to access this page.
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
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitProfile)} className="space-y-4">
                  {formError && (
                    <Alert variant="destructive" aria-live="assertive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{formError}</AlertDescription>
                    </Alert>
                  )}
                  {formSuccess && (
                     <Alert variant="default" className="bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300" aria-live="assertive">
                      <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
                      <AlertTitle>Success</AlertTitle>
                      <AlertDescription>{formSuccess}</AlertDescription>
                    </Alert>
                  )}
                   <div>
                    <Label htmlFor="usernameDisplay">Username</Label>
                    <Input id="usernameDisplay" type="text" value={user.displayName || ''} disabled />
                    <p className="text-xs text-muted-foreground mt-1">Username is set at signup and cannot be changed here.</p>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John (Optional)" {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe (Optional)" {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" value={user.email || ''} placeholder="john.doe@example.com" disabled />
                    <p className="text-xs text-muted-foreground mt-1">Email address cannot be changed here. Contact support if needed.</p>
                  </div>
                  <div>
                    <Label htmlFor="profilePhoto">Profile Photo</Label>
                    <Input id="profilePhoto" type="file" accept="image/*" disabled={isLoading || true} />
                    <p className="text-xs text-muted-foreground mt-1">Upload a new profile picture. (Functionality not yet implemented)</p>
                  </div>
                  <Button type="submit" className="mt-2" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Profile Changes (Simulated)
                  </Button>
                </form>
              </Form>
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

    