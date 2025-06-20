
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/config';
import { ProfileSettingsSchema, type ProfileSettingsFormValues } from '@/lib/validators/auth';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ChangePasswordDialog } from '@/components/dashboard/settings/change-password-dialog';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, User, Lock, Bell, Palette, AlertTriangle, Loader2, Image as ImageIcon } from 'lucide-react';

export default function SettingsPageContent() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const profileForm = useForm<ProfileSettingsFormValues>({
    resolver: zodResolver(ProfileSettingsSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
    },
  });

  useEffect(() => {
    if (user && firestore) {
      const fetchUserProfile = async () => {
        try {
          const userProfileRef = doc(firestore, 'users', user.uid);
          const docSnap = await getDoc(userProfileRef);
          if (docSnap.exists()) {
            const profileData = docSnap.data();
            profileForm.reset({
              firstName: profileData.firstName || '',
              lastName: profileData.lastName || '',
            });
          }
        } catch (error: any) {
          console.error("Error fetching user profile for settings:", error);
          setProfileError("Could not load profile information.");
          toast({ title: "Error", description: "Could not load your profile data.", variant: "destructive" });
        }
      };
      fetchUserProfile();
    }
  }, [user, profileForm, toast]);


  async function onSubmitProfile(values: ProfileSettingsFormValues) {
    if (!user) {
      setProfileError("User not authenticated.");
      return;
    }
    setProfileSaving(true);
    setProfileError(null);
    try {
      const userProfileRef = doc(firestore, 'users', user.uid);
      await setDoc(userProfileRef, {
        firstName: values.firstName,
        lastName: values.lastName,
        updatedAt: serverTimestamp(), // Keep track of updates
      }, { merge: true });

      toast({
        title: 'Profile Updated',
        description: 'Your profile information has been saved.',
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      const errorMessage = error.message || "An unexpected error occurred.";
      setProfileError(errorMessage);
      toast({
        title: 'Error Updating Profile',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setProfileSaving(false);
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
    <>
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
                {profileError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Profile Error</AlertTitle>
                    <AlertDescription>{profileError}</AlertDescription>
                  </Alert>
                )}
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={profileForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your first name" {...field} disabled={profileSaving} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your last name" {...field} disabled={profileSaving} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                     <div>
                      <Label htmlFor="usernameDisplay">Username</Label>
                      <Input id="usernameDisplay" type="text" value={user.displayName || 'N/A'} disabled />
                       <p className="text-xs text-muted-foreground mt-1">Username cannot be changed here.</p>
                    </div>
                    <div>
                      <Label htmlFor="emailDisplay">Email Address</Label>
                      <Input id="emailDisplay" type="email" value={user.email || 'N/A'} disabled />
                       <p className="text-xs text-muted-foreground mt-1">Email address cannot be changed here.</p>
                    </div>
                     <div className="space-y-2">
                        <Label>Profile Photo</Label>
                        <div className="flex items-center gap-4">
                            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                                <ImageIcon size={32} />
                            </div>
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => toast({ title: 'Coming Soon', description: 'Profile photo upload will be implemented later.'})}
                                disabled={profileSaving}
                            >
                                Upload Photo
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">Profile photo upload is coming soon.</p>
                    </div>
                    <Button type="submit" disabled={profileSaving}>
                      {profileSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Profile Changes
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
                  <Button variant="outline" className="w-full justify-start" onClick={() => setIsChangePasswordDialogOpen(true)}>
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
      <ChangePasswordDialog open={isChangePasswordDialogOpen} onOpenChange={setIsChangePasswordDialogOpen} />
    </>
  );
}
