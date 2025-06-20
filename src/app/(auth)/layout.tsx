// src/app/(auth)/layout.tsx
// This file defines the layout specifically for authentication-related pages
// (e.g., sign-in, sign-up, forgot-password) within the (auth) route group.
// It uses the `AuthLayoutComponent` to provide a consistent look and feel for these pages.

import AuthLayoutComponent from '@/components/auth-layout';
import type { ReactNode } from 'react';

/**
 * AuthPagesLayout component.
 * A layout component that wraps authentication pages.
 * @param {object} props - The component's props.
 * @param {ReactNode} props.children - The child components to be rendered within this layout (typically the page content).
 * @returns JSX.Element
 */
export default function AuthPagesLayout({ children }: { children: ReactNode }) {
  // Renders the AuthLayoutComponent, passing children through to it.
  // AuthLayoutComponent typically includes common elements like a logo and footer for auth pages.
  return <AuthLayoutComponent>{children}</AuthLayoutComponent>;
}
