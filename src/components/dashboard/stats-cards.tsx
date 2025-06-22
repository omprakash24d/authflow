// src/components/dashboard/stats-cards.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MailCheck, ShieldCheck } from 'lucide-react';

// NOTE: In a real application, these values would be fetched from a backend service.
const statsData = {
  totalUsers: 134,
  verifiedEmails: 120,
  mfaEnabled: 45,
};

export function StatsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statsData.totalUsers}</div>
          <p className="text-xs text-muted-foreground">+10 since last week</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Verified Emails</CardTitle>
          <MailCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statsData.verifiedEmails}</div>
          <p className="text-xs text-muted-foreground">{Math.round((statsData.verifiedEmails / statsData.totalUsers) * 100)}% of total users</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">MFA Enabled</CardTitle>
          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statsData.mfaEnabled}</div>
          <p className="text-xs text-muted-foreground">{Math.round((statsData.mfaEnabled / statsData.totalUsers) * 100)}% of total users</p>
        </CardContent>
      </Card>
    </div>
  );
}
