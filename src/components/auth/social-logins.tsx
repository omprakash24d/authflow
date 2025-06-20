
'use client';

import { useRouter } from 'next/navigation';
import { GoogleAuthProvider, signInWithPopup, type UserCredential, type User as FirebaseUser, getAdditionalUserInfo } from 'firebase/auth';
import { auth, firestore } from '@/lib/firebase/config';
import { doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { getFirebaseAuthErrorMessage } from '@/lib/firebase/error-mapping';
import { Chrome, Github, Loader2 } from 'lucide-react';
import { useState } from 'react';

const MicrosoftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 0H7.5V7.5H0V0Z" />
    <path d="M8.5 0H16V7.5H8.5V0Z" />
    <path d="M0 8.5H7.5V16H0V8.5Z" />
    <path d="M8.5 8.5H16V16H8.5V8.5Z" />
  </svg>
);

type SocialProviderName = 'Google' | 'GitHub' | 'Microsoft';

export function SocialLogins() {
  const router = useRouter();
  const { toast } = useToast();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);
  const [isMicrosoftLoading, setIsMicrosoftLoading] = useState(false);

  const createSessionCookie = async (user: FirebaseUser) => {
    const idToken = await user.getIdToken();
    const response = await fetch('/api/auth/session-login', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
      },
    });
    if (!response.ok) {
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
         if (textResponse.length < 200) errorData.error = textResponse;
      }
      throw new Error(errorData.error || 'Failed to create session via social login.');
    }
  };

  const handleSocialLogin = async (providerName: SocialProviderName) => {
    let provider;
    let setIsLoadingState: React.Dispatch<React.SetStateAction<boolean>>;

    switch (providerName) {
      case 'Google':
        provider = new GoogleAuthProvider();
        setIsLoadingState = setIsGoogleLoading;
        break;
      case 'GitHub':
        setIsLoadingState = setIsGithubLoading;
        toast({ title: 'GitHub Login', description: 'GitHub login is not yet implemented.', variant: 'default' });
        setIsGithubLoading(false);
        return;
      case 'Microsoft':
        setIsLoadingState = setIsMicrosoftLoading;
        toast({ title: 'Microsoft Login', description: 'Microsoft login is not yet implemented.', variant: 'default' });
        setIsMicrosoftLoading(false);
        return;
      default:
        toast({ title: 'Error', description: 'Unknown social login provider.', variant: 'destructive' });
        return;
    }

    setIsLoadingState(true);

    try {
      const result: UserCredential = await signInWithPopup(auth!, provider); // auth! since we check config
      const user = result.user;
      const additionalInfo = getAdditionalUserInfo(result);

      if (user && firestore) {
        try {
          const userProfileRef = doc(firestore, 'users', user.uid);
          // Use user's email (lowercased) as the document ID in the 'usernames' collection.
          // Fallback to a unique ID if email is not present (very unlikely for Google).
          const usernameKey = user.email ? user.email.toLowerCase() : `social_${user.uid}`;
          const usernameDocRef = doc(firestore, 'usernames', usernameKey);

          const batch = writeBatch(firestore);

          let firstName = '';
          let lastName = '';
          if (user.displayName) {
            const nameParts = user.displayName.split(' ');
            firstName = nameParts[0] || '';
            lastName = nameParts.slice(1).join(' ') || '';
          }
          
          const profileDataToSet: any = {
            firstName,
            lastName,
            email: user.email,
            // For simplicity, using the email as the default username value.
            // This can be customized if a different username generation strategy is needed.
            username: user.email || `user_${user.uid.substring(0,8)}`,
            photoURL: user.photoURL || null,
            providerId: result.providerId, 
            updatedAt: serverTimestamp(),
          };

          if (additionalInfo?.isNewUser) {
            profileDataToSet.createdAt = serverTimestamp();
          }

          batch.set(userProfileRef, profileDataToSet, { merge: true });
          
          if (user.email) { // Only attempt to set username doc if email exists
            const usernameDataToSet: any = {
              uid: user.uid,
              email: user.email,
              username: user.email, // Storing email as the username value
              updatedAt: serverTimestamp(),
            };
            if (additionalInfo?.isNewUser) {
              usernameDataToSet.createdAt = serverTimestamp();
            }
            batch.set(usernameDocRef, usernameDataToSet, { merge: true });
          } else {
            console.warn(`User ${user.uid} lacks an email from social provider, skipping username document creation.`);
          }
          
          await batch.commit();

        } catch (dbError: any) {
          console.error("Error updating/creating Firestore profile for social login:", dbError);
          // This toast is to inform the user about a non-critical profile sync issue.
          // Login itself might still be successful.
          toast({
            title: "Profile Sync Issue",
            description: "Your profile details couldn't be fully synced. You are logged in.",
            variant: "default", 
            duration: 7000,
          });
        }
      }
      
      await createSessionCookie(user);
      
      toast({
        title: `Signed In with ${providerName}!`,
        description: `Welcome, ${user.displayName || user.email}!`,
      });
      router.push('/dashboard');

    } catch (error: any) {
      console.error(`Error during ${providerName} sign-in:`, error);
      const errorMessage = error.code ? getFirebaseAuthErrorMessage(error.code) : error.message;
      toast({
        title: `${providerName} Sign-In Failed`,
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoadingState(false);
    }
  };

  const anyLoading = isGoogleLoading || isGithubLoading || isMicrosoftLoading;

  return (
    <>
      <div className="relative my-6">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
          OR CONTINUE WITH
        </span>
      </div>
      <div className="space-y-3">
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={() => handleSocialLogin('Google')} 
          disabled={anyLoading || !auth} // Disable if auth service is not available
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
          <span className="ml-2">Microsoft</span>
        </Button>
      </div>
    </>
  );
}
