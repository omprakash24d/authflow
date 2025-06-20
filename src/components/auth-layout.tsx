// src/components/auth-layout.tsx
// This component defines the standard layout structure for all authentication-related pages
// (e.g., sign-in, sign-up, forgot password). It typically includes a logo and a footer.

import type { ReactNode } from 'react';
import { Logo } from '@/components/logo'; // Application logo component
import { AuthFooter } from '@/components/auth/auth-footer'; // Footer specific to auth pages

/**
 * Props for the AuthLayout component.
 * @property children - The content of the specific authentication page (e.g., SignInForm, SignUpForm).
 */
interface AuthLayoutProps {
  children: ReactNode;
}

/**
 * AuthLayout component.
 * Provides a consistent wrapper for authentication pages, including a logo at the top
 * and a specialized footer at the bottom. The main content (passed as children)
 * is centered on the page.
 * @param {AuthLayoutProps} props - The component's props.
 * @returns JSX.Element
 */
export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 sm:p-8 lg:p-10">
      {/* Logo displayed above the authentication form card */}
      <div className="mb-10">
        <Logo />
      </div>
      {/* Main content area for the authentication form/page */}
      <main className="w-full max-w-md ">
        {children}
      </main>
      {/* Footer specific to authentication pages */}
      <AuthFooter />
    </div>
  );
}
