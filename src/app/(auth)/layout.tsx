import AuthLayoutComponent from '@/components/auth-layout';
import type { ReactNode } from 'react';

export default function AuthPagesLayout({ children }: { children: ReactNode }) {
  return <AuthLayoutComponent>{children}</AuthLayoutComponent>;
}
