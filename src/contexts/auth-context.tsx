
'use client';

import type { User as FirebaseUser } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config'; // auth can now be null
// useRouter is no longer needed here as we'll use window.location.assign
// import { useRouter } from 'next/navigation';

interface User extends FirebaseUser {
  // Add custom user properties here if needed in the future
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // const router = useRouter(); // No longer needed

  useEffect(() => {
    if (!auth) {
      // Firebase Auth service is not initialized (e.g., due to missing config)
      setUser(null);
      setLoading(false);
      console.warn("AuthContext: Firebase Auth service is not available. User authentication will be disabled.");
      return; // Do not attempt to subscribe
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser as User);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []); // Empty dependency array as `auth` instance doesn't change post-initialization

  const signOut = async (): Promise<void> => {
    setLoading(true); // Indicate an operation is in progress
    try {
      const logoutResponse = await fetch('/api/auth/session-logout', { method: 'POST' });
      if (!logoutResponse.ok) {
          console.error('Failed to clear session cookie via API:', logoutResponse.status, await logoutResponse.text());
          // Consider showing a toast to the user if API logout fails
      }
    } catch (error) {
      console.error('Error in fetch /api/auth/session-logout: ', error);
      // Consider showing a toast to the user
    }

    if (auth) { // Only attempt Firebase sign out if auth service is available
      try {
        await firebaseSignOut(auth);
        // setUser(null) will be handled by onAuthStateChanged in response to firebaseSignOut
      } catch (clientSignOutError) {
        console.error('Error signing out from Firebase client: ', clientSignOutError);
      }
    } else {
      // If auth service is not available, we can't call firebaseSignOut,
      // but we should still clear our local state and try to redirect.
      setUser(null);
    }
    
    // Using window.location.assign for a full page reload to /signin
    // This helps ensure the browser state (especially cookies) is fresh for the middleware.
    // setLoading(false) is implicitly handled by the page reload and AuthContext re-initialization.
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
