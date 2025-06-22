// src/components/auth/social-logins.tsx
// This component provides buttons for users to sign in or sign up using social providers
// like Google, GitHub, and Microsoft. It handles the OAuth popup flow with Firebase.

'use client'; // Client component due to Firebase interactions and state.

import { useRouter } from 'next/navigation';
import { 
  GoogleAuthProvider, 
  GithubAuthProvider,
  OAuthProvider, // Generic OAuth provider, used here for Microsoft
  signInWithPopup, 
  type UserCredential, 
  type User as FirebaseUser, 
  getAdditionalUserInfo, // To check if it's a new user
  updateProfile
} from 'firebase/auth';
import { auth, firestore } from '@/lib/firebase/config'; // Firebase auth and firestore instances
import { doc, getDoc, writeBatch, serverTimestamp, type Firestore } from 'firebase/firestore'; // Firestore functions
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast'; // Hook for toast notifications
import { getFirebaseAuthErrorMessage } from '@/lib/firebase/error-mapping'; // Maps Firebase errors to messages
import { Chrome, Github, Loader2 } from 'lucide-react'; // Icons
import { useState } from 'react';

// Simple SVG icon for Microsoft.
const MicrosoftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 0H7.5V7.5H0V0Z" />
    <path d="M8.5 0H16V7.5H8.5V0Z" />
    <path d="M0 8.5H7.5V16H0V8.5Z" />
    <path d="M8.5 8.5H16V16H8.5V8.5Z" />
  </svg>
);

type SocialProviderName = 'Google' | 'GitHub' | 'Microsoft';

/**
 * SocialLogins component.
 * Renders buttons for signing in with various social providers.
 * Handles the OAuth flow, user profile creation/update in Firestore, and session management.
 * @returns JSX.Element
 */
