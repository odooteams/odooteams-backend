/**
 * Authentication Service
 * Handles user authentication, registration, and role management
 */

import { supabase } from '@/integrations/supabase/client';
import { AppRole } from '../types/database';

export class AuthService {
  /**
   * Sign up a new user
   */
  static async signUp(email: string, password: string, fullName?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: fullName,
        },
      },
    });

    return { data, error };
  }

  /**
   * Sign in an existing user
   */
  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { data, error };
  }

  /**
   * Sign out the current user
   */
  static async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  }

  /**
   * Get current user session
   */
  static async getSession() {
    const { data, error } = await supabase.auth.getSession();
    return { session: data.session, error };
  }

  /**
   * Get current user
   */
  static async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  }

  /**
   * Check if user has a specific role
   */
  static async hasRole(userId: string, role: AppRole): Promise<boolean> {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', role)
      .single();

    return !!data;
  }

  /**
   * Check if current user is admin
   */
  static async isAdmin(): Promise<boolean> {
    const { user } = await this.getCurrentUser();
    if (!user) return false;
    return this.hasRole(user.id, 'admin');
  }

  /**
   * Get user roles
   */
  static async getUserRoles(userId: string) {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    return { roles: data?.map(r => r.role) || [], error };
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, updates: {
    full_name?: string;
    avatar_url?: string;
    phone?: string;
    company?: string;
  }) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    return { data, error };
  }

  /**
   * Get user profile
   */
  static async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    return { profile: data, error };
  }
}
