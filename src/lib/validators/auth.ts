// src/lib/validators/auth.ts
// This file defines Zod schemas for validating authentication-related forms.
// Zod is a TypeScript-first schema declaration and validation library.
// These schemas are used with React Hook Form for client-side and potentially server-side validation.

import { z } from 'zod';

// Reusable password validation schema.
// Defines criteria for a strong password.
const passwordValidation = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters long.' })
  .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter.' })
  .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter.' })
  .regex(/[0-9]/, { message: 'Password must contain at least one number.' })
  // Regex for common special characters.
  .regex(/[\!\"\#\$\%\&\'\(\)\*\+\,\-\.\/\:\;\<\=\>\?\@\[\\\]\^\_\`\{\|\}\~]/, { message: 'Password must contain at least one special character.' });

// Reusable email validation schema.
export const emailValidation = z
  .string()
  .email({ message: 'Invalid email address format.' }) // Standard email format check
  .refine(email => !/[+=#]/.test(email.split('@')[0]), { // Disallow email subaddressing with +, =, #
    message: 'Email subaddresses (using +, =, or #) are not allowed for uniqueness.',
  });

// Schema for the Sign Up form.
export const SignUpSchema = z.object({
  firstName: z.string().min(1, 'First name is required.').max(64, 'First name must be 64 characters or less.'),
  lastName: z.string().min(1, 'Last name is required.').max(64, 'Last name must be 64 characters or less.'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters.')
    .max(30, 'Username must be 30 characters or less.')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores.') // Alphanumeric and underscores
    .refine(val => val.toLowerCase() !== 'admin', { message: 'Username "admin" is not allowed for security reasons.' }), // Disallow "admin"
  email: emailValidation, // Use the reusable email schema
  password: passwordValidation, // Use the reusable password schema
  confirmPassword: passwordValidation, // Password confirmation field
  termsAccepted: z.boolean().refine(val => val === true, { // Checkbox for terms and conditions
    message: 'You must accept the Terms of Service and Privacy Policy.',
  }),
}).refine(data => data.password === data.confirmPassword, { // Cross-field validation: ensure passwords match
  message: 'Passwords do not match.',
  path: ['confirmPassword'], // Error message will be associated with the confirmPassword field
});

// TypeScript type inferred from the SignUpSchema.
export type SignUpFormValues = z.infer<typeof SignUpSchema>;

// Schema for the Sign In form.
export const SignInSchema = z.object({
  // 'identifier' can be either an email or a username.
  identifier: z.string().min(1, 'Email or username is required.'), 
  password: z.string().min(1, 'Password is required.'), // Basic check; actual validation is done by Firebase
});

// TypeScript type inferred from the SignInSchema.
export type SignInFormValues = z.infer<typeof SignInSchema>;

// Schema for Profile Settings form (updating user profile information).
export const ProfileSettingsSchema = z.object({
  firstName: z.string().min(1, 'First name is required.').max(64, 'First name must be 64 characters or less.'),
  lastName: z.string().min(1, 'Last name is required.').max(64, 'Last name must be 64 characters or less.'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters.')
    .max(30, 'Username must be 30 characters or less.')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores.')
    .refine(val => val.toLowerCase() !== 'admin', { message: 'Username "admin" is not allowed for security reasons.' })
    .refine(val => !val.includes('@'), { message: 'Username cannot contain the "@" symbol.'}), // Username cannot be an email
});
// TypeScript type inferred from the ProfileSettingsSchema.
export type ProfileSettingsFormValues = z.infer<typeof ProfileSettingsSchema>;

// Schema for the Change Password form.
export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required.'),
  newPassword: passwordValidation, // New password must meet strength criteria
  confirmNewPassword: passwordValidation, // Confirmation must also meet criteria (though mainly for matching)
}).refine(data => data.newPassword === data.confirmNewPassword, { // Ensure new passwords match
  message: 'New passwords do not match.',
  path: ['confirmNewPassword'],
});
// TypeScript type inferred from the ChangePasswordSchema.
export type ChangePasswordFormValues = z.infer<typeof ChangePasswordSchema>;

// Schema for the Change Email form.
export const ChangeEmailSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."), // For re-authentication
  newEmail: emailValidation, // New email must be valid
});
// TypeScript type inferred from the ChangeEmailSchema.
export type ChangeEmailFormValues = z.infer<typeof ChangeEmailSchema>;
