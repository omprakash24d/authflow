'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Chrome, Github } from 'lucide-react'; // Chrome used as a generic browser/Google icon

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
  // TODO: Implement actual social login handlers
  const handleSocialLogin = (provider: string) => {
    alert(`Login with ${provider} (not implemented)`);
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
        <Button variant="outline" className="w-full" onClick={() => handleSocialLogin('Google')}>
          <Chrome className="mr-2 h-4 w-4" /> Google
        </Button>
        <Button variant="outline" className="w-full" onClick={() => handleSocialLogin('GitHub')}>
          <Github className="mr-2 h-4 w-4" /> GitHub
        </Button>
        <Button variant="outline" className="w-full" onClick={() => handleSocialLogin('Microsoft')}>
          <MicrosoftIcon /> <span className="ml-2">Microsoft</span>
        </Button>
      </div>
    </>
  );
}
