import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthService } from '@/backend/services/auth.service';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
  authReady: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setAuthReady(false);
        
        // Check admin status after state update
        if (session?.user) {
          setTimeout(() => {
            AuthService.isAdmin().then((isAdminVal) => {
              setIsAdmin(isAdminVal);
              setAuthReady(true);
            });
          }, 0);
        } else {
          setIsAdmin(false);
          setAuthReady(true);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const adminStatus = await AuthService.isAdmin();
        setIsAdmin(adminStatus);
      } else {
        setIsAdmin(false);
      }
      setIsLoading(false);
      setAuthReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const result = await AuthService.signIn(email, password);
    return result;
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const result = await AuthService.signUp(email, password, fullName);
    return result;
  };

  const signOut = async () => {
    await AuthService.signOut();
    setIsAdmin(false);
    setAuthReady(true);
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, isLoading, authReady, signIn, signUp, signOut }}>
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
