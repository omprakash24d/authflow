import type { ReactNode } from 'react';
import { Logo } from '@/components/logo';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <Logo />
      </div>
      <main className="w-full max-w-md">
        {children}
      </main>
      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} AuthFlow. All rights reserved.</p>
        <p className="mt-1">
          Built with Firebase & Next.js by Firebase Studio.
        </p>
      </footer>
    </div>
  );
}
