/**
 * Contact Service
 * Handles contact form submissions and management
 */

import { supabase } from '@/integrations/supabase/client';
import {
  ContactSubmission,
  ContactSubmissionInsert,
  ContactSubmissionUpdate,
  ContactStatus,
} from '../types/database';

export class ContactService {
  /**
   * Submit a new contact form
   */
  static async submitContact(submission: ContactSubmissionInsert) {
    const { data, error } = await supabase
      .from('contact_submissions')
      .insert(submission)
      .select()
      .single();

    return { data, error };
  }

  /**
   * Get all contact submissions (Admin only)
   */
  static async getAllSubmissions(status?: ContactStatus) {
    let query = supabase
      .from('contact_submissions')
      .select('*');

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    return { data, error };
  }

  /**
   * Get a single contact submission (Admin only)
   */
  static async getSubmissionById(id: string) {
    const { data, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .eq('id', id)
      .single();

    return { data, error };
  }

  /**
   * Update contact submission status (Admin only)
   */
  static async updateSubmission(id: string, updates: ContactSubmissionUpdate) {
    const { data, error } = await supabase
      .from('contact_submissions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  }

  /**
   * Assign contact submission to admin (Admin only)
   */
  static async assignToAdmin(submissionId: string, adminId: string) {
    return this.updateSubmission(submissionId, {
      assigned_to: adminId,
      status: 'in_progress',
    });
  }

  /**
   * Mark submission as resolved (Admin only)
   */
  static async markAsResolved(submissionId: string, notes?: string) {
    return this.updateSubmission(submissionId, {
      status: 'resolved',
      notes,
    });
  }

  /**
   * Delete contact submission (Admin only)
   */
  static async deleteSubmission(id: string) {
    const { error } = await supabase
      .from('contact_submissions')
      .delete()
      .eq('id', id);

    return { error };
  }

  /**
   * Get submission statistics (Admin only)
   */
  static async getStatistics() {
    const { data, error } = await supabase
      .from('contact_submissions')
      .select('status');

    if (error) return { stats: null, error };

    const stats = {
      total: data.length,
      new: data.filter(s => s.status === 'new').length,
      in_progress: data.filter(s => s.status === 'in_progress').length,
      resolved: data.filter(s => s.status === 'resolved').length,
      closed: data.filter(s => s.status === 'closed').length,
    };

    return { stats, error: null };
  }
}
