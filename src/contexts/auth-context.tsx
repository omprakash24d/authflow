
'use client';

import type { User as FirebaseUser } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config'; // auth can now be null
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

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
    try {
      await fetch('/api/auth/session-logout', { method: 'POST' });
    } catch (error) {
      console.error('Error clearing session cookie via /api/auth/session-logout: ', error);
    }

    if (auth) { // Only attempt Firebase sign out if auth service is available
      try {
        await firebaseSignOut(auth);
      } catch (clientSignOutError) {
        console.error('Error signing out from Firebase client: ', clientSignOutError);
      }
    }
    
    setUser(null); // Always update client state
    router.push('/signin'); // Always redirect
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
