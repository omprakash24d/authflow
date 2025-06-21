// src/app/(auth)/layout.tsx
// This file defines the layout specifically for authentication-related pages
// (e.g., sign-in, sign-up, forgot-password) within the (auth) route group.
// It uses the `AuthLayoutComponent` to provide a consistent visual structure.

import AuthLayoutComponent from '@/components/auth-layout';
import type { ReactNode } from 'react';

/**
 * AuthPagesLayout component.
 * A server-side layout component that wraps all authentication pages.
 * It renders the `AuthLayoutComponent`, which provides the common visual
 * structure including the application logo and footer, ensuring a
 * consistent branding experience during the entire authentication flow.
 *
 * @param {object} props - The component's props.
 * @param {ReactNode} props.children - The child components to be rendered within this layout
 *   (this will be the specific page content, e.g., the sign-in form).
 * @returns {JSX.Element} The authentication layout wrapping the page content.
 */
export default function AuthPagesLayout({ children }: { children: ReactNode }) {
  // Renders the AuthLayoutComponent, passing children through to it.
  return <AuthLayoutComponent>{children}</AuthLayoutComponent>;
}
