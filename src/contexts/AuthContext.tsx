import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthService } from '@/backend/services/auth.service';

interface UserPermission {
  page_name: string;
  can_view: boolean;
  can_add: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
  authReady: boolean;
  permissions: UserPermission[];
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  hasPermission: (pageName: string, action: 'view' | 'add' | 'edit' | 'delete') => boolean;
  refreshPermissions: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const [permissions, setPermissions] = useState<UserPermission[]>([]);

  const fetchPermissions = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_permissions')
        .select('page_name, can_view, can_add, can_edit, can_delete')
        .eq('user_id', userId);
      
      if (error) throw error;
      setPermissions(data || []);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      setPermissions([]);
    }
  }, []);

  const refreshPermissions = useCallback(async () => {
    if (user?.id) {
      await fetchPermissions(user.id);
    }
  }, [user?.id, fetchPermissions]);

  const hasPermission = useCallback((pageName: string, action: 'view' | 'add' | 'edit' | 'delete'): boolean => {
    // Admins have all permissions
    if (isAdmin) return true;
    
    const permission = permissions.find(p => p.page_name === pageName);
    if (!permission) return false;
    
    switch (action) {
      case 'view': return permission.can_view;
      case 'add': return permission.can_add;
      case 'edit': return permission.can_edit;
      case 'delete': return permission.can_delete;
      default: return false;
    }
  }, [isAdmin, permissions]);

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        if (!mounted) return;
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Check admin status and fetch permissions after state update
        if (currentSession?.user) {
          setTimeout(async () => {
            if (!mounted) return;
            try {
              const isAdminVal = await AuthService.isAdmin();
              if (mounted) {
                setIsAdmin(isAdminVal);
                await fetchPermissions(currentSession.user.id);
                setAuthReady(true);
              }
            } catch (error) {
              console.error('Error checking admin status:', error);
              if (mounted) {
                setIsAdmin(false);
                setAuthReady(true);
              }
            }
          }, 0);
        } else {
          setIsAdmin(false);
          setPermissions([]);
          setAuthReady(true);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session: existingSession } }) => {
      if (!mounted) return;
      
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      
      if (existingSession?.user) {
        try {
          const adminStatus = await AuthService.isAdmin();
          if (mounted) {
            setIsAdmin(adminStatus);
            await fetchPermissions(existingSession.user.id);
          }
        } catch (error) {
          console.error('Error during session restore:', error);
          if (mounted) setIsAdmin(false);
        }
      } else {
        if (mounted) setIsAdmin(false);
      }
      if (mounted) {
        setIsLoading(false);
        setAuthReady(true);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchPermissions]);

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
    setPermissions([]);
    setAuthReady(true);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      isAdmin, 
      isLoading, 
      authReady, 
      permissions,
      signIn, 
      signUp, 
      signOut,
      hasPermission,
      refreshPermissions
    }}>
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
