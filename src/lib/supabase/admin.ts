// Backend Admin Operations
import { supabase } from "@/integrations/supabase/client";
import type { UserRole } from "./types";

// ============================================
// USER ROLE MANAGEMENT
// ============================================

export const adminQueries = {
  // Check if current user is admin
  isAdmin: async (): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    return !error && data !== null;
  },

  // Get user roles
  getUserRoles: async (userId: string): Promise<UserRole[]> => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data as UserRole[];
  },

  // Grant admin role (requires admin permission)
  grantAdminRole: async (userId: string): Promise<void> => {
    const { error } = await supabase
      .from('user_roles')
      .insert({ user_id: userId, role: 'admin' });

    if (error) throw error;
  },

  // Revoke admin role (requires admin permission)
  revokeAdminRole: async (userId: string): Promise<void> => {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', 'admin');

    if (error) throw error;
  },

  // Get all users with their roles (admin only)
  getAllUsersWithRoles: async () => {
    // Fetch profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) throw profilesError;

    // Fetch all user roles
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*');

    if (rolesError) throw rolesError;

    // Manually join the data
    const usersWithRoles = profiles?.map(profile => ({
      ...profile,
      user_roles: userRoles?.filter(role => role.user_id === profile.id) || []
    }));

    return usersWithRoles;
  }
};

// ============================================
// CONTENT MANAGEMENT (ADMIN ONLY)
// ============================================

export const contentManagement = {
  // Services
  createService: async (service: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('services')
      .insert({ ...service, created_by: user?.id })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  updateService: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('services')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  deleteService: async (id: string) => {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Projects
  createProject: async (project: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('projects')
      .insert({ ...project, created_by: user?.id })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  updateProject: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  deleteProject: async (id: string) => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Learn Resources
  createLearnResource: async (resource: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('learn_resources')
      .insert({ ...resource, created_by: user?.id })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  updateLearnResource: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('learn_resources')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  deleteLearnResource: async (id: string) => {
    const { error } = await supabase
      .from('learn_resources')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // FAQs
  createFAQ: async (faq: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('faqs')
      .insert({ ...faq, created_by: user?.id })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  updateFAQ: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('faqs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  deleteFAQ: async (id: string) => {
    const { error } = await supabase
      .from('faqs')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Contact Submissions Management
  getContactSubmissions: async () => {
    const { data, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  updateContactSubmission: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('contact_submissions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Policies
  createPolicy: async (policy: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('policies')
      .insert({ ...policy, created_by: user?.id })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  updatePolicy: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('policies')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  deletePolicy: async (id: string) => {
    const { error } = await supabase
      .from('policies')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
