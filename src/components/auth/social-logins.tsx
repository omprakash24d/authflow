
'use client';

import { useRouter } from 'next/navigation';
import { GoogleAuthProvider, signInWithPopup, type UserCredential } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { getFirebaseAuthErrorMessage } from '@/lib/firebase/error-mapping';
import { Chrome, Github } from 'lucide-react'; // Chrome used as a generic browser/Google icon
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

// Basic SVG for Microsoft icon
const MicrosoftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 0H7.5V7.5H0V0Z" />
    <path d="M8.5 0H16V7.5H8.5V0Z" />
    <path d="M0 8.5H7.5V16H0V8.5Z" />
    <path d="M8.5 8.5H16V16H8.5V8.5Z" />
  </svg>
);


export function SocialLogins() {
  const router = useRouter();
  const { toast } = useToast();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);
  const [isMicrosoftLoading, setIsMicrosoftLoading] = useState(false);

  const handleSocialLogin = async (providerName: 'Google' | 'GitHub' | 'Microsoft') => {
    let provider;
    let setIsLoadingState: React.Dispatch<React.SetStateAction<boolean>>;

    switch (providerName) {
      case 'Google':
        provider = new GoogleAuthProvider();
        setIsLoadingState = setIsGoogleLoading;
        break;
      // TODO: Implement GitHub and Microsoft providers similarly
      case 'GitHub':
        setIsLoadingState = setIsGithubLoading;
        toast({ title: 'GitHub Login', description: 'GitHub login is not yet implemented.', variant: 'default' });
        return;
      case 'Microsoft':
        setIsLoadingState = setIsMicrosoftLoading;
        toast({ title: 'Microsoft Login', description: 'Microsoft login is not yet implemented.', variant: 'default' });
        return;
      default:
        toast({ title: 'Error', description: 'Unknown social login provider.', variant: 'destructive' });
        return;
    }

    setIsLoadingState(true);

    try {
      const result: UserCredential = await signInWithPopup(auth, provider);
      const user = result.user;
      
      toast({
        title: `Signed In with ${providerName}!`,
        description: `Welcome, ${user.displayName || user.email}!`,
      });
      router.push('/dashboard');

    } catch (error: any) {
      console.error(`Error during ${providerName} sign-in:`, error);
      const errorMessage = getFirebaseAuthErrorMessage(error.code);
      toast({
        title: `${providerName} Sign-In Failed`,
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoadingState(false);
    }
  };

  return (
    <>
      <div className="relative my-6">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
          OR CONTINUE WITH
        </span>
      </div>
      <div className="space-y-3">
        <Button variant="outline" className="w-full" onClick={() => handleSocialLogin('Google')} disabled={isGoogleLoading || isGithubLoading || isMicrosoftLoading}>
          {isGoogleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Chrome className="mr-2 h-4 w-4" />} 
          Google
        </Button>
        <Button variant="outline" className="w-full" onClick={() => handleSocialLogin('GitHub')} disabled={isGoogleLoading || isGithubLoading || isMicrosoftLoading}>
          {isGithubLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Github className="mr-2 h-4 w-4" />}
           GitHub
        </Button>
        <Button variant="outline" className="w-full" onClick={() => handleSocialLogin('Microsoft')} disabled={isGoogleLoading || isGithubLoading || isMicrosoftLoading}>
          {isMicrosoftLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MicrosoftIcon />} 
          <span className="ml-2">Microsoft</span>
        </Button>
      </div>
    </>
  );
}
