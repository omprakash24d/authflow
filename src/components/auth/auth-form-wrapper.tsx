import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface AuthFormWrapperProps {
  title: string;
  description?: string;
  children: ReactNode;
  footerContent?: ReactNode;
}

export function AuthFormWrapper({ title, description, children, footerContent }: AuthFormWrapperProps) {
  return (
    <Card className="w-full shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-headline">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {children}
        {footerContent && (
          <div className="mt-6 text-center text-sm">
            {footerContent}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
