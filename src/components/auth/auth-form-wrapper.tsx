// src/components/auth/auth-form-wrapper.tsx
// This component provides a consistent wrapper structure for authentication forms (e.g., sign-in, sign-up).
// It uses ShadCN's Card component to display a title, description, the form itself, and optional footer content.

import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

/**
 * Props for the AuthFormWrapper component.
 * @property title - The main title displayed at the top of the form card.
 * @property description - An optional description displayed below the title.
 * @property children - The actual form elements or content to be rendered within the card.
 * @property footerContent - Optional ReactNode to be displayed at the bottom of the card, typically for links like "Already have an account?".
 */
interface AuthFormWrapperProps {
  title: string;
  description?: string;
  children: ReactNode;
  footerContent?: ReactNode;
}

/**
 * AuthFormWrapper component.
 * A reusable UI wrapper for authentication forms.
 * @param {AuthFormWrapperProps} props - The component's props.
 * @returns JSX.Element
 */
export function AuthFormWrapper({ title, description, children, footerContent }: AuthFormWrapperProps) {
  return (
    <Card className="w-full shadow-xl"> {/* Card container with a shadow */}
      <CardHeader className="text-center"> {/* Header section, centered text */}
        <CardTitle className="text-2xl font-headline">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent> {/* Main content area for the form */}
        {children}
        {footerContent && (
          // Renders footer content if provided, typically links or alternative actions
          <div className="mt-6 text-center text-sm">
            {footerContent}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