export function SocialLogins() {
  const router = useRouter();
  const { toast } = useToast();
  // State for loading indicators on each button
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);
  const [isMicrosoftLoading, setIsMicrosoftLoading] = useState(false);

  /**
   * Creates a server-side session cookie after successful social login.
   * @param {FirebaseUser} user - The authenticated Firebase user object.
   */
  const createSessionCookie = async (user: FirebaseUser) => {
    const idToken = await user.getIdToken();
    const response = await fetch('/api/auth/session-login', { // Calls API to set HTTP-only cookie
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
      },
    });
    if (!response.ok) { // Handle API errors
      let errorData = { error: 'Failed to create session. Server response not in expected format.' };
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        try {
          errorData = await response.json();
        } catch (jsonError) {
          console.error("Failed to parse JSON error response from /api/auth/session-login:", jsonError);
        }
      } else {
         const textResponse = await response.text();
         console.error("Non-JSON response from /api/auth/session-login:", textResponse);
         if (textResponse.length < 200) errorData.error = textResponse; // Use text if short
      }
      throw new Error(errorData.error || 'Failed to create session via social login.');
    }
  };

  /**
   * Handles the social login process for a given provider.
   * @param {SocialProviderName} providerName - The name of the social provider (Google, GitHub, Microsoft).
   */
  const handleSocialLogin = async (providerName: SocialProviderName) => {
    let provider; // Firebase Auth provider instance
    let setIsLoadingState: React.Dispatch<React.SetStateAction<boolean>>; // State setter for loading

    // Select provider and loading state based on providerName
    switch (providerName) {
      case 'Google':
        provider = new GoogleAuthProvider();
        setIsLoadingState = setIsGoogleLoading;
        break;
      case 'GitHub':
        provider = new GithubAuthProvider();
        setIsLoadingState = setIsGithubLoading;
        break;
      case 'Microsoft':
        provider = new OAuthProvider('microsoft.com'); // Uses generic OAuthProvider for Microsoft
        setIsLoadingState = setIsMicrosoftLoading;
        break;
      default:
        toast({ title: 'Error', description: 'Unknown social login provider.', variant: 'destructive' });
        return;
    }

    setIsLoadingState(true); // Start loading

    // Check if Firebase Auth service is available
    if (!auth) {
      toast({ title: 'Service Unavailable', description: 'Authentication service is not configured. Social login unavailable.', variant: 'destructive' });
      setIsLoadingState(false);
      return;
    }
    
    try {
      // Initiate sign-in with popup
      const result: UserCredential = await signInWithPopup(auth, provider);
      const user = result.user; // Firebase user object
      const additionalInfo = getAdditionalUserInfo(result); // Info like isNewUser
      const isNewUser = additionalInfo?.isNewUser ?? false;

      if (!user) { // Should not happen if signInWithPopup was successful
        throw new Error("User object not found after social sign-in.");
      }

      // If Firestore is available, manage user profile data.
      if (firestore) {
        if (isNewUser) {
          // New user: Generate a unique username and create their profile documents.
          let baseUsername = '';
            // Prefer generating from display name if it exists and is meaningful
            if (user.displayName && user.displayName.trim().length > 1) {
                baseUsername = user.displayName
                    .toLowerCase()
                    // Replace spaces and dots with underscores
                    .replace(/[\s.]+/g, '_')
                    // Remove any characters that are not letters, numbers, or underscores
                    .replace(/[^a-z0-9_]/g, '')
                    // Prevent multiple underscores in a row
                    .replace(/__+/g, '_');
            } else if (user.email) {
                baseUsername = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
            }

            if (!baseUsername || baseUsername.length < 3) {
                baseUsername = `user_${user.uid.substring(0, 8)}`;
            }
            // Ensure username meets length constraints
            baseUsername = baseUsername.slice(0, 20);
            // Final check for length after slicing, just in case
            if (baseUsername.length < 3) {
                baseUsername = `${baseUsername}${Math.random().toString(36).substring(2, 5)}`;
            }

          let finalUsername = baseUsername;
          let isUnique = false;
          let attempts = 0;

          // Find a unique username by checking Firestore and appending numbers if needed.
          while (!isUnique && attempts < 10) {
            const usernameDocRef = doc(firestore, "usernames", finalUsername);
            const docSnap = await getDoc(usernameDocRef);
            if (!docSnap.exists()) {
              isUnique = true;
            } else {
              finalUsername = `${baseUsername}${Math.floor(100 + Math.random() * 900)}`;
            }
            attempts++;
          }

          if (!isUnique) {
            throw new Error("Could not generate a unique username. Please try again.");
          }

          // Update the user's main Firebase Auth profile with the unique displayName.
          await updateProfile(user, { displayName: finalUsername });

          // Save the profile and username details to Firestore in a batch.
          const batch = writeBatch(firestore);
          const userProfileRef = doc(firestore, 'users', user.uid);
          const usernameRef = doc(firestore, 'usernames', finalUsername);

          let firstName = '', lastName = '';
          if (result.user.displayName) { // Use the original displayName from provider for first/last name
              const nameParts = result.user.displayName.split(' ');
              firstName = nameParts[0] || '';
              lastName = nameParts.slice(1).join(' ') || '';
          }

          batch.set(userProfileRef, {
              firstName,
              lastName,
              username: finalUsername,
              email: user.email,
              photoURL: user.photoURL,
              providerId: result.providerId,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
          });
          batch.set(usernameRef, {
              uid: user.uid,
              email: user.email,
              username: finalUsername,
              createdAt: serverTimestamp(),
          });
          
          await batch.commit();

        } else {
          // Existing user: Just update their profile with potentially new info (e.g., photo).
          const userProfileRef = doc(firestore, 'users', user.uid);
          const batch = writeBatch(firestore);
          batch.update(userProfileRef, {
              photoURL: user.photoURL,
              providerId: result.providerId,
              updatedAt: serverTimestamp(),
          });
          await batch.commit();
        }
      } else { // Firestore is NOT available
          console.warn("Firestore client not available, skipping profile/username document creation for social login.");
          toast({
              title: "Firestore Unavailable",
              description: "Profile and username details could not be synced with the database at this time. You are logged in.",
              variant: "default",
              duration: 7000,
          });
      }
      
      await createSessionCookie(user); // Create server-side session
      
      toast({
        title: `Signed In with ${providerName}!`,
        description: `Welcome, ${user.displayName || user.email}!`,
      });
      // Redirect to dashboard using full page reload
      window.location.assign('/dashboard');

    } catch (error: any) { // Handle errors from signInWithPopup, createSessionCookie, or Firestore helper
      console.error(`Error during ${providerName} sign-in:`, error);
      let errorMessage = getFirebaseAuthErrorMessage(error.code);
      // Provide more specific messages for common OAuth errors
      if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = "An account already exists with the same email address but was created using a different sign-in method (e.g., Google, Email/Password). Please sign in using the original method, or link your accounts if that feature is available.";
      } else if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user'){
        errorMessage = `Sign-in with ${providerName} was cancelled.`;
      } else if (error.message && error.message.includes("auth/configuration-not-found")) {
        // This often indicates the provider isn't enabled or configured correctly in Firebase console
        errorMessage = `${providerName} sign-in is not configured in Firebase. Please contact support. (dev: Check Firebase console for ${providerName} auth setup and API keys/secrets).`
      }

      toast({
        title: `${providerName} Sign-In Failed`,
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoadingState(false); // Stop loading
    }
  };

  // Combined loading state to disable all buttons if any one is loading
  const anyLoading = isGoogleLoading || isGithubLoading || isMicrosoftLoading;

  return (
    <>
      {/* Separator with "OR CONTINUE WITH" text */}
      <div className="relative my-6">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
          OR CONTINUE WITH
        </span>
      </div>
      {/* Container for social login buttons */}
      <div className="space-y-3">
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={() => handleSocialLogin('Google')} 
          disabled={anyLoading || !auth} // Disable if any loading or auth service unavailable
          aria-label="Sign in with Google"
        >
          {isGoogleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Chrome className="mr-2 h-4 w-4" />} 
          Google
        </Button>
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={() => handleSocialLogin('GitHub')} 
          disabled={anyLoading || !auth}
          aria-label="Sign in with GitHub"
        >
          {isGithubLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Github className="mr-2 h-4 w-4" />}
           GitHub
        </Button>
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={() => handleSocialLogin('Microsoft')} 
          disabled={anyLoading || !auth}
          aria-label="Sign in with Microsoft"
        >
          {isMicrosoftLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MicrosoftIcon />} 
          Microsoft
        </Button>
      </div>
    </>
  );
}
