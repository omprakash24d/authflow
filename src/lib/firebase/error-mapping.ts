
'use client';

// Firebase error codes: https://firebase.google.com/docs/auth/admin/errors
// More client-side codes can be found by experimenting or checking Firebase SDK source/discussions.

const errorMap: { [key: string]: string } = {
  // General Firebase Auth Errors
  'auth/app-deleted': 'The Firebase app has been deleted. Please contact support.',
  'auth/app-not-authorized': 'This app is not authorized to use Firebase Authentication. Please check your Firebase project configuration.',
  'auth/argument-error': 'An invalid argument was provided to an Authentication method. Please contact support.',
  'auth/invalid-api-key': 'Your Firebase API key is invalid. Please check your configuration.',
  'auth/invalid-user-token': 'The user\'s credential is no longer valid. The user must sign in again.',
  'auth/invalid-tenant-id': 'The tenant ID provided is invalid.',
  'auth/network-request-failed': 'A network error (such as timeout, interrupted connection or unreachable host) has occurred. Please check your internet connection and try again.',
  'auth/operation-not-allowed': 'This sign-in method is not enabled in the Firebase console. Please contact support.',
  'auth/requires-recent-login': 'This operation is sensitive and requires recent authentication. Please sign out and sign back in, then try again.',
  'auth/too-many-requests': 'Access to this account has been temporarily disabled due to many failed attempts. You can try again later, or reset your password.',
  'auth/unauthorized-domain': 'This domain is not authorized to use Firebase Authentication. Please check your Firebase project configuration.',
  'auth/user-disabled': 'This user account has been disabled by an administrator.',
  'auth/user-token-expired': 'The user\'s credential has expired. The user must sign in again.',
  'auth/web-storage-unsupported': 'This browser does not support web storage or third-party cookies/data are disabled. Please enable them and try again.',
  'auth/internal-error': 'An unexpected internal error occurred. Please try again later or contact support.',

  // Email/Password Specific Errors
  'auth/email-already-in-use': 'This email address is already in use by another account.',
  'auth/invalid-email': 'The email address is not valid. Please enter a correct email.',
  'auth/user-not-found': 'No account found with this email address. Please check your email or sign up.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/weak-password': 'The password is too weak. It must be at least 6 characters long (though we recommend stronger validation).', // Firebase's minimum is 6. Our custom validator is stricter.
  'auth/missing-password': 'Password is required to sign in.',
  'auth/invalid-credential': 'Invalid credentials. Please check your email and password and try again.', // Generic for email/pass if specific cause isn't clear

  // Phone Authentication Specific Errors (for future use)
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

  // OAuth / Social Sign-In Specific Errors (e.g., Google, Facebook, etc.)
  'auth/account-exists-with-different-credential': 'An account already exists with the same email address but different sign-in credentials. Try signing in using a provider associated with this email address.',
  'auth/auth-domain-config-required': 'OAuth configuration is missing. Please contact support.',
  'auth/credential-already-in-use': 'This credential is already associated with a different user account. You may need to link it in your account settings if supported.',
  'auth/email-change-needs-verification': 'The new email requires verification before the change can be applied.', // When updating email
  'auth/missing-android-pkg-name': 'An Android package name is required for Android app authentication.', // Relevant if using Android
  'auth/missing-continue-uri': 'A continue URL must be provided in the request.', // For email link auth etc.
  'auth/missing-ios-bundle-id': 'An iOS Bundle ID is required for iOS app authentication.', // Relevant if using iOS
  'auth/oauth-credential-already-in-use': 'This OAuth credential is already associated with another Firebase user.',
  'auth/popup-blocked': 'The sign-in popup was blocked by your browser. Please allow popups for this site and try again.',
  'auth/popup-closed-by-user': 'The sign-in popup was closed before completing the operation. Please try again.',
  'auth/cancelled-popup-request': 'The sign-in popup request was cancelled, possibly because another popup was opened. Please try again.',
  'auth/unauthorized-continue-uri': 'The continue URL domain is not whitelisted. Please contact support.',
  'auth/user-cancelled': 'The sign-in process was cancelled by the user.', // General OAuth cancellation

  // Linking Errors
  'auth/provider-already-linked': 'This user is already linked with the selected provider.',
  'auth/no-such-provider': 'The selected authentication provider is not configured or does not exist.',

  // Default fallback for unmapped errors
  'default': 'An unexpected error occurred. Please try again or contact support if the issue persists.',
};

export function getFirebaseAuthErrorMessage(errorCode: string | undefined): string {
  if (!errorCode) {
    return errorMap['default'];
  }
  return errorMap[errorCode] || `${errorMap['default']} (Error code: ${errorCode})`;
}
