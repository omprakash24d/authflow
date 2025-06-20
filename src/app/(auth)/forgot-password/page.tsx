
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import type { Metadata } from 'next';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AuthFormWrapper } from '@/components/auth/auth-form-wrapper';
import { useToast } from '@/hooks/use-toast';
import { Mail, AlertTriangle, Loader2, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Reset Your AuthFlow Password | Forgot Password',
  description: 'Forgot your AuthFlow password? Enter your email address to receive a secure link to reset your password and regain access to your account.',
};

const ForgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
});

type ForgotPasswordFormValues = z.infer<typeof ForgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(values: ForgotPasswordFormValues) {
    setIsLoading(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      await sendPasswordResetEmail(auth, values.email);
      setFormSuccess('If an account exists for this email, a password reset link has been sent. Please check your inbox.');
      toast({
        title: 'Password Reset Email Sent',
        description: 'Check your inbox for instructions to reset your password.',
      });
      form.reset();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Password Reset Error:', error.message, (error as any).code);
      } else {
        console.error('Password Reset Error:', error);
      }
      setFormError('An error occurred. Please try again.');
      toast({
        title: 'Error Sending Reset Email',
        description: 'Could not send password reset email. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthFormWrapper
      title="Forgot Your Password?"
      description="Enter your email address and we'll send you a link to reset your password."
      footerContent={
        <p>
          Remembered your password?{' '}
          <Link href="/signin" className="font-medium text-primary hover:underline">
            Sign In
          </Link>
        </p>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {formError && (
            <Alert variant="destructive" aria-live="assertive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          {formSuccess && (
            <Alert variant="default" className="bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300" aria-live="assertive">
              <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{formSuccess}</AlertDescription>
            </Alert>
          )}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input type="email" placeholder="john.doe@example.com" className="pl-10" {...field} disabled={isLoading} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Send Reset Link
          </Button>
        </form>
      </Form>
    </AuthFormWrapper>
  );
}
