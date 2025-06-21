// src/lib/constants/auth.ts
// This file centralizes constants related to authentication, sessions, and cookies.

/**
 * The name of the session cookie used to store the Firebase ID token for authenticated users.
 */
export const SESSION_COOKIE_NAME = 'firebaseIdToken';

/**
 * The duration of the session cookie in milliseconds.
 * Currently set to 14 days.
 * (14 days * 24 hours/day * 60 minutes/hour * 60 seconds/minute * 1000 milliseconds/second)
 */
export const SESSION_DURATION_MS = 14 * 24 * 60 * 60 * 1000;
