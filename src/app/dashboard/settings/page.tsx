
'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth-context';
import { ChevronLeft, User, Mail, Shield, Bell, Palette, Lock } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const { user } = useAuth();

  // Placeholder for form handling logic
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    alert('Settings update functionality not yet implemented.');
  };

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
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" defaultValue={user.displayName?.split(' ')[0] || ''} placeholder="John" />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" defaultValue={user.displayName?.split(' ').slice(1).join(' ') || ''} placeholder="Doe" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" defaultValue={user.email || ''} placeholder="john.doe@example.com" disabled />
                     <p className="text-xs text-muted-foreground mt-1">Email address cannot be changed here.</p>
                  </div>
                   <div>
                    <Label htmlFor="profilePhoto">Profile Photo</Label>
                    <Input id="profilePhoto" type="file" accept="image/*" />
                     <p className="text-xs text-muted-foreground mt-1">Upload a new profile picture.</p>
                  </div>
                  <Button type="submit" className="mt-2">Save Profile Changes</Button>
                </form>
              </section>

              <Separator />

              {/* Security Section */}
              <section>
                <h2 className="text-xl font-semibold font-headline text-primary mb-4 flex items-center">
                  <Lock className="mr-2 h-5 w-5" /> Security
                </h2>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="mr-2 h-4 w-4" /> Change Password
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="mr-2 h-4 w-4" /> Enable Two-Factor Authentication (2FA)
                  </Button>
                  <Button variant="link" className="text-primary p-0 h-auto">View login history</Button>
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
                  <Button variant="outline" className="w-full justify-start">
                    Configure Email Notifications
                  </Button>
                   <Button variant="outline" className="w-full justify-start">
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
                  <Button variant="outline" className="w-full justify-start">
                    Toggle Dark/Light Mode (Not Implemented)
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
