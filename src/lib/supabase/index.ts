// Backend Supabase Utilities - Main Export
export * from './types';
export * from './queries';
export * from './admin';
export * from './auth';

// Re-export supabase client for convenience
export { supabase } from '@/integrations/supabase/client';
