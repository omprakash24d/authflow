// src/lib/firebase/error-mapping.ts
// This file provides a utility function to map Firebase Authentication error codes
// to more user-friendly messages. This helps in displaying clearer error feedback
// to users instead of raw Firebase error codes.

'use client'; // This utility is likely used in client components to display errors.

// Firebase error codes documentation can be found at:
// - General: https://firebase.google.com/docs/auth/admin/errors (some overlap with client)
// - Client-side specifics are often discovered through SDK usage or community resources.

// A map of Firebase error codes to user-friendly messages.
const errorMap: { [key: string]: string } = {
  // General Firebase Auth Errors
  'auth/app-deleted': 'The Firebase application has been deleted. Please contact support.',
  'auth/app-not-authorized': 'This application is not authorized to use Firebase Authentication. Please check your Firebase project configuration and ensure the domain is whitelisted.',
  'auth/argument-error': 'An invalid argument was provided to an Authentication method. This is likely a developer error. Please contact support.',
  'auth/invalid-api-key': 'Your Firebase API key is invalid. Please check your application configuration.',
  'auth/invalid-user-token': 'The user\'s credential is no longer valid. The user must sign in again.',
  'auth/invalid-tenant-id': 'The tenant ID provided is invalid. This is relevant for multi-tenant Firebase projects.',
  'auth/network-request-failed': 'A network error (such as timeout, interrupted connection, or unreachable host) has occurred. Please check your internet connection and try again.',
  'auth/operation-not-allowed': 'This sign-in method (e.g., Email/Password, Google Sign-In) is not enabled in the Firebase console. Please contact support or check your Firebase project settings.',
  'auth/requires-recent-login': 'This operation is sensitive and requires recent authentication. Please sign out and sign back in, then try again.',
  'auth/too-many-requests': 'Access to this account has been temporarily disabled due to many failed login attempts. You can try again later, or reset your password.',
  'auth/unauthorized-domain': 'This domain is not authorized to perform operations with Firebase Authentication. Please check your Firebase project settings.',
  'auth/user-disabled': 'This user account has been disabled by an administrator. Please contact support.',
  'auth/user-token-expired': 'The user\'s credential has expired. The user must sign in again.',
  'auth/web-storage-unsupported': 'This browser does not support web storage (localStorage/sessionStorage) or third-party cookies/data are disabled. Please enable them and try again, as Firebase Auth relies on them.',
  'auth/internal-error': 'An unexpected internal error occurred on the Firebase server. Please try again later or contact support.',
  'auth/invalid-app-credential': 'The application credential used to initialize the Admin SDK is invalid. This is a server-side configuration issue.',
  'auth/session-cookie-expired': 'The Firebase session cookie has expired. Please sign in again.',
  'auth/session-cookie-revoked': 'The Firebase session cookie has been revoked. Please sign in again.',

  // Email/Password Specific Errors
  'auth/email-already-in-use': 'This email address is already registered. Please try signing in or use a different email.',
  'auth/invalid-email': 'The email address is not valid. Please enter a correctly formatted email (e.g., user@example.com).',
  'auth/user-not-found': 'No account found with this email address or username. Please check your credentials or sign up.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/weak-password': 'The password is too weak. It must be at least 6 characters long. For better security, please use a stronger password.', // Firebase's minimum is 6. This app's custom validator is stricter.
  'auth/missing-password': 'Password is required to sign in or sign up.',
  'auth/invalid-credential': 'Invalid credentials. This error may occur if the user does not exist or the password was incorrect. Please check your details and try again.', // Generic for email/pass if specific cause isn't clear

  // Phone Authentication Specific Errors (Placeholders for future use if Phone Auth is added)
  'auth/captcha-check-failed': 'The reCAPTCHA response is invalid. Please try again.',
  'auth/invalid-phone-number': 'The phone number is not in a valid format.',
  'auth/missing-phone-number': 'A phone number is required for this sign-in method.',
  'auth/quota-exceeded': 'The SMS quota for this project has been exceeded. Please try again later.',
  'auth/user-mismatch': 'The phone verification credential does not correspond to the current user.',
  'auth/invalid-verification-code': 'The verification code is invalid. Please try again.',
  'auth/invalid-verification-id': 'The verification ID is invalid.',
  'auth/missing-verification-code': 'A verification code is required.',
  'auth/missing-verification-id': 'A verification ID is required.',
  'auth/code-expired': 'The SMS code has expired. Please request a new one.',
  'auth/session-expired': 'The phone authentication session has expired. Please try again.',

  // OAuth / Social Sign-In Specific Errors (e.g., Google, Facebook, GitHub, Microsoft etc.)
  'auth/account-exists-with-different-credential': 'An account already exists with the same email address but was created using a different sign-in method (e.g., Google, Email/Password). Please sign in using the original method, or link your accounts if that feature is available.',
  'auth/auth-domain-config-required': 'OAuth configuration is missing from your Firebase project. Please contact support or check Firebase console settings.',
  'auth/credential-already-in-use': 'This social media credential (e.g., Google account) is already associated with a different user account in this application. You may need to link it in your account settings if supported, or sign in with the other account.',
  'auth/email-change-needs-verification': 'The new email requires verification before the change can be applied. Please check your new email inbox.', // When updating email
  'auth/missing-android-pkg-name': 'An Android package name is required for Android app authentication with this provider.', // Relevant if using native Android
  'auth/missing-continue-uri': 'A continue URL must be provided in the request for email link authentication or other redirect-based flows.',
  'auth/missing-ios-bundle-id': 'An iOS Bundle ID is required for iOS app authentication with this provider.', // Relevant if using native iOS
  'auth/oauth-credential-already-in-use': 'This OAuth credential (e.g., from Google, GitHub) is already associated with another Firebase user.',
  'auth/popup-blocked': 'The sign-in popup was blocked by your browser. Please allow popups for this site and try again.',
  'auth/popup-closed-by-user': 'The sign-in popup was closed before completing the operation. Please try again.',
  'auth/cancelled-popup-request': 'The sign-in popup request was cancelled, possibly because another popup was opened or the user navigated away. Please try again.',
  'auth/unauthorized-continue-uri': 'The continue URL domain is not whitelisted in your Firebase project settings. Please contact support.',
  'auth/user-cancelled': 'The sign-in process was cancelled by the user.', // General OAuth cancellation
  'auth/operation-not-supported-in-this-environment': 'This operation is not supported in the current environment (e.g., trying to use a web-only feature in Node.js).',
  'auth/timeout': 'The operation timed out. Please try again.',

  // Linking Errors
  'auth/provider-already-linked': 'This user account is already linked with the selected social provider.',
  'auth/no-such-provider': 'The selected authentication provider (e.g., "google.com") is not configured or does not exist in your Firebase project.',

  // Default fallback for unmapped errors
  'default': 'An unexpected error occurred. Please try again. If the issue persists, contact support.',
};

/**
 * Converts a Firebase Authentication error code into a user-friendly message.
 * @param {string | undefined} errorCode - The error code string from a Firebase Auth error object.
 * @returns {string} A user-friendly error message.
 */
export function getFirebaseAuthErrorMessage(errorCode: string | undefined): string {
  if (!errorCode) {
    // If no error code is provided, return the default message.
    return errorMap['default'];
  }
  // Return the mapped message if the code exists, otherwise return a generic message including the code.
  return errorMap[errorCode] || `${errorMap['default']} (Error code: ${errorCode})`;
}
