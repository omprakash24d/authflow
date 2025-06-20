// src/contexts/auth-context.tsx
// This file provides an authentication context for the application.
// It manages the user's authentication state using Firebase Auth.
//
// How to use:
// 1. Wrap your application's root layout (e.g., src/app/layout.tsx) with <AuthProvider>.
//    <AuthProvider>
//      {/* Your application components */}
//    </AuthProvider>
//
// 2. In client components that need access to authentication state or functions, use the `useAuth` hook:
//    import { useAuth } from '@/contexts/auth-context';
//    const { user, loading, signOut } = useAuth();
//
//    `user`: A Firebase User object if authenticated, or null if not.
//    `loading`: A boolean indicating if the initial authentication state is being determined.
//    `signOut`: An async function to sign the user out.

'use client';

import type { User as FirebaseUser } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config'; // auth can be null if Firebase isn't configured

interface User extends FirebaseUser {
  // Custom user properties can be added here in the future if needed.
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // True until initial auth state check completes

  useEffect(() => {
    // If Firebase client auth service is not initialized (e.g., missing config),
    // set user to null and loading to false.
    if (!auth) {
      setUser(null);
      setLoading(false);
      console.warn("AuthContext: Firebase Auth service (client-side) is not available. User authentication will be disabled. Check NEXT_PUBLIC_FIREBASE_* env vars.");
      return; // Do not attempt to subscribe to auth state changes.
    }

    // Subscribe to Firebase authentication state changes.
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser as User); // Set the user if authenticated.
      } else {
        setUser(null); // Set user to null if not authenticated.
      }
      setLoading(false); // Auth state determined, set loading to false.
    });

    // Cleanup: Unsubscribe from auth state changes when the component unmounts.
    return () => unsubscribe();
  }, []); // Empty dependency array ensures this effect runs only once on mount.

  const signOut = async (): Promise<void> => {
    setLoading(true); // Indicate an operation is in progress.
    try {
      // Attempt to clear the server-side session cookie by calling the logout API.
      const logoutResponse = await fetch('/api/auth/session-logout', { method: 'POST' });
      if (!logoutResponse.ok) {
          const errorText = await logoutResponse.text();
          console.error('AuthContext: Failed to clear session cookie via API. Status:', logoutResponse.status, 'Response:', errorText);
          // Consider showing a user-facing toast if API logout fails, but proceed with client logout.
      }
    } catch (error) {
      console.error('AuthContext: Error calling /api/auth/session-logout: ', error);
      // Consider showing a user-facing toast.
    }

    // Sign out from Firebase client-side if auth service is available.
    if (auth) {
      try {
        await firebaseSignOut(auth);
        // `onAuthStateChanged` will handle setting user to null and loading to false.
      } catch (clientSignOutError) {
        console.error('AuthContext: Error signing out from Firebase client: ', clientSignOutError);
        // Even if client sign out fails, proceed to redirect as session should be cleared.
      }
    } else {
      // If auth service isn't available, we can't call Firebase sign out.
      // Manually set user to null and ensure loading is false before redirect.
      setUser(null);
      setLoading(false);
      console.warn("AuthContext: Firebase Auth service not available for client-side signOut. Proceeding with redirect.");
    }
    
    // Redirect to sign-in page using a full page reload.
    // This helps ensure cookie state is consistent for the middleware.
    if (typeof window !== 'undefined') {
      window.location.assign('/signin');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the AuthContext.
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider. Ensure your component tree is wrapped.');
  }
  return context;
}
