import { z } from 'zod';

const passwordValidation = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters long.' })
  .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter.' })
  .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter.' })
  .regex(/[0-9]/, { message: 'Password must contain at least one number.' })
  .regex(/[\!\"\#\$\%\&\'\(\)\*\+\,\-\.\/\:\;\<\=\>\?\@\[\\\]\^\_\`\{\|\}\~]/, { message: 'Password must contain at least one special character.' });

const emailValidation = z
  .string()
  .email({ message: 'Invalid email address.' })
  .refine(email => !/[+=#]/.test(email.split('@')[0]), {
    message: 'Email subaddresses with +, =, or # are not allowed.',
  });
  
export const SignUpSchema = z.object({
  firstName: z.string().min(1, 'First name is required.').max(64, 'First name must be 64 characters or less.'),
  lastName: z.string().min(1, 'Last name is required.').max(64, 'Last name must be 64 characters or less.'),
  username: z.string().min(1, 'Username is required.').max(64, 'Username must be 64 characters or less.')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores.'),
  email: emailValidation,
  password: passwordValidation,
  confirmPassword: passwordValidation,
  termsAccepted: z.boolean().refine(val => val === true, {
    message: 'You must accept the Terms of Service and Privacy Policy.',
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'],
});

export type SignUpFormValues = z.infer<typeof SignUpSchema>;

export const SignInSchema = z.object({
  identifier: z.string().min(1, 'Email or username is required.'), // Can be email or username
  password: z.string().min(1, 'Password is required.'),
});

export type SignInFormValues = z.infer<typeof SignInSchema>;
