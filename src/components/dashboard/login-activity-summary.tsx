
'use client';

import { useState, useEffect } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { format } from 'date-fns';
import { Clock, Loader2, WifiOff, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface LoginActivitySummaryProps {
  user: FirebaseUser;
}

export function LoginActivitySummary({ user }: LoginActivitySummaryProps) {
  const { toast } = useToast();
  const [ipAddress, setIpAddress] = useState<string | null>('Loading...');
  const [location, setLocation] = useState<string | null>('Loading...');
  const [activityLoading, setActivityLoading] = useState<boolean>(true);
  const [activityError, setActivityError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivityDetails = async () => {
      setActivityLoading(true);
      setActivityError(null);
      try {
        const response = await fetch('/api/auth/activity-details');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to fetch activity details: ${response.status}`);
        }
        const data = await response.json();
        setIpAddress(data.ipAddress || 'Not Available');
        setLocation(data.location || 'Not Available');
      } catch (error: any) {
        console.error("Error fetching activity details:", error);
        setActivityError(error.message || 'Could not load activity data.');
        setIpAddress('Error');
        setLocation('Error');
      } finally {
        setActivityLoading(false);
      }
    };

    if (user) {
      fetchActivityDetails();
    }
  }, [user]);

  const lastSignInTime = user?.metadata.lastSignInTime 
    ? format(new Date(user.metadata.lastSignInTime), "PPpp") 
    : 'N/A';

  return (
    <div className="space-y-3 text-sm">
      <h3 className="text-lg font-semibold font-headline text-primary flex items-center">
        <Clock className="mr-2 h-5 w-5" /> Login Activity
      </h3>
      <p><strong>Last Sign-In:</strong> {lastSignInTime}</p>
      <p className="flex items-center">
        <WifiOff className="mr-2 h-4 w-4 text-muted-foreground" />
        <strong>IP Address:</strong>&nbsp;
        {activityLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : activityError ? <span className="text-destructive">{ipAddress}</span> : ipAddress}
      </p>
      <p className="flex items-center">
        <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
        <strong>Location:</strong>&nbsp;
         {activityLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : activityError ? <span className="text-destructive">{location}</span> : location}
      </p>
       <Button 
        variant="link" 
        size="sm" 
        className="p-0 h-auto text-primary" 
        onClick={() => {
          console.log(`View full activity log clicked for user: ${user.uid}. Feature under development.`);
          toast({ 
            title: 'Activity Log', 
            description: 'Full activity log feature is under development. Your request has been logged (simulated).'
          });
        }}
       >
        View full activity log
      </Button>
    </div>
  );
}
