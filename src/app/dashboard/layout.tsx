// src/app/dashboard/layout.tsx
// This file defines the layout for all pages within the /dashboard route group.
// It establishes a consistent UI with a navigation sidebar and handles route protection.

import type { PropsWithChildren } from 'react';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarInset } from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { DashboardNav } from '@/components/dashboard/dashboard-nav';
import { ProtectedRoute } from '@/components/protected-route';

/**
 * DashboardLayout component.
 * Provides a sidebar navigation layout for all dashboard-related pages.
 * It's responsible for the overall structure of the authenticated user experience,
 * including the persistent sidebar and the main content area.
 * 
 * This layout also wraps its children with the `ProtectedRoute` component,
 * ensuring that only authenticated users can access any route within this layout.
 * 
 * @param {PropsWithChildren<{}>} props - Props object.
 * @param {React.ReactNode} props.children - The specific page component to be rendered
 *   within the dashboard's main content area (e.g., DashboardPageContent or SettingsPageContent).
 * @returns JSX.Element
 */
export default function DashboardLayout({ children }: PropsWithChildren<{}>) {
  return (
    // ProtectedRoute ensures that only authenticated users can see the content.
    // If a user is not authenticated, they will be redirected to the sign-in page.
    <ProtectedRoute>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <Logo />
          </SidebarHeader>
          <SidebarContent>
            {/* DashboardNav handles the navigation links within the sidebar. */}
            <DashboardNav />
          </SidebarContent>
        </Sidebar>
        {/* SidebarInset is the main content area to the right of the sidebar. */}
        <SidebarInset>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
