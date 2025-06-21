'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormAlertProps {
  message: string | null;
  title: string;
  variant: 'destructive' | 'success';
  className?: string;
}

export function FormAlert({ message, title, variant, className }: FormAlertProps) {
  if (!message) {
    return null;
  }

  const Icon = variant === 'destructive' ? AlertTriangle : CheckCircle;
  
  return (
    <Alert
      variant={variant}
      className={cn(className)}
      aria-live="assertive"
    >
      <Icon className={cn('h-4 w-4')} />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
