
'use client';

import type { User as FirebaseUser } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
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
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser as User);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async (): Promise<void> => {
    try {
      // Attempt to clear the session cookie by calling the API route
      await fetch('/api/auth/session-logout', { method: 'POST' });
    } catch (error) {
      // Log if API call fails, but proceed with client-side logout
      console.error('Error clearing session cookie via /api/auth/session-logout: ', error);
      // Optionally: show a toast to the user that server-side session might still be active,
      // but client-side logout will proceed.
    }

    try {
      // Sign out from Firebase client-side
      await firebaseSignOut(auth);
    } catch (clientSignOutError) {
      // Log if client-side sign-out fails
      console.error('Error signing out from Firebase client: ', clientSignOutError);
      // Optionally: show a toast to the user about client-side logout failure.
    }
    
    // Always update client state and redirect.
    setUser(null);
    router.push('/signin');
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
