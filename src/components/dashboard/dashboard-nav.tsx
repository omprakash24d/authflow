// src/components/dashboard/dashboard-nav.tsx
// This client component renders the main navigation menu for the dashboard sidebar.
// It uses the `usePathname` hook to highlight the currently active link.

'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { LayoutDashboard, Settings } from 'lucide-react';

/**
 * DashboardNav component.
 * Renders the navigation links within the dashboard sidebar.
 * @returns JSX.Element
 */
export function DashboardNav() {
  const pathname = usePathname();

  // Define the navigation items for the dashboard.
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
  ];

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href} passHref legacyBehavior>
            <SidebarMenuButton
              isActive={pathname === item.href} // Highlight if the current path matches the link
              variant="default"
              size="default"
              tooltip={item.label} // Show tooltip when sidebar is collapsed
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
