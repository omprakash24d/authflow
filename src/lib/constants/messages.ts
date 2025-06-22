// src/lib/constants/messages.ts
// This file centralizes user-facing messages for consistency and easier management.

export const ValidationErrors = {
  // Password
  passwordMinLength: 'Password must be at least 8 characters long.',
  passwordLowercase: 'Password must contain at least one lowercase letter.',
  passwordUppercase: 'Password must contain at least one uppercase letter.',
  passwordNumber: 'Password must contain at least one number.',
  passwordSpecialChar: 'Password must contain at least one special character.',
  passwordsDoNotMatch: 'Passwords do not match.',
  newPasswordsDoNotMatch: 'New passwords do not match.',
  currentPasswordRequired: 'Current password is required.',
  passwordRequired: 'Password is required.',

  // Email
  invalidEmailFormat: 'Invalid email address format.',
  emailSubaddressingNotPermitted: 'Email subaddresses (using +) are not permitted.',
  newEmailSameAsCurrent: 'The new email address cannot be the same as your current one.',

  // Username
  usernameMinLength: 'Username must be at least 3 characters.',
  usernameMaxLength: 'Username must be 30 characters or less.',
  usernameInvalidChars: 'Username can only contain letters, numbers, and underscores.',
  usernameIsAdmin: 'Username "admin" is not allowed for security reasons.',
  usernameContainsAt: 'Username cannot contain the "@" symbol.',
  usernameRequired: 'Email or username is required.',

  // General
  firstNameRequired: 'First name is required.',
  firstNameMaxLength: 'First name must be 64 characters or less.',
  lastNameRequired: 'Last name is required.',
  lastNameMaxLength: 'Last name must be 64 characters or less.',
  termsNotAccepted: 'You must accept the Terms of Service and Privacy Policy.',
  
  // MFA
  mfaCodeRequired: 'Verification code is required.',
  mfaCodeInvalid: 'The verification code must be 6 digits.',
};

export const AuthErrors = {
  serviceUnavailable: "Authentication service is not available. Please try again later.",
  unverifiedEmail: "Your email address is not verified. Please check your inbox for the verification link we sent you. If you don't see it, be sure to check your spam or junk folder. You can also click below to resend the verification link.",
  userNotFound: "No account found with this email address or username. Please check your credentials or sign up.",
  couldNotFindEmailForUsername: "Could not find email for the provided username.",
  userNotAuthenticated: 'User not authenticated. Please sign in again.',
  sessionCreationError: 'Failed to create session. Server response not in expected format.',
  photoUploadPrereqsNotMet: "Prerequisites for upload not met. Please try again.",
  requiresRecentLogin: "This operation is sensitive and requires recent authentication. Please sign out and sign back in, then try again.",
  
  // MFA Errors
  mfaRequired: "This account requires Two-Factor Authentication. Please enter the code from your authenticator app.",
  mfaSetupFailed: "Could not set up Two-Factor Authentication. Please try again.",
  mfaNotEnrolled: "Two-Factor Authentication is not enabled on this account.",
  mfaInvalidCode: "The verification code is invalid. Please try again.",
};

export const ProfileErrors = {
  dbServiceUnavailable: "Database service is not available. Profile data cannot be loaded or saved.",
  loadProfileError: "Could not load your profile data from the database.",
  usernameTaken: (username: string) => `Username "${username}" is already taken.`,
  verifyUsernameError: "Failed to verify username availability. Please try again.",
  saveProfileError: "An error occurred while saving your profile to the database.",
  permissionDenied: (message: string) => `Saving profile details to the database failed due to permissions. (Details: ${message})`,
  revertChangesError: (message: string) => `Your profile could not be saved to the database. Reverting changes. Details: ${message}`,
};

export const ApiErrors = {
  invalidUserLookup: 'Invalid user lookup.',
  deleteUserDataFailed: 'Failed to delete account data from the database.',
};

export const SuccessMessages = {
  passwordResetEmailSent: 'If an account exists for this email, a password reset link has been sent. Please check your inbox.',
  // Toast messages are kept in components for now to pair titles and descriptions easily.
};
