
'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from 'firebase/auth';
import { auth, firestore } from '@/lib/firebase/config'; // Import firestore
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'; // Import firestore functions
import { SignUpSchema, type SignUpFormValues } from '@/lib/validators/auth';
import { checkPasswordBreach } from '@/ai/flows/password-breach-detector';
import { getFirebaseAuthErrorMessage } from '@/lib/firebase/error-mapping';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AuthFormWrapper } from './auth-form-wrapper';
import { PasswordStrengthIndicator } from './password-strength-indicator';
import { SocialLogins } from './social-logins';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, AlertTriangle, Loader2 } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [breachWarning, setBreachWarning] = useState<{ count: number; formValues: SignUpFormValues } | null>(null);
  
  const router = useRouter();
  const { toast } = useToast();
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      termsAccepted: false,
    },
  });

  const watchedPassword = form.watch('password');

  async function executeRegistration(registrationValues: SignUpFormValues) {
    setIsLoading(true);
    setFormError(null); 
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, registrationValues.email, registrationValues.password);
      const user = userCredential.user;

      // Set displayName to username for Firebase Auth user
      await updateProfile(user, {
        displayName: registrationValues.username,
      });
      
      // Store username and user profile in Firestore
      if (firestore) {
        const usernameDocRef = doc(firestore, 'usernames', registrationValues.username.toLowerCase());
        await setDoc(usernameDocRef, {
          uid: user.uid,
          email: user.email,
          username: registrationValues.username, 
          createdAt: serverTimestamp(),
        });
        
        const userProfileDocRef = doc(firestore, 'users', user.uid);
        await setDoc(userProfileDocRef, {
            firstName: registrationValues.firstName,
            lastName: registrationValues.lastName,
            email: user.email,
            username: registrationValues.username,
            createdAt: serverTimestamp(),
        }, { merge: true });
      } else {
        console.warn("Firestore client not available, skipping username/profile document creation.");
        // Potentially inform the user or log this more formally if profile data is critical
      }

      await sendEmailVerification(user);
      toast({
        title: 'Account Created!',
        description: 'A verification email has been sent. Please check your inbox.',
      });
      router.push('/signin?verificationEmailSent=true');

    } catch (error: any) {
      console.error("Registration Error:", error);
      let errorMessage = getFirebaseAuthErrorMessage(error.code);
      if (error.code === 'firestore/permission-denied') {
        errorMessage = 'Account created, but failed to save username/profile due to database permissions. Please contact support or check your Firestore security rules.';
      }
      setFormError(errorMessage);
       toast({
        title: 'Sign Up Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function onSubmit(values: SignUpFormValues) {
    setIsLoading(true);
    setFormError(null);
    setBreachWarning(null); 

    // Client-side username check or other pre-flight checks are omitted for brevity
    // but would be important in a production app (e.g., calling an API to check username availability).

    try {
      const breachResult = await checkPasswordBreach({ password: values.password });
      if (breachResult.isBreached && (breachResult.breachCount || 0) > 0) {
        setBreachWarning({ count: breachResult.breachCount || 0, formValues: values });
        setIsLoading(false);
        return; 
      }
      await executeRegistration(values);
    } catch (error: any) {
      // This catch block is for errors primarily from checkPasswordBreach or unexpected issues before executeRegistration
      console.error("Error during pre-registration checks (e.g., password breach):", error);
      const breachCheckErrorMsg = getFirebaseAuthErrorMessage(error.code) || "Could not verify password security. Please try again.";
      setFormError(breachCheckErrorMsg);
      toast({
        title: 'Security Check Failed',
        description: breachCheckErrorMsg,
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  }

  const handleProceedWithBreachedPassword = () => {
    if (breachWarning?.formValues) {
      executeRegistration(breachWarning.formValues);
    }
    setBreachWarning(null);
  };

  const handleChooseNewPassword = () => {
    setBreachWarning(null);
    form.setValue('password', '');
    form.setValue('confirmPassword', '');
    passwordInputRef.current?.focus();
    toast({
        title: 'Choose a New Password',
        description: 'Please enter a new, secure password.',
    });
  };

  return (
    <AuthFormWrapper
      title="Create an Account"
      description="Enter your details below to get started."
      footerContent={
        <p>
          Already have an account?{' '}
          <Link href="/signin" className="font-medium text-primary hover:underline">
            Sign In
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="johndoe" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="john.doe@example.com" {...field} disabled={isLoading} />
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
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      ref={(e) => {
                        field.ref(e);
                        if (e) {
                           // @ts-ignore
                           passwordInputRef.current = e;
                        }
                      }}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••" 
                      {...field} 
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </FormControl>
                {watchedPassword && watchedPassword.length > 0 && (
                  <PasswordStrengthIndicator password={watchedPassword} />
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                 <div className="relative">
                    <Input 
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••" 
                      {...field} 
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="termsAccepted"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-label="Accept terms and conditions"
                    disabled={isLoading}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-normal">
                    I agree to the{' '}
                    <Link href="https://indhinditech.com/terms-of-service" target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="https://indhinditech.com" target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
                      Privacy Policy
                    </Link>
                    .
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Sign Up
          </Button>
        </form>
      </Form>
      <SocialLogins />

      {breachWarning && (
        <AlertDialog open={breachWarning !== null} onOpenChange={(isOpen) => {
          if (!isOpen && breachWarning) { 
             handleChooseNewPassword();
          }
        }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-6 w-6 text-destructive" />
                <AlertDialogTitle>Compromised Password Warning</AlertDialogTitle>
              </div>
              <AlertDialogDescription className="pt-2">
                The password you entered has been found in {breachWarning.count} known data breaches.
                Using this password significantly increases the risk of your account being compromised.
                We strongly recommend choosing a different, unique password.
                <br /><br />
                Do you want to proceed with this password anyway?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleChooseNewPassword}>
                Choose a New Password
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleProceedWithBreachedPassword}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              >
                Proceed Anyway
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </AuthFormWrapper>
  );
}
