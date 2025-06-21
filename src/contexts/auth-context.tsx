// src/contexts/auth-context.tsx
// This file provides an authentication context for the application.
// It manages the user's authentication state using Firebase Auth on the client-side.

'use client'; // This is a Client Component because it uses client-side state and effects.

import type { User as FirebaseUser } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config'; // Firebase Auth instance

/**
 * Interface for the User object within the AuthContext.
 */
interface User extends FirebaseUser {}

/**
 * Defines the shape of the authentication context.
 * @property user - The current authenticated user or null.
 * @property loading - Boolean indicating if the initial auth state is being determined.
 * @property signOut - Function to log out the user.
 */
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider component.
 * Wraps the application to provide global authentication state.
 * @param {object} props - The component's props.
 * @param {ReactNode} props.children - The child components to be wrapped by this provider.
 * @returns JSX.Element
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If Firebase client auth service is not initialized, stop loading and log a warning.
    if (!auth) {
      setUser(null);
      setLoading(false);
      console.warn("AuthContext: Firebase Auth service (client-side) is not available. Check NEXT_PUBLIC_FIREBASE_* env vars.");
      return;
    }

    // Subscribe to Firebase auth state changes. This is the primary mechanism
    // for updating the UI when a user signs in or out.
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser as User | null);
      setLoading(false); // Auth state determined, no longer loading.
    });

    // Cleanup: Unsubscribe from the listener when the component unmounts to prevent memory leaks.
    return () => unsubscribe();
  }, []);

  /**
   * Signs out the current user from both server-side session and client-side state.
   * Memoized with `useCallback` to prevent unnecessary re-renders in consumer components.
   */
  const signOut = useCallback(async (): Promise<void> => {
    try {
      // Step 1: Clear the server-side session cookie by calling our API endpoint.
      const logoutResponse = await fetch('/api/auth/session-logout', { method: 'POST' });
      if (!logoutResponse.ok) {
          // Log if the API call fails, but proceed with client-side logout regardless.
          console.warn('AuthContext: Failed to clear server session cookie. The user will be logged out on the client, but the cookie might persist until it expires.');
      }
    } catch (error) {
      console.error('AuthContext: Error calling sign-out API.', error);
    }

    // Step 2: Sign out from the Firebase client-side SDK if available.
    if (auth) {
      await firebaseSignOut(auth);
    }
    
    // Step 3: Redirect to the homepage with a full page reload.
    // This ensures all application state is completely reset, which is a robust
    // approach for sign-out. `onAuthStateChanged` will handle the user state update.
    if (typeof window !== 'undefined') {
      window.location.assign('/');
    }
  }, []);

  // Provide the authentication state and signOut function to child components.
  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to easily access the AuthContext.
 * Throws an error if used outside of an AuthProvider to prevent common bugs.
 * @returns {AuthContextType} The authentication context (user, loading, signOut).
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider. Ensure your component tree is wrapped.');
  }
  return context;
}
