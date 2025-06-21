// src/contexts/auth-context.tsx
// This file provides an authentication context for the application.
// It manages the user's authentication state using Firebase Auth on the client-side.
//
// How to use:
// 1. Wrap your application's root layout (e.g., `src/app/layout.tsx`) with `<AuthProvider>`.
//    ```tsx
//    <AuthProvider>
//      {/* Your application components */}
//    </AuthProvider>
//    ```
//
// 2. In client components that need access to authentication state or functions, use the `useAuth` hook:
//    ```tsx
//    import { useAuth } from '@/contexts/auth-context';
//    // ...
//    const { user, loading, signOut } = useAuth();
//    ```
//
//    - `user`: A Firebase User object if authenticated, or `null` if not.
//    - `loading`: A boolean indicating if the initial authentication state is being determined. True on first load, then false.
//    - `signOut`: An asynchronous function to sign the user out. It handles both client-side Firebase sign-out
//                 and calling an API endpoint to clear the server-side session cookie.

'use client'; // This is a Client Component because it uses `createContext`, `useContext`, `useEffect`, `useState`.

import type { User as FirebaseUser } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config'; // Firebase Auth instance (can be null if config is missing)

/**
 * Interface for the User object within the AuthContext.
 * Extends FirebaseUser, allowing for potential custom properties in the future.
 */
interface User extends FirebaseUser {
  // Custom user properties can be added here if needed, e.g.:
  // role?: string;
}

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

// Create the AuthContext with an undefined initial value.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider component.
 * Wraps parts of the application that need access to authentication state.
 * It initializes Firebase Auth listener and provides user state and signOut function via context.
 * @param {object} props - The component's props.
 * @param {ReactNode} props.children - The child components to be wrapped by this provider.
 * @returns JSX.Element
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null); // Stores the authenticated user object or null
  const [loading, setLoading] = useState(true); // True until initial auth state check completes

  useEffect(() => {
    // If Firebase client auth service is not initialized (e.g., missing NEXT_PUBLIC_FIREBASE_* env vars),
    // set user to null and loading to false, and log a warning.
    if (!auth) {
      setUser(null);
      setLoading(false);
      console.warn("AuthContext: Firebase Auth service (client-side) is not available. User authentication will be disabled. Check NEXT_PUBLIC_FIREBASE_* env vars.");
      return; // Do not attempt to subscribe to auth state changes.
    }

    // Subscribe to Firebase authentication state changes.
    // `onAuthStateChanged` is the primary way Firebase notifies about user login/logout on the client.
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser as User); // Set the user if authenticated.
      } else {
        setUser(null); // Set user to null if not authenticated.
      }
      setLoading(false); // Auth state determined, set loading to false.
    });

    // Cleanup function: Unsubscribe from auth state changes when the AuthProvider component unmounts.
    // This prevents memory leaks.
    return () => unsubscribe();
  }, []); // Empty dependency array ensures this effect runs only once on mount.

  /**
   * Signs out the current user.
   * This involves:
   * 1. Calling an API endpoint to clear the server-side session cookie.
   * 2. Signing out from the Firebase client-side SDK.
   * 3. Redirecting the user to the homepage via a full page reload.
   */
  const signOut = async (): Promise<void> => {
    setLoading(true); // Indicate an operation is in progress (optional, as redirect happens quickly).
    
    try {
      // Step 1: Attempt to clear the server-side session cookie by calling the logout API.
      const logoutResponse = await fetch('/api/auth/session-logout', { method: 'POST' });
      if (!logoutResponse.ok) {
          // Log error if API call fails, but proceed with client logout.
          const errorText = await logoutResponse.text().catch(() => "Could not read error response text.");
          console.error('AuthContext: Failed to clear session cookie via API. Status:', logoutResponse.status, 'Response:', errorText);
      }
    } catch (error) {
      console.error('AuthContext: Error calling /api/auth/session-logout: ', error);
    }

    // Step 2: Sign out from Firebase client-side if auth service is available.
    if (auth) {
      try {
        await firebaseSignOut(auth);
        // `onAuthStateChanged` listener (above) will automatically handle setting `user` to null.
      } catch (clientSignOutError) {
        console.error('AuthContext: Error signing out from Firebase client: ', clientSignOutError);
        // Even if client sign out fails locally, proceed to redirect as server session *should* be cleared.
      }
    } else {
      // If auth service isn't available, we can't call Firebase sign out.
      // Manually set user to null and ensure loading is false before redirect.
      setUser(null);
      setLoading(false); // Explicitly set loading to false here
      console.warn("AuthContext: Firebase Auth service not available for client-side signOut. Proceeding with redirect.");
    }
    
    // Step 3: Redirect to homepage page using a full page reload.
    // This helps ensure cookie state is consistent for the middleware and a clean state.
    if (typeof window !== 'undefined') { // Ensure running in browser
      window.location.assign('/');
    }
  };

  // Provide the authentication state and signOut function to child components.
  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to easily access the AuthContext.
 * Throws an error if used outside of an AuthProvider.
 * @returns {AuthContextType} The authentication context (user, loading, signOut).
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider. Ensure your component tree is wrapped.');
  }
  return context;
}
