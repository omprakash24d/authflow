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
  const iconSpecificClasses = variant === 'destructive' ? '' : 'text-green-500 dark:text-green-400';
  
  const alertBaseClasses = variant === 'success'
    ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300'
    : ''; // Destructive is handled by Alert's own variant prop

  return (
    <Alert
      variant={variant === 'destructive' ? 'destructive' : 'default'}
      className={cn(alertBaseClasses, className)}
      aria-live="assertive"
    >
      <Icon className={cn('h-4 w-4', iconSpecificClasses)} />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
