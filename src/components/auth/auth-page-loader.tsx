
'use client';

import { Loader2 } from 'lucide-react';

interface AuthPageLoaderProps {
  message?: string;
}

export function AuthPageLoader({ message = 'Loading...' }: AuthPageLoaderProps) {
  return (
    <div
      className="flex flex-col justify-center items-center h-full py-10 text-muted-foreground"
      aria-live="polite"
      aria-busy="true"
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
      <span>{message}</span>
    </div>
  );
}
