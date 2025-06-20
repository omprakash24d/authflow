
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

  const signOut = async () => {
    try {
      // Clear the session cookie by calling the API route
      await fetch('/api/auth/session-logout', { method: 'POST' });
      // Sign out from Firebase client-side
      await firebaseSignOut(auth);
      setUser(null); // Explicitly set user to null
      router.push('/signin');
    } catch (error) {
      console.error('Error signing out: ', error);
      // Handle error appropriately, e.g., show a toast notification
      // Fallback: still try to sign out client-side if API call fails
      try {
        await firebaseSignOut(auth);
      } finally {
        setUser(null);
        router.push('/signin');
      }
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
