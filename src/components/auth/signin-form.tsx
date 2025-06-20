
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { SignInSchema, type SignInFormValues } from '@/lib/validators/auth';
import { getFirebaseAuthErrorMessage } from '@/lib/firebase/error-mapping';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AuthFormWrapper } from './auth-form-wrapper';
import { SocialLogins } from './social-logins';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, AlertTriangle, Loader2, MailCheck } from 'lucide-react';

export function SignInForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    if (searchParams.get('verificationEmailSent') === 'true') {
      setShowVerificationMessage(true);
      // Optional: remove the query param from URL
      // router.replace('/signin', undefined); 
    }
  }, [searchParams, router]);


  const form = useForm<SignInFormValues>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  async function onSubmit(values: SignInFormValues) {
    setIsLoading(true);
    setFormError(null);
    setShowVerificationMessage(false);

    try {
      // For now, we assume identifier is email. Username login can be added later.
      const userCredential = await signInWithEmailAndPassword(auth, values.identifier, values.password);
      
      if (userCredential.user && !userCredential.user.emailVerified) {
        const verifyErrorMsg = 'Please verify your email address before signing in. Check your inbox for a verification link.';
        setFormError(verifyErrorMsg);
        toast({
          title: 'Email Not Verified',
          description: verifyErrorMsg,
          variant: 'destructive',
        });
        // Optionally, offer to resend verification email here
        setIsLoading(false);
        return;
      }
      
      toast({
        title: 'Signed In!',
        description: 'Welcome back!',
      });
      router.push('/dashboard');

    } catch (error: any) {
      console.error("Sign In Error:", error);
      const errorMessage = getFirebaseAuthErrorMessage(error.code);
      setFormError(errorMessage);
       toast({
        title: 'Sign In Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthFormWrapper
      title="Sign In to AuthFlow"
      description="Enter your credentials to access your account."
      footerContent={
        <p>
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Sign Up
          </Link>
        </p>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {formError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          {showVerificationMessage && (
            <Alert variant="default" className="bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300">
              <MailCheck className="h-5 w-5 text-green-500 dark:text-green-400" />
              <AlertTitle className="font-semibold">Verification Email Sent</AlertTitle>
              <AlertDescription>
                Please check your inbox and click the verification link to activate your account.
              </AlertDescription>
            </Alert>
          )}
          <FormField
            control={form.control}
            name="identifier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email or Username</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="john.doe@example.com or johndoe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Link href="/forgot-password" passHref legacyBehavior>
                    <a className="text-sm font-medium text-primary hover:underline">
                      Forgot password?
                    </a>
                  </Link>
                </div>
                <FormControl>
                  <div className="relative">
                    <Input 
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••" 
                      {...field} 
                    />
                     <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Sign In
          </Button>
        </form>
      </Form>
      <SocialLogins />
    </AuthFormWrapper>
  );
}
