import type { ReactNode } from 'react';
import { Logo } from '@/components/logo';
import { AuthFooter } from '@/components/auth/auth-footer'; // Import the new footer

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 sm:p-8 lg:p-10">
      <div className="mb-10">
        <Logo />
      </div>
      <main className="w-full max-w-md ">
        {children}
      </main>
      <AuthFooter /> {/* Use the new footer component */}
    </div>
  );
}
