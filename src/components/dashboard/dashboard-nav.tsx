// src/components/dashboard/dashboard-nav.tsx
// This client component renders the main navigation menu for the dashboard sidebar.
// It uses the `usePathname` hook to highlight the currently active link.
// The structure is designed to be easily extensible for new dashboard sections.

'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { LayoutDashboard, Settings } from 'lucide-react';

/**
 * DashboardNav component.
 * Renders the navigation links within the dashboard sidebar.
 * This component is responsible for the visual representation of navigation,
 * including active state highlighting and tooltips for collapsed mode.
 * @returns JSX.Element
 */
export function DashboardNav() {
  const pathname = usePathname();

  // Define the navigation items for the dashboard.
  // This array can be easily extended with new dashboard sections in the future.
  // For role-based navigation, this array could be generated dynamically based on user permissions.
  const navItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard />,
    },
    {
      href: '/dashboard/settings',
      label: 'Settings',
      icon: <Settings />,
    },
    // Example for future extension:
    // {
    //   href: '/dashboard/billing',
    //   label: 'Billing',
    //   icon: <CreditCard />,
    // },
  ];

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          {/* Using legacyBehavior with passHref is the correct pattern for wrapping third-party components like SidebarMenuButton in a Next.js Link */}
          <Link href={item.href} passHref legacyBehavior>
            <SidebarMenuButton
              isActive={pathname === item.href} // Highlight if the current path is an exact match.
              variant="default"
              size="default"
              tooltip={item.label} // Tooltip is automatically shown when the sidebar is collapsed.
            >
              {item.icon}
              <span>{item.label}</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
