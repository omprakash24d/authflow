// src/lib/validators/auth.ts
// This file defines Zod schemas for validating authentication-related forms.
// Zod is a TypeScript-first schema declaration and validation library.
// These schemas are used with React Hook Form for client-side and potentially server-side validation.

import { z } from 'zod';
import { ValidationErrors } from '@/lib/constants/messages';

// --- Reusable Validation Schemas & Constants ---

/**
 * Reusable password validation schema.
 * Defines criteria for a strong password:
 * - At least 8 characters long
 * - At least one lowercase letter
 * - At least one uppercase letter
 * - At least one number
 * - At least one special character
 */
const passwordValidation = z
  .string()
  .min(8, { message: ValidationErrors.passwordMinLength })
  .regex(/[a-z]/, { message: ValidationErrors.passwordLowercase })
  .regex(/[A-Z]/, { message: ValidationErrors.passwordUppercase })
  .regex(/[0-9]/, { message: ValidationErrors.passwordNumber })
  // Regex for common special characters.
  .regex(/[\!\"\#\$\%\&\'\(\)\*\+\,\-\.\/\:\;\<\=\>\?\@\[\\\]\^\_\`\{\|\}\~]/, { message: ValidationErrors.passwordSpecialChar });

/**
 * Reusable email validation schema.
 * Enforces standard email format and disallows email sub-addressing (aliases with '+').
 */
export const emailValidation = z
  .string()
  .email({ message: ValidationErrors.invalidEmailFormat }) // Standard email format check
  .refine(email => !/[+]/.test(email.split('@')[0]), { // Disallow email subaddressing with +
    message: ValidationErrors.emailSubaddressingNotPermitted,
  });

/**
 * Reusable username validation schema.
 * Enforces length, character set, and reserved names.
 */
const usernameValidation = z.string()
  .min(3, ValidationErrors.usernameMinLength)
  .max(30, ValidationErrors.usernameMaxLength)
  .regex(/^[a-zA-Z0-9_]+$/, ValidationErrors.usernameInvalidChars) // Alphanumeric and underscores
  .refine(val => val.toLowerCase() !== 'admin', { message: ValidationErrors.usernameIsAdmin }) // Disallow "admin" case-insensitively
  .refine(val => !val.includes('@'), { message: ValidationErrors.usernameContainsAt});


// --- Form-Specific Schemas ---

/**
 * Zod schema for the user Sign-Up form.
 * Validates all fields required for creating a new user account.
 */
export const SignUpSchema = z.object({
  firstName: z.string().min(1, ValidationErrors.firstNameRequired).max(64, ValidationErrors.firstNameMaxLength),
  lastName: z.string().min(1, ValidationErrors.lastNameRequired).max(64, ValidationErrors.lastNameMaxLength),
  username: usernameValidation,
  email: emailValidation,
  password: passwordValidation,
  confirmPassword: passwordValidation,
  termsAccepted: z.boolean().refine(val => val === true, { // Checkbox for terms and conditions
    message: ValidationErrors.termsNotAccepted,
  }),
}).refine(data => data.password === data.confirmPassword, { // Cross-field validation: ensure passwords match
  message: ValidationErrors.passwordsDoNotMatch,
  path: ['confirmPassword'], // Error message will be associated with the confirmPassword field
});

// TypeScript type inferred from the SignUpSchema.
export type SignUpFormValues = z.infer<typeof SignUpSchema>;


/**
 * Zod schema for the user Sign-In form.
 * Validates the identifier (email or username) and password.
 */
export const SignInSchema = z.object({
  // 'identifier' can be either an email or a username. Specific logic to handle this is in the form component.
  identifier: z.string().min(1, ValidationErrors.usernameRequired),
  password: z.string().min(1, ValidationErrors.passwordRequired), // Basic check; actual validation is done by Firebase
});

// TypeScript type inferred from the SignInSchema.
export type SignInFormValues = z.infer<typeof SignInSchema>;


/**
 * Zod schema for the Profile Settings form.
 * Validates fields for updating user profile information.
 */
export const ProfileSettingsSchema = z.object({
  firstName: z.string().min(1, ValidationErrors.firstNameRequired).max(64, ValidationErrors.firstNameMaxLength),
  lastName: z.string().min(1, ValidationErrors.lastNameRequired).max(64, ValidationErrors.lastNameMaxLength),
  username: usernameValidation,
});

// TypeScript type inferred from the ProfileSettingsSchema.
export type ProfileSettingsFormValues = z.infer<typeof ProfileSettingsSchema>;


/**
 * Zod schema for the Change Password form.
 * Validates current password, new password, and confirmation.
 */
export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, ValidationErrors.currentPasswordRequired),
  newPassword: passwordValidation, // New password must meet strength criteria
  confirmNewPassword: passwordValidation, // Confirmation must also meet criteria (though mainly for matching)
}).refine(data => data.newPassword === data.confirmNewPassword, { // Ensure new passwords match
  message: ValidationErrors.newPasswordsDoNotMatch,
  path: ['confirmNewPassword'],
});

// TypeScript type inferred from the ChangePasswordSchema.
export type ChangePasswordFormValues = z.infer<typeof ChangePasswordSchema>;


/**
 * Zod schema for the Change Email form.
 * Validates current password (for re-authentication) and the new email address.
 */
export const ChangeEmailSchema = z.object({
  currentPassword: z.string().min(1, ValidationErrors.currentPasswordRequired), // For re-authentication
  newEmail: emailValidation, // New email must be valid
});

// TypeScript type inferred from the ChangeEmailSchema.
export type ChangeEmailFormValues = z.infer<typeof ChangeEmailSchema>;


/**
 * Zod schema for the MFA Verification form (both sign-in and enrollment).
 * Validates the 6-digit TOTP code.
 */
export const MfaVerificationSchema = z.object({
  code: z
    .string()
    .min(1, { message: ValidationErrors.mfaCodeRequired })
    .length(6, { message: ValidationErrors.mfaCodeInvalid }),
});

// TypeScript type inferred from the MfaVerificationSchema.
export type MfaVerificationFormValues = z.infer<typeof MfaVerificationSchema>;
