import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AuditLogEntry {
  action: string;
  entity_type: string;
  entity_id?: string;
  old_values?: Record<string, unknown> | null;
  new_values?: Record<string, unknown> | null;
}

export function useAuditLog() {
  const { user } = useAuth();

  const logAction = async (entry: AuditLogEntry) => {
    if (!user) return;

    try {
      const insertData = {
        user_id: user.id,
        action: entry.action,
        entity_type: entry.entity_type,
        entity_id: entry.entity_id,
        old_values: entry.old_values ? JSON.parse(JSON.stringify(entry.old_values)) : null,
        new_values: entry.new_values ? JSON.parse(JSON.stringify(entry.new_values)) : null,
        user_agent: navigator.userAgent,
      };
      
      const { error } = await supabase
        .from('audit_logs')
        .insert([insertData]);

      if (error) {
        console.error('Failed to log audit action:', error);
      }
    } catch (error) {
      console.error('Audit log error:', error);
    }
  };

  return { logAction };
}
