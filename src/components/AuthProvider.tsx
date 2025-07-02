import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, getCurrentUser, onAuthStateChange, getDemoUser, clearDemoSession } from '../lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isDemo: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    // Check for demo user first
    const demoUser = getDemoUser();
    if (demoUser) {
      setUser(demoUser);
      setIsDemo(true);
      setLoading(false);
      return;
    }

    // Get initial user from Supabase
    getCurrentUser().then((user) => {
      setUser(user);
      setIsDemo(false);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange((user) => {
      setUser(user);
      setIsDemo(false);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    if (isDemo) {
      clearDemoSession();
      setUser(null);
      setIsDemo(false);
    } else {
      const { signOut: authSignOut } = await import('../lib/auth');
      await authSignOut();
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signOut,
    isDemo
  };

  return (
    <AuthContext.Provider value={value}>
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