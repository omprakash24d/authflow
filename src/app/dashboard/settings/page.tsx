
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updateProfile } from 'firebase/auth';
import Link from 'next/link';

import { ProtectedRoute } from '@/components/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { getFirebaseAuthErrorMessage } from '@/lib/firebase/error-mapping';
import { ChevronLeft, User, Mail, Shield, Bell, Palette, Lock, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

const ProfileSettingsSchema = z.object({
  firstName: z.string().min(1, 'First name is required.').max(64, 'First name must be 64 characters or less.'),
  lastName: z.string().min(1, 'Last name is required.').max(64, 'Last name must be 64 characters or less.'),
  // profilePhoto: z.any().optional(), // File upload not handled in this iteration
});

type ProfileSettingsFormValues = z.infer<typeof ProfileSettingsSchema>;

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const defaultFirstName = user?.displayName?.split(' ')[0] || '';
  const defaultLastName = user?.displayName?.split(' ').slice(1).join(' ') || '';

  const form = useForm<ProfileSettingsFormValues>({
    resolver: zodResolver(ProfileSettingsSchema),
    defaultValues: {
      firstName: defaultFirstName,
      lastName: defaultLastName,
    },
  });
  
  // Effect to reset form if user changes (e.g. re-login with different user)
  useState(() => {
    if (user) {
      form.reset({
        firstName: user.displayName?.split(' ')[0] || '',
        lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
      });
    }
  });


  async function onSubmitProfile(values: ProfileSettingsFormValues) {
    if (!user) return;
    setIsLoading(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      const newDisplayName = `${values.firstName} ${values.lastName}`.trim();
      if (newDisplayName !== user.displayName) {
        await updateProfile(user, { displayName: newDisplayName });
      }
      // Future: Handle photo update here. For now, it does nothing.
      // if (values.profilePhoto && values.profilePhoto.length > 0) {
      //   console.log("Profile photo selected, but upload not implemented:", values.profilePhoto[0]);
      //   // Implement actual photo upload logic to Firebase Storage and update user.photoURL
      // }
      
      setFormSuccess('Profile updated successfully!');
      toast({ title: 'Profile Updated', description: 'Your profile information has been saved.' });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      const errorMessage = getFirebaseAuthErrorMessage(error.code) || 'Failed to update profile.';
      setFormError(errorMessage);
      toast({ title: 'Update Failed', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }

  if (!user) {
    return null; // Should be handled by ProtectedRoute
  }

  return (
    <ProtectedRoute>
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
              {/* Profile Section */}
              <section>
                <h2 className="text-xl font-semibold font-headline text-primary mb-4 flex items-center">
                  <User className="mr-2 h-5 w-5" /> Profile Information
                </h2>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmitProfile)} className="space-y-4">
                    {formError && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{formError}</AlertDescription>
                      </Alert>
                    )}
                    {formSuccess && (
                       <Alert variant="default" className="bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300">
                        <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
                        <AlertTitle>Success</AlertTitle>
                        <AlertDescription>{formSuccess}</AlertDescription>
                      </Alert>
                    )}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John" {...field} disabled={isLoading} />
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
                              <Input placeholder="Doe" {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" defaultValue={user.email || ''} placeholder="john.doe@example.com" disabled />
                      <p className="text-xs text-muted-foreground mt-1">Email address cannot be changed here.</p>
                    </div>
                    <div>
                      <Label htmlFor="profilePhoto">Profile Photo</Label>
                      <Input id="profilePhoto" type="file" accept="image/*" disabled={isLoading} />
                      <p className="text-xs text-muted-foreground mt-1">Upload a new profile picture. (Upload not yet functional)</p>
                    </div>
                    <Button type="submit" className="mt-2" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Profile Changes
                    </Button>
                  </form>
                </Form>
              </section>

              <Separator />

              {/* Security Section */}
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

              {/* Notifications Section */}
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

              {/* Appearance Section */}
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
    </ProtectedRoute>
  );
}
