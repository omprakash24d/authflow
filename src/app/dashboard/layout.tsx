// src/app/dashboard/layout.tsx
// This file defines the layout for all pages within the /dashboard route group.
// It establishes a consistent UI with a navigation sidebar.

import type { PropsWithChildren } from 'react';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarInset } from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { DashboardNav } from '@/components/dashboard/dashboard-nav';
import { ProtectedRoute } from '@/components/protected-route';

/**
 * DashboardLayout component.
 * Provides a sidebar navigation layout for all dashboard-related pages.
 * It also wraps the content with `ProtectedRoute` to ensure only authenticated
 * users can access this section.
 * @param {PropsWithChildren<{}>} props - Props containing children elements.
 * @returns JSX.Element
 */
export default function DashboardLayout({ children }: PropsWithChildren<{}>) {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <Logo />
          </SidebarHeader>
          <SidebarContent>
            <DashboardNav />
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
