// src/components/dashboard/login-activity-summary.tsx
// This component displays a summary of the user's login activity,
// including last sign-in time, IP address, and (mocked) location.

'use client'; // Client component due to useEffect for data fetching and state.

import { useState, useEffect, useCallback } from 'react';
import type { User as FirebaseUser } from 'firebase/auth'; // Firebase User type
import { format } from 'date-fns'; // For formatting dates
import { Clock, Loader2, WifiOff, MapPin, AlertTriangle } from 'lucide-react'; // Icons
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast'; // For "Coming Soon" toast

/**
 * Props for the LoginActivitySummary component.
 * @property user - The currently authenticated Firebase user object.
 */
interface LoginActivitySummaryProps {
  user: FirebaseUser;
}

/**
 * Fetches activity details from the internal API route.
 * Extracted from the component for better readability and separation of concerns.
 * @returns {Promise<{ipAddress: string; location: string}>} The fetched activity details.
 * @throws {Error} if the API call fails or returns a non-ok status.
 */
async function fetchActivityDetailsFromApi() {
  const response = await fetch('/api/auth/activity-details');
  if (!response.ok) {
    let errorMessage = `Failed to fetch activity details: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData && errorData.error) {
        errorMessage = errorData.error;
      }
    } catch (jsonError) {
      console.warn("Could not parse error response as JSON from /api/auth/activity-details:", jsonError);
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

/**
 * LoginActivitySummary component.
 * Shows last sign-in time, IP address, and location. IP/location are fetched from an API.
 * @param {LoginActivitySummaryProps} props - The component's props.
 * @returns JSX.Element
 */
export function LoginActivitySummary({ user }: LoginActivitySummaryProps) {
  const { toast } = useToast();
  // State variables for fetched activity details
  const [ipAddress, setIpAddress] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [activityLoading, setActivityLoading] = useState<boolean>(true); // Loading state for API call
  const [activityError, setActivityError] = useState<string | null>(null); // Error state for API call

  // useEffect to fetch activity details when the component mounts or user changes.
  useEffect(() => {
    const fetchActivity = async () => {
      setActivityLoading(true);
      setActivityError(null);
      try {
        const data = await fetchActivityDetailsFromApi();
        setIpAddress(data.ipAddress || 'Not Available');
        setLocation(data.location || 'Not Available'); // Location is currently mocked in the API
      } catch (error: any) {
        console.error("Error fetching activity details:", error);
        setActivityError(error.message || 'Could not load activity data.');
      } finally {
        setActivityLoading(false);
      }
    };

    if (user) { // Only fetch if user is available
      fetchActivity();
    }
  }, [user]); // Dependency array: re-run if user object changes.

  // Helper function to render a value that is being fetched.
  // Shows a loader, an error message, or the value itself.
  const renderFetchedValue = (value: string | null) => {
    if (activityLoading) return <Loader2 className="h-4 w-4 animate-spin" />;
    if (activityError) {
      return (
        <span className="text-destructive text-xs flex items-center gap-1" aria-live="polite">
          <AlertTriangle className="h-3 w-3" /> Error
        </span>
      );
    }
    return value || <span className="text-muted-foreground">N/A</span>;
  };

  // Format the last sign-in time from user metadata.
  const lastSignInTime = user?.metadata.lastSignInTime
    ? format(new Date(user.metadata.lastSignInTime), "PPpp") // e.g., "Jul 26, 2023, 2:30:00 PM"
    : 'N/A';

  return (
    <div className="space-y-4"> {/* Container with vertical spacing */}
      <h3 className="text-lg font-semibold font-headline text-primary flex items-center">
        <Clock className="mr-2 h-5 w-5" /> Login Activity
      </h3>
      <dl className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2 text-sm">
        {/* Last Sign-in Time */}
        <dt className="font-medium text-muted-foreground">Last Sign-In</dt>
        <dd className="md:col-span-2">{lastSignInTime}</dd>

        {/* IP Address */}
        <dt className="font-medium text-muted-foreground flex items-center">
            <WifiOff className="mr-2 h-4 w-4" />
            IP Address
        </dt>
        <dd className="md:col-span-2">
            {renderFetchedValue(ipAddress)}
        </dd>

        {/* Approx. Location */}
        <dt className="font-medium text-muted-foreground flex items-center">
            <MapPin className="mr-2 h-4 w-4" />
            Approx. Location
        </dt>
        <dd className="md:col-span-2">
            {renderFetchedValue(location)}
        </dd>
      </dl>

       {/* Display a consolidated error message at the bottom if an API error occurred. */}
      {activityError && (
          <p className="text-xs text-destructive flex items-center gap-1">
             <AlertTriangle className="h-3 w-3" /> Could not load login details: {activityError}
          </p>
      )}

      {/* Placeholder button for viewing full activity log */}
       <Button
        variant="outline"
        size="sm"
        className="w-full sm:w-auto"
        onClick={() => {
          toast({ // Show a "Coming Soon" toast as this feature is not implemented
            title: 'Coming Soon',
            description: 'A detailed activity log feature will be implemented in a future update.'
          });
        }}
       >
        View full activity log
      </Button>
    </div>
  );
}
