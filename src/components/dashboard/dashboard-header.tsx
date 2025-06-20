
'use client';

import type { User as FirebaseUser } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CardDescription, CardTitle } from '@/components/ui/card';

interface DashboardHeaderProps {
  user: FirebaseUser | null;
}

const getInitials = (name: string | null | undefined) => {
  if (!name) return '??';
  const names = name.split(' ');
  if (names.length === 1) return name.substring(0, 2).toUpperCase();
  return (names[0][0] + (names.length > 1 ? names[names.length - 1][0] : '')).toUpperCase();
};

export function DashboardHeader({ user }: DashboardHeaderProps) {
  if (!user) return null;

  return (
    <>
      <div className="flex justify-center mb-4">
        <Avatar className="h-24 w-24">
          <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
          <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
        </Avatar>
      </div>
      <CardTitle className="text-3xl font-headline">Welcome to AuthFlow!</CardTitle>
      <CardDescription>This is your personalized dashboard.</CardDescription>
    </>
  );
}
