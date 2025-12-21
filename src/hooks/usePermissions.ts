import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Permission {
  page_name: string;
  can_view: boolean;
  can_add: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

export function usePermissions() {
  const { user, isAdmin } = useAuth();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && !isAdmin) {
      loadPermissions();
    } else {
      setIsLoading(false);
    }
  }, [user, isAdmin]);

  const loadPermissions = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_permissions')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      setPermissions(data || []);
    } catch (error) {
      console.error('Error loading permissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const hasPermission = (pageName: string, action: 'view' | 'add' | 'edit' | 'delete'): boolean => {
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
  };

  const getAccessiblePages = (): string[] => {
    if (isAdmin) return [];
    return permissions.filter(p => p.can_view).map(p => p.page_name);
  };

  return {
    permissions,
    isLoading,
    hasPermission,
    getAccessiblePages,
    isAdmin,
  };
}
